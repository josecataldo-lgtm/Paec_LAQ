import React from 'react';
import { 
  FileText, 
  Plus, 
  Settings, 
  Download, 
  Upload, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Layers, 
  BookOpen,
  School,
  AlertTriangle,
  Menu,
  X,
  ShieldCheck,
  Cloud,
  CloudCheck,
  CloudUpload,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { EscuelaConfig, TabType } from '../types';
import { SyncStatus } from '../services/cloudStorage';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  escuela: EscuelaConfig;
  onOpenSchoolSettings: () => void;
  totalStudents: number;
  activeStudents: number;
  onNewStudent?: () => void;
  onExportBackup?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  syncStatus?: SyncStatus;
  syncStatusDetails?: string;
  onManualSync?: () => void;
  onOpenCloudSettings?: () => void;
  onOpenBulkImport?: () => void;
  onPullCloudData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  escuela,
  onOpenSchoolSettings,
  totalStudents,
  activeStudents,
  onNewStudent,
  onExportBackup,
  isSidebarOpen,
  onToggleSidebar,
  syncStatus = 'local_only',
  syncStatusDetails,
  onManualSync,
  onOpenCloudSettings,
  onOpenBulkImport,
  onPullCloudData
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      {/* Top institutional strip */}
      <div className="bg-[#0F172A] text-slate-100 px-4 sm:px-6 py-1.5 text-[11px] font-medium flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Ley N° 21.545 (Ley TEA) & Res. Exenta N° 586
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">MINEDUC • Programa PIE {escuela.anoEscolar}</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-300 hidden md:inline font-mono">RBD: {escuela.rbd}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <span className="hidden lg:inline font-medium text-slate-200 truncate max-w-xs">{escuela.nombre}</span>
          <button
            id="btn-settings-header"
            onClick={onOpenSchoolSettings}
            className="text-slate-300 hover:text-white flex items-center gap-1 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors text-2xs uppercase tracking-wider font-semibold cursor-pointer"
            title="Configurar datos del establecimiento"
          >
            <Settings className="w-3 h-3" />
            <span>Configuración</span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Gestión PAEC</span>
              <span className="text-emerald-600 font-extrabold">TEA</span>
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider hidden sm:inline-block">
              Periodo {escuela.anoEscolar}
            </span>
          </div>
        </div>

        {/* Quick Actions & Cloud Sync in Header */}
        <div className="flex items-center gap-2.5">
          {/* Cloud Synchronization Status Indicator */}
          <div 
            onClick={onManualSync}
            title={syncStatusDetails || 'Estado de sincronización en la nube'}
            className={`cursor-pointer px-2.5 py-1 rounded-lg text-2xs font-semibold flex items-center gap-1.5 border transition-all ${
              syncStatus === 'synced'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : syncStatus === 'syncing'
                ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                : syncStatus === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
            ) : syncStatus === 'synced' ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ) : syncStatus === 'error' ? (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            ) : (
              <Cloud className="w-3 h-3 text-slate-500" />
            )}
            <span className="hidden md:inline">
              {syncStatus === 'synced' && 'Nube Conectada'}
              {syncStatus === 'syncing' && 'Guardando en la Nube...'}
              {syncStatus === 'offline' && 'Offline (Caché local)'}
              {syncStatus === 'local_only' && 'Guardado Local'}
              {syncStatus === 'error' && 'Error Nube (Clic reintentar)'}
            </span>
          </div>

          {onPullCloudData && (
            <button
              onClick={onPullCloudData}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-2xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar inmediatamente los datos ingresados por tus colegas"
            >
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span className="hidden sm:inline">Recargar Nube</span>
            </button>
          )}

          {onOpenBulkImport && (
            <button
              onClick={onOpenBulkImport}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors hidden sm:flex cursor-pointer"
              title="Cargar estudiantes masivamente desde Excel o CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Carga Masiva</span>
            </button>
          )}

          {onExportBackup && (
            <button
              onClick={onExportBackup}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors hidden sm:flex cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar</span>
            </button>
          )}

          {onNewStudent && (
            <button
              id="btn-new-paec-top"
              onClick={onNewStudent}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo PAEC</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
