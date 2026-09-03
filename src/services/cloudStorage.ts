import { supabase, checkIsConfigured, updateSupabaseConfig } from './supabaseClient';
import { EstudiantePAEC, HitoPedagogico, EpisodioDesregulacion, EscuelaConfig } from '../types';
import { ESTUDIANTES_INICIALES, HITOS_INICIALES, EPISODIOS_INICIALES, ESCUELA_DEFAULT } from '../data/defaultData';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'local_only';

export interface PaecAppData {
  escuela: EscuelaConfig;
  estudiantes: EstudiantePAEC[];
  hitos: HitoPedagogico[];
  episodios: EpisodioDesregulacion[];
}

type StatusListener = (status: SyncStatus, details?: string) => void;

class CloudStorageService {
  private statusListeners: Set<StatusListener> = new Set();
  private currentStatus: SyncStatus = checkIsConfigured() ? 'synced' : 'local_only';
  private saveDebounceTimer: any = null;

  public onStatusChange(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: SyncStatus, details?: string) {
    this.currentStatus = status;
    this.statusListeners.forEach(listener => listener(status, details));
  }

  public getStatus(): SyncStatus {
    return this.currentStatus;
  }

  public isCloudConnected(): boolean {
    return checkIsConfigured();
  }

  /**
   * Conectar con nuevas credenciales ingresadas por el usuario
   */
  public async configureAndSync(url: string, key: string, currentData: PaecAppData): Promise<{ success: boolean; message: string }> {
    const ok = updateSupabaseConfig(url, key);
    if (!ok) {
      this.setStatus('local_only', 'Configuración de Supabase borrada o inválida');
      return { success: false, message: 'La URL o la clave ingresada no es válida. La URL debe empezar con https://' };
    }

    this.setStatus('syncing', 'Probando conexión con Supabase...');
    try {
      if (!supabase) throw new Error('Cliente Supabase no inicializado');

      // 1. Probar lectura
      const { data, error } = await supabase
        .from('sincronizacion_global')
        .select('data, updated_at')
        .eq('id', 'main')
        .maybeSingle();

      if (error) {
        // Error de tabla no creada o permisos
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          this.setStatus('error', 'Tabla no encontrada. Ejecuta el script SQL en Supabase.');
          return { success: false, message: 'Falta crear la tabla en Supabase. Ve a Supabase > SQL Editor y ejecuta el script.' };
        }
        this.setStatus('error', error.message);
        return { success: false, message: `Error de Supabase: ${error.message}` };
      }

      // 2. Si ya hay datos en la nube, sincronizar
      if (data?.data) {
        this.setLocalCache(data.data as PaecAppData);
        this.setStatus('synced', 'Conectado exitosamente a la base de datos en la nube');
        return { success: true, message: '¡Conectado exitosamente! Datos recuperados de la nube.' };
      } else {
        // Si no hay datos en la nube aún, subir los actuales
        await this.saveToCloud(currentData);
        this.setStatus('synced', 'Conectado exitosamente y datos locales subidos a la nube');
        return { success: true, message: '¡Conectado exitosamente! Tus datos locales han sido respaldados en la nube.' };
      }
    } catch (err: any) {
      this.setStatus('error', err.message || 'Error de conexión');
      return { success: false, message: `Error al conectar con la base de datos: ${err.message}` };
    }
  }

  /**
   * Carga los datos iniciales desde la nube o caché local
   */
  public async loadInitialData(): Promise<PaecAppData> {
    const localData = this.getLocalCache();

    if (checkIsConfigured() && supabase) {
      this.setStatus('syncing', 'Conectando con la base de datos en la nube...');
      try {
        const { data, error } = await supabase
          .from('sincronizacion_global')
          .select('data, updated_at')
          .eq('id', 'main')
          .maybeSingle();

        if (error) {
          console.warn('Error al leer sincronizacion_global de Supabase:', error.message);
          this.setStatus('error', error.message);
        } else if (data?.data) {
          const cloudData = data.data as PaecAppData;
          this.setLocalCache(cloudData);
          this.setStatus('synced', 'Datos cargados desde la nube');
          return cloudData;
        } else {
          console.log('Primera sincronización: subiendo datos a Supabase...');
          await this.saveToCloud(localData);
          this.setStatus('synced', 'Nube inicializada');
          return localData;
        }
      } catch (err: any) {
        console.warn('Excepción al conectar con Supabase:', err);
        this.setStatus('offline', 'Modo sin conexión');
      }
    } else {
      try {
        const res = await fetch('/api/data', { method: 'GET' });
        if (res.ok) {
          const serverData = await res.json();
          if (serverData?.estudiantes) {
            this.setLocalCache(serverData);
            this.setStatus('synced', 'Sincronizado con servidor');
            return serverData;
          }
        }
      } catch {}
    }

    this.setStatus(checkIsConfigured() ? 'synced' : 'local_only');
    return localData;
  }

  /**
   * Guarda cambios con debounce en la nube y de forma inmediata en local
   */
  public async saveAll(appData: PaecAppData, immediate = false): Promise<void> {
    this.setLocalCache(appData);

    if (checkIsConfigured() && supabase) {
      this.setStatus('syncing', 'Guardando cambios en la nube...');
      
      if (this.saveDebounceTimer) {
        clearTimeout(this.saveDebounceTimer);
      }

      if (immediate) {
        await this.saveToCloud(appData);
      } else {
        this.saveDebounceTimer = setTimeout(async () => {
          await this.saveToCloud(appData);
        }, 1200);
      }
    } else {
      try {
        fetch('/api/data/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appData)
        }).catch(() => {});
      } catch {}
      
      this.setStatus('local_only');
    }
  }

  private async saveToCloud(appData: PaecAppData): Promise<void> {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('sincronizacion_global')
        .upsert({
          id: 'main',
          data: appData,
          version: '1.0',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error al guardar en Supabase:', error);
        this.setStatus('error', error.message);
      } else {
        this.setStatus('synced', 'Todos los cambios guardados en la nube');
      }
    } catch (err: any) {
      console.error('Excepción al guardar en la nube:', err);
      this.setStatus('offline', 'Guardado local (sin conexión a internet)');
    }
  }

  private getLocalCache(): PaecAppData {
    try {
      const st = localStorage.getItem('paec_estudiantes_v1');
      const ht = localStorage.getItem('paec_hitos_v1');
      const ep = localStorage.getItem('paec_episodios_v1');
      const sc = localStorage.getItem('paec_escuela_v1');

      return {
        estudiantes: st ? JSON.parse(st) : ESTUDIANTES_INICIALES,
        hitos: ht ? JSON.parse(ht) : HITOS_INICIALES,
        episodios: ep ? JSON.parse(ep) : EPISODIOS_INICIALES,
        escuela: sc ? JSON.parse(sc) : ESCUELA_DEFAULT
      };
    } catch {
      return {
        estudiantes: ESTUDIANTES_INICIALES,
        hitos: HITOS_INICIALES,
        episodios: EPISODIOS_INICIALES,
        escuela: ESCUELA_DEFAULT
      };
    }
  }

  private setLocalCache(data: PaecAppData): void {
    try {
      localStorage.setItem('paec_estudiantes_v1', JSON.stringify(data.estudiantes));
      localStorage.setItem('paec_hitos_v1', JSON.stringify(data.hitos));
      localStorage.setItem('paec_episodios_v1', JSON.stringify(data.episodios));
      localStorage.setItem('paec_escuela_v1', JSON.stringify(data.escuela));
    } catch (err) {
      console.warn('Error al guardar caché local:', err);
    }
  }
}

export const cloudStorage = new CloudStorageService();
