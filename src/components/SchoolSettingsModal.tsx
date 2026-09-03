import React, { useState } from 'react';
import { X, School, Save, Building, MapPin, UserCheck, Shield } from 'lucide-react';
import { EscuelaConfig } from '../types';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  escuela: EscuelaConfig;
  onSave: (nuevaConfig: EscuelaConfig) => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  escuela,
  onSave
}) => {
  const [formData, setFormData] = useState<EscuelaConfig>({ ...escuela });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configuración del Establecimiento</h2>
              <p className="text-xs text-slate-300">Datos institucionales para los documentos y reportes PAEC</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nombre del Establecimiento Educacional *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.nombreEstablecimiento}
                onChange={(e) => setFormData({ ...formData, nombreEstablecimiento: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                placeholder="Ej. Liceo Agrícola de Quillota Profesor Víctor Olguín Morales"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                RBD (Rol Base de Datos) *
              </label>
              <input
                type="text"
                required
                value={formData.rbd}
                onChange={(e) => setFormData({ ...formData, rbd: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                placeholder="Ej. 1452-3"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Dependencia Administrativa
              </label>
              <select
                value={formData.dependencia}
                onChange={(e) => setFormData({ ...formData, dependencia: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="Municipal">Municipal / DAEM</option>
                <option value="SLEP">Servicio Local de Educación (SLEP)</option>
                <option value="Particular Subvencionado">Particular Subvencionado</option>
                <option value="Particular Pagado">Particular Pagado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Comuna
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.comuna}
                  onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  placeholder="Ej. Quillota"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Región
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                placeholder="Ej. Región de Valparaíso"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Autoridades y Responsables PIE</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Director(a) del Establecimiento
                </label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  placeholder="Ej. Prof. Mario Valenzuela Sepúlveda"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Coordinador(a) PIE
                </label>
                <input
                  type="text"
                  value={formData.coordinadorPie}
                  onChange={(e) => setFormData({ ...formData, coordinadorPie: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  placeholder="Ej. Mg. Claudia Arancibia Fuentes"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Encargado(a) de Convivencia Escolar
              </label>
              <input
                type="text"
                value={formData.encargadoConvivencia}
                onChange={(e) => setFormData({ ...formData, encargadoConvivencia: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                placeholder="Ej. Ps. Rodrigo Morales Silva"
              />
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-900 flex items-start gap-2">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Estos datos aparecerán automáticamente en el membrete oficial del <strong>Plan de Acompañamiento Emocional y Conductual (Resolución Exenta N° 586)</strong> y en las actas de toma de conocimiento.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
