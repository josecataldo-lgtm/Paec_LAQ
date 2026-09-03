import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  ShieldCheck,
  Server,
  Upload,
  Download,
  Info
} from 'lucide-react';
import { cloudStorage, SyncStatus, PaecAppData } from '../services/cloudStorage';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface CloudDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  syncDetails?: string;
  appData: PaecAppData;
  onForceSync: () => Promise<void>;
}

export const CloudDatabaseModal: React.FC<CloudDatabaseModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  syncDetails,
  appData,
  onForceSync
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncSuccessMessage(null);
    try {
      await onForceSync();
      setSyncSuccessMessage('¡Sincronización completada exitosamente!');
    } catch (e: any) {
      setSyncSuccessMessage(`Error: ${e.message || 'No se pudo sincronizar'}`);
    } finally {
      setSyncing(false);
    }
  };

  const sqlQuickCopy = `-- Ejecutar en el SQL Editor de Supabase:
CREATE TABLE IF NOT EXISTS sincronizacion_global (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  version TEXT DEFAULT '1.0',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sincronizacion_global ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso Publico" ON sincronizacion_global FOR ALL USING (true) WITH CHECK (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuickCopy);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Almacenamiento y Base de Datos en la Nube</span>
              </h2>
              <p className="text-xs text-slate-400">
                Sincronización de expedientes PAEC entre computadores y docentes
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700 flex-1">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
            isSupabaseConfigured
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-amber-50/70 border-amber-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Estado de Conexión:</span>
                <span className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                  isSupabaseConfigured
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}>
                  {isSupabaseConfigured ? 'Nube Supabase Conectada' : 'Almacenamiento Local (Listo para Nube)'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {isSupabaseConfigured
                  ? 'La aplicación está conectada a la base de datos en la nube. Todos los cambios se respaldan y sincronizan automáticamente.'
                  : 'Actualmente los datos se guardan en el navegador local. Para habilitar la sincronización en la nube multi-usuario, conecta tu base de datos gratuita de Supabase.'}
              </p>
              {syncDetails && (
                <p className="text-2xs font-mono text-slate-500 pt-1">
                  Detalle: {syncDetails}
                </p>
              )}
            </div>

            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
            </button>
          </div>

          {syncSuccessMessage && (
            <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          {/* Counts & Statistics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-2xs text-slate-500 uppercase font-bold block">Estudiantes</span>
              <span className="text-lg font-black text-slate-900">{appData.estudiantes.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-2xs text-slate-500 uppercase font-bold block">Hitos Activos</span>
              <span className="text-lg font-black text-slate-900">{appData.hitos.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-2xs text-slate-500 uppercase font-bold block">Bitácora Incidentes</span>
              <span className="text-lg font-black text-slate-900">{appData.episodios.length}</span>
            </div>
          </div>

          {/* Quick Setup Guide for Cloud Database */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Pasos para Conectar la Nube Gratuita (Supabase / Vercel)
            </h3>

            <div className="space-y-2.5">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-2xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-semibold text-slate-900">Crea tu proyecto gratuito en Supabase</p>
                  <p className="text-slate-500 text-2xs">
                    Entra a <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">supabase.com</a> y crea una cuenta gratuita y un nuevo proyecto.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-2xs flex items-center justify-center shrink-0">2</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Copia y pega la tabla en el SQL Editor de Supabase</p>
                  <p className="text-slate-500 text-2xs mb-1.5">
                    En tu panel de Supabase ve a <strong>SQL Editor</strong> y ejecuta esta sentencia:
                  </p>
                  <div className="relative bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto">
                    <pre>{sqlQuickCopy}</pre>
                    <button
                      onClick={handleCopySql}
                      className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-2xs font-sans font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedScript ? 'Copiado' : 'Copiar SQL'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-2xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-semibold text-slate-900">Agrega las 2 variables en tu archivo .env o en Vercel</p>
                  <div className="bg-slate-100 p-2 rounded-lg font-mono text-[11px] text-slate-800 space-y-0.5 border border-slate-200 mt-1">
                    <p>VITE_SUPABASE_URL=https://tu-proyecto.supabase.co</p>
                    <p>VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-2xs text-slate-500">
            Respaldo automático conforme a Ley TEA N° 21.545
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
