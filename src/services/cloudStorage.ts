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

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  label: string;
  data: PaecAppData;
}

type StatusListener = (status: SyncStatus, details?: string) => void;
type DataListener = (data: PaecAppData, isFromOtherUser: boolean) => void;

// Identificador único de pestaña/sesión
const CLIENT_ID = Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);

/**
 * Fusión Inteligente de Datos Multi-usuario
 * Da prioridad a los datos guardados por colegas en la nube sin perder creaciones locales no subidas.
 */
export function smartMergeData(
  cloudData: PaecAppData | null | undefined, 
  localData: PaecAppData | null | undefined,
  deletedIds: Set<string> = new Set(),
  preferCloud: boolean = true
): PaecAppData {
  if (!cloudData && !localData) {
    return {
      estudiantes: ESTUDIANTES_INICIALES,
      hitos: HITOS_INICIALES,
      episodios: EPISODIOS_INICIALES,
      escuela: ESCUELA_DEFAULT
    };
  }

  if (!cloudData) return localData!;
  if (!localData) return cloudData!;

  // 1. Fusionar Estudiantes
  const studentMap = new Map<string, EstudiantePAEC>();

  // Cargar primero TODOS los estudiantes de la nube (datos de colegas)
  (cloudData.estudiantes || []).forEach(st => {
    if (!deletedIds.has(st.id)) {
      studentMap.set(st.id, st);
    }
  });

  // Agregar estudiantes locales que sean NUEVOS (creados localmente y aún no subidos)
  (localData.estudiantes || []).forEach(localSt => {
    if (!deletedIds.has(localSt.id)) {
      if (!studentMap.has(localSt.id)) {
        studentMap.set(localSt.id, localSt);
      } else if (!preferCloud) {
        const cloudSt = studentMap.get(localSt.id)!;
        const cloudTime = new Date(cloudSt.actualizadoEl || 0).getTime();
        const localTime = new Date(localSt.actualizadoEl || 0).getTime();
        if (localTime > cloudTime) {
          studentMap.set(localSt.id, localSt);
        }
      }
    }
  });

  // 2. Fusionar Hitos Pedagógicos
  const hitosMap = new Map<string, HitoPedagogico>();
  (cloudData.hitos || []).forEach(h => {
    if (!deletedIds.has(h.id)) hitosMap.set(h.id, h);
  });
  (localData.hitos || []).forEach(localH => {
    if (!deletedIds.has(localH.id) && !hitosMap.has(localH.id)) {
      hitosMap.set(localH.id, localH);
    }
  });

  // 3. Fusionar Episodios de Desregulación (Bitácora)
  const episodiosMap = new Map<string, EpisodioDesregulacion>();
  (cloudData.episodios || []).forEach(ep => {
    if (!deletedIds.has(ep.id)) episodiosMap.set(ep.id, ep);
  });
  (localData.episodios || []).forEach(localEp => {
    if (!deletedIds.has(localEp.id) && !episodiosMap.has(localEp.id)) {
      episodiosMap.set(localEp.id, localEp);
    }
  });

  // 4. Fusionar Configuración de la Escuela
  const escuelaMerged: EscuelaConfig = {
    ...(localData.escuela || ESCUELA_DEFAULT),
    ...(cloudData.escuela || {})
  };

  return {
    estudiantes: Array.from(studentMap.values()),
    hitos: Array.from(hitosMap.values()),
    episodios: Array.from(episodiosMap.values()),
    escuela: escuelaMerged
  };
}

class CloudStorageService {
  private statusListeners: Set<StatusListener> = new Set();
  private dataListeners: Set<DataListener> = new Set();
  private currentStatus: SyncStatus = checkIsConfigured() ? 'synced' : 'local_only';
  private saveDebounceTimer: any = null;
  private realtimeChannel: any = null;
  private pollIntervalTimer: any = null;
  private lastCloudUpdatedAt: string | null = null;
  private isSavingNow = false;
  private deletedIds: Set<string> = new Set();

  constructor() {
    this.loadDeletedIds();
  }

  private loadDeletedIds() {
    try {
      const saved = localStorage.getItem('paec_deleted_ids_v1');
      if (saved) {
        this.deletedIds = new Set(JSON.parse(saved));
      }
    } catch {}
  }

  private saveDeletedIds() {
    try {
      localStorage.setItem('paec_deleted_ids_v1', JSON.stringify(Array.from(this.deletedIds)));
    } catch {}
  }

  public registerDeletion(id: string) {
    this.deletedIds.add(id);
    this.saveDeletedIds();
  }

  public onStatusChange(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => this.statusListeners.delete(listener);
  }

  public onDataChange(listener: DataListener) {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }

  private setStatus(status: SyncStatus, details?: string) {
    this.currentStatus = status;
    this.statusListeners.forEach(listener => listener(status, details));
  }

  private notifyDataListeners(data: PaecAppData, isFromOtherUser: boolean) {
    this.dataListeners.forEach(listener => listener(data, isFromOtherUser));
  }

  public getStatus(): SyncStatus {
    return this.currentStatus;
  }

  public isCloudConnected(): boolean {
    return checkIsConfigured();
  }

  /**
   * Conectar con nuevas credenciales e importar inmediatamente los datos de la nube
   */
  public async configureAndSync(url: string, key: string, currentData: PaecAppData): Promise<{ success: boolean; message: string }> {
    const ok = updateSupabaseConfig(url, key);
    if (!ok) {
      this.stopRealtimeSubscription();
      this.setStatus('local_only', 'Configuración de Supabase borrada o inválida');
      return { success: false, message: 'La URL o la clave ingresada no es válida.' };
    }

    this.setStatus('syncing', 'Conectando con Supabase...');
    try {
      if (!supabase) throw new Error('Cliente Supabase no inicializado');

      const { data, error } = await supabase
        .from('sincronizacion_global')
        .select('data, updated_at, client_id')
        .eq('id', 'main')
        .maybeSingle();

      if (error) {
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          this.setStatus('error', 'Tabla no encontrada. Ejecuta el script SQL en Supabase.');
          return { success: false, message: 'Falta crear la tabla en Supabase. Ve a Supabase > SQL Editor y ejecuta el script.' };
        }
        this.setStatus('error', error.message);
        return { success: false, message: `Error de Supabase: ${error.message}` };
      }

      if (data?.data) {
        this.lastCloudUpdatedAt = data.updated_at;
        const merged = smartMergeData(data.data as PaecAppData, currentData, this.deletedIds, true);
        this.setLocalCache(merged);
        this.setStatus('synced', '¡Conectado! Datos de tus colegas recuperados de la nube');
        this.notifyDataListeners(merged, true);
        this.startRealtimeSubscription();
        return { success: true, message: '¡Conectado exitosamente! Datos de colegas descargados de la nube.' };
      } else {
        await this.saveToCloud(currentData);
        this.setStatus('synced', 'Conectado y datos subidos a la nube');
        this.startRealtimeSubscription();
        return { success: true, message: '¡Conectado! Tus datos locales han sido guardados en la nube.' };
      }
    } catch (err: any) {
      this.setStatus('error', err.message || 'Error de conexión');
      return { success: false, message: `Error de conexión: ${err.message}` };
    }
  }

  /**
   * Forzar descarga directa de los datos más recientes de los colegas desde la nube
   */
  public async pullLatestFromCloud(): Promise<PaecAppData | null> {
    if (!checkIsConfigured() || !supabase) return null;
    this.setStatus('syncing', 'Descargando datos recientes de colegas...');
    try {
      const { data, error } = await supabase
        .from('sincronizacion_global')
        .select('data, updated_at')
        .eq('id', 'main')
        .maybeSingle();

      if (!error && data?.data) {
        const cloudData = data.data as PaecAppData;
        this.lastCloudUpdatedAt = data.updated_at;
        const local = this.getLocalCache();
        const merged = smartMergeData(cloudData, local, this.deletedIds, true);
        this.setLocalCache(merged);
        this.setStatus('synced', 'Datos actualizados desde la nube');
        this.notifyDataListeners(merged, true);
        return merged;
      }
    } catch (e) {
      console.error('Error al descargar de la nube:', e);
      this.setStatus('error', 'Error al descargar datos de la nube');
    }
    return null;
  }

  /**
   * Carga los datos iniciales priorizando la información de la nube (colegas)
   */
  public async loadInitialData(): Promise<PaecAppData> {
    const localData = this.getLocalCache();

    if (checkIsConfigured() && supabase) {
      this.setStatus('syncing', 'Descargando expedientes desde la nube...');
      try {
        const { data, error } = await supabase
          .from('sincronizacion_global')
          .select('data, updated_at, client_id')
          .eq('id', 'main')
          .maybeSingle();

        if (error) {
          console.warn('Error al leer de Supabase:', error.message);
          this.setStatus('error', error.message);
        } else if (data?.data) {
          this.lastCloudUpdatedAt = data.updated_at;
          const cloudData = data.data as PaecAppData;
          const mergedData = smartMergeData(cloudData, localData, this.deletedIds, true);
          this.setLocalCache(mergedData);
          this.pushSnapshot(mergedData, 'Carga inicial desde la nube');
          this.setStatus('synced', 'Conectado a la nube');
          this.startRealtimeSubscription();
          return mergedData;
        } else {
          await this.saveToCloud(localData);
          this.setStatus('synced', 'Nube inicializada');
          this.startRealtimeSubscription();
          return localData;
        }
      } catch (err: any) {
        console.warn('Excepción al conectar con Supabase:', err);
        this.setStatus('offline', 'Modo sin conexión');
      }
    }

    return localData;
  }

  /**
   * Inicia la suscripción en tiempo real (WebSockets + Polling)
   */
  public startRealtimeSubscription() {
    if (!checkIsConfigured() || !supabase) return;

    if (!this.realtimeChannel) {
      try {
        this.realtimeChannel = supabase
          .channel('paec-realtime-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'sincronizacion_global',
              filter: 'id=eq.main'
            },
            (payload: any) => {
              const record = payload.new;
              if (record && record.data) {
                const isFromOther = record.client_id !== CLIENT_ID;
                if (isFromOther && !this.isSavingNow) {
                  this.lastCloudUpdatedAt = record.updated_at;
                  const local = this.getLocalCache();
                  const merged = smartMergeData(record.data as PaecAppData, local, this.deletedIds, true);
                  this.setLocalCache(merged);
                  this.pushSnapshot(merged, 'Actualización de colegas');
                  this.setStatus('synced', 'Sincronizado en tiempo real');
                  this.notifyDataListeners(merged, true);
                }
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('🟢 Supabase Realtime activo');
            }
          });
      } catch (err) {
        console.warn('No se pudo inicializar WebSocket Realtime:', err);
      }
    }

    if (!this.pollIntervalTimer) {
      this.pollIntervalTimer = setInterval(() => {
        this.checkCloudUpdates();
      }, 6000);
    }

    if (typeof window !== 'undefined') {
      const handleFocusOrVisibility = () => {
        if (document.visibilityState === 'visible') {
          this.checkCloudUpdates();
        }
      };
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
      window.addEventListener('focus', handleFocusOrVisibility);
      document.addEventListener('visibilitychange', handleFocusOrVisibility);
    }
  }

  public stopRealtimeSubscription() {
    if (this.realtimeChannel && supabase) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    if (this.pollIntervalTimer) {
      clearInterval(this.pollIntervalTimer);
      this.pollIntervalTimer = null;
    }
  }

  public async checkCloudUpdates(): Promise<boolean> {
    if (!checkIsConfigured() || !supabase || this.isSavingNow) return false;
    try {
      const { data, error } = await supabase
        .from('sincronizacion_global')
        .select('updated_at, client_id, data')
        .eq('id', 'main')
        .maybeSingle();

      if (!error && data && data.updated_at) {
        if (this.lastCloudUpdatedAt && data.updated_at > this.lastCloudUpdatedAt && data.client_id !== CLIENT_ID) {
          this.lastCloudUpdatedAt = data.updated_at;
          if (data.data) {
            const local = this.getLocalCache();
            const merged = smartMergeData(data.data as PaecAppData, local, this.deletedIds, true);
            this.setLocalCache(merged);
            this.pushSnapshot(merged, 'Actualización por polling');
            this.setStatus('synced', 'Actualizado desde la nube');
            this.notifyDataListeners(merged, true);
            return true;
          }
        } else if (!this.lastCloudUpdatedAt) {
          this.lastCloudUpdatedAt = data.updated_at;
        }
      }
    } catch (e) {}
    return false;
  }

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
      this.setStatus('local_only');
    }
  }

  private async saveToCloud(localData: PaecAppData): Promise<void> {
    if (!supabase) return;
    this.isSavingNow = true;
    try {
      const { data: cloudRow } = await supabase
        .from('sincronizacion_global')
        .select('data')
        .eq('id', 'main')
        .maybeSingle();

      const mergedData = smartMergeData(cloudRow?.data as PaecAppData | null, localData, this.deletedIds, false);

      const now = new Date().toISOString();
      const { error } = await supabase
        .from('sincronizacion_global')
        .upsert({
          id: 'main',
          data: mergedData,
          version: '1.0',
          client_id: CLIENT_ID,
          updated_at: now
        });

      if (error) {
        console.error('Error al guardar en Supabase:', error);
        this.setStatus('error', error.message);
      } else {
        this.lastCloudUpdatedAt = now;
        this.setLocalCache(mergedData);
        this.pushSnapshot(mergedData, 'Guardado automático');
        this.setStatus('synced', 'Guardado en la nube sin sobreescritura');
      }
    } catch (err: any) {
      console.error('Excepción al guardar en la nube:', err);
      this.setStatus('offline', 'Guardado local');
    } finally {
      setTimeout(() => {
        this.isSavingNow = false;
      }, 500);
    }
  }

  public getHistorySnapshots(): BackupSnapshot[] {
    try {
      const saved = localStorage.getItem('paec_history_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private pushSnapshot(data: PaecAppData, label: string) {
    try {
      const snapshots = this.getHistorySnapshots();
      const newSnap: BackupSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toLocaleString('es-CL'),
        label,
        data
      };

      const updated = [newSnap, ...snapshots.slice(0, 14)];
      localStorage.setItem('paec_history_snapshots', JSON.stringify(updated));
    } catch {}
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
