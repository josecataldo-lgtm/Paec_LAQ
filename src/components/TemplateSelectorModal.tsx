import React, { useState } from 'react';
import { X, Layers, Check, Sparkles, BookOpen } from 'lucide-react';
import { PLANTILLAS_PREDEFINIDAS } from '../data/templates';
import { PlantillaPAEC } from '../types';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PlantillaPAEC, options: { replaceStrategies: boolean; replaceDiagnosis: boolean; replaceHistory: boolean }) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [selectedId, setSelectedId] = useState<string>(PLANTILLAS_PREDEFINIDAS[0].id);
  const [replaceStrategies, setReplaceStrategies] = useState(true);
  const [replaceDiagnosis, setReplaceDiagnosis] = useState(true);
  const [replaceHistory, setReplaceHistory] = useState(true);

  if (!isOpen) return null;

  const currentTemplate = PLANTILLAS_PREDEFINIDAS.find(p => p.id === selectedId) || PLANTILLAS_PREDEFINIDAS[0];

  const handleConfirm = () => {
    onSelectTemplate(currentTemplate, {
      replaceStrategies,
      replaceDiagnosis,
      replaceHistory
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cargar Plantilla Automática</h3>
              <p className="text-xs text-slate-300">Modelos estandarizados según normativa TEA y Resolución Exenta N° 586</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Selecciona una Plantilla Normativa
            </label>
            <div className="space-y-2">
              {PLANTILLAS_PREDEFINIDAS.map((plantilla) => (
                <label
                  key={plantilla.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedId === plantilla.id
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="plantillaOption"
                    checked={selectedId === plantilla.id}
                    onChange={() => setSelectedId(plantilla.id)}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{plantilla.nombre}</span>
                      <span className="text-2xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                        {plantilla.nivelTea}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 line-clamp-2">{plantilla.descripcion}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Opciones de Importación
            </span>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceStrategies}
                  onChange={(e) => setReplaceStrategies(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Importar matriz de estrategias (Contextuales, Sensoriales y Relacionales)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceDiagnosis}
                  onChange={(e) => setReplaceDiagnosis(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Aplicar sugerencias de diagnóstico PIE y comorbilidades</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceHistory}
                  onChange={(e) => setReplaceHistory(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Cargar texto guía en antecedentes socioemocionales y desregulación</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar a este PAEC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
