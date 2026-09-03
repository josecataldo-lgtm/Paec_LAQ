import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  FilePlus, 
  Eye, 
  X,
  GraduationCap
} from 'lucide-react';
import { PLANTILLAS_PREDEFINIDAS } from '../data/templates';
import { PlantillaPAEC, EstudiantePAEC } from '../types';

interface TemplateCatalogProps {
  onApplyTemplateToNew: (template: PlantillaPAEC) => void;
  onApplyTemplateToExisting: (template: PlantillaPAEC, studentId: string) => void;
  estudiantes: EstudiantePAEC[];
}

export const TemplateCatalog: React.FC<TemplateCatalogProps> = ({
  onApplyTemplateToNew,
  onApplyTemplateToExisting,
  estudiantes
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PlantillaPAEC | null>(null);
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Catalog Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Ley TEA N° 21.545 & Res. Exenta N° 586
            </span>
            <span className="text-2xs text-slate-400">MINEDUC Chile</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Biblioteca de Plantillas Automáticas PAEC
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Modelos preconfigurados con gatillantes, contenciones preventivas/reactivas e hitos pedagógicos diseñados por especialistas PIE según nivel de apoyo TEA y etapa educativa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-center">
            <span className="text-lg font-extrabold text-amber-300">{PLANTILLAS_PREDEFINIDAS.length}</span>
            <span className="block text-2xs text-slate-300">Plantillas Oficiales</span>
          </div>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PLANTILLAS_PREDEFINIDAS.map((template) => {
          const nivelBadge = template.nivelTea.includes('Nivel 1')
            ? { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'TEA Nivel 1 (Leve)' }
            : template.nivelTea.includes('Nivel 2')
            ? { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'TEA Nivel 2 (Sustancial)' }
            : { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'TEA Nivel 3 (Muy Sustancial)' };

          return (
            <div 
              key={template.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all hover:border-indigo-300 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-2xs font-semibold rounded-full border ${nivelBadge.bg}`}>
                    {nivelBadge.label}
                  </span>
                  <span className="px-2 py-0.5 text-2xs font-medium bg-slate-100 text-slate-700 rounded-full flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-slate-500" />
                    {template.etapaEducativa}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {template.nombre}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {template.descripcion}
                </p>

                {/* Strategy Counters */}
                <div className="pt-2 grid grid-cols-3 gap-1.5 text-center text-2xs">
                  <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-lg">
                    <span className="font-bold text-slate-800 block">{template.planContextual.length}</span>
                    <span className="text-slate-500">Contextuales</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-lg">
                    <span className="font-bold text-slate-800 block">{template.planSensorial.length}</span>
                    <span className="text-slate-500">Sensoriales</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-lg">
                    <span className="font-bold text-slate-800 block">{template.planRelacional.length}</span>
                    <span className="text-slate-500">Relacionales</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(template)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Contenido</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowApplyModal(true);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                  >
                    <span>Aplicar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onApplyTemplateToNew(template)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>Nuevo PAEC</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && !showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <span className="text-2xs font-semibold text-amber-300 uppercase tracking-wider">
                  Plantilla Oficial • {selectedTemplate.nivelTea}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedTemplate.nombre}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Descripción Pedagógica:</span>
                <p className="text-slate-600 leading-relaxed">{selectedTemplate.descripcion}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider block mb-2 text-2xs">
                  Estrategias del Plan de Apoyo (Resolución Exenta N° 586)
                </span>
                <div className="space-y-3">
                  {/* Contextual */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                    <span className="font-semibold text-indigo-900 text-2xs uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      1. Elementos Contextuales ({selectedTemplate.planContextual.length})
                    </span>
                    {selectedTemplate.planContextual.map((item, i) => (
                      <div key={i} className="pl-3 border-l-2 border-indigo-200 text-2xs space-y-1">
                        <p><strong>Gatillante:</strong> {item.accionGatillante}</p>
                        <p className="text-slate-600"><strong>Contención:</strong> {item.respuestaContencion}</p>
                        <p className="text-slate-400 font-mono"><strong>Mediador:</strong> {item.adultoMediador}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sensorial */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                    <span className="font-semibold text-emerald-900 text-2xs uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      2. Elementos Sensoriales ({selectedTemplate.planSensorial.length})
                    </span>
                    {selectedTemplate.planSensorial.map((item, i) => (
                      <div key={i} className="pl-3 border-l-2 border-emerald-200 text-2xs space-y-1">
                        <p><strong>Gatillante:</strong> {item.accionGatillante}</p>
                        <p className="text-slate-600"><strong>Contención:</strong> {item.respuestaContencion}</p>
                        <p className="text-slate-400 font-mono"><strong>Mediador:</strong> {item.adultoMediador}</p>
                      </div>
                    ))}
                  </div>

                  {/* Relacional */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                    <span className="font-semibold text-amber-900 text-2xs uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      3. Elementos Relacionales ({selectedTemplate.planRelacional.length})
                    </span>
                    {selectedTemplate.planRelacional.map((item, i) => (
                      <div key={i} className="pl-3 border-l-2 border-amber-200 text-2xs space-y-1">
                        <p><strong>Gatillante:</strong> {item.accionGatillante}</p>
                        <p className="text-slate-600"><strong>Contención:</strong> {item.respuestaContencion}</p>
                        <p className="text-slate-400 font-mono"><strong>Mediador:</strong> {item.adultoMediador}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedTemplate.hitosSugeridos?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider block mb-2 text-2xs">
                    Hitos Pedagógicos Pre-asociados ({selectedTemplate.hitosSugeridos.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTemplate.hitosSugeridos.map((h, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-2xs">
                        <span className="font-bold text-slate-800 block mb-0.5">{h.titulo}</span>
                        <p className="text-slate-600">{h.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cerrar
              </button>

              <button
                onClick={() => setShowApplyModal(true)}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg"
              >
                Aplicar a Estudiante Existente
              </button>

              <button
                onClick={() => {
                  onApplyTemplateToNew(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <FilePlus className="w-4 h-4" />
                <span>Crear Nuevo PAEC con esta Plantilla</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply to Existing Student Modal */}
      {selectedTemplate && showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Aplicar Plantilla a Estudiante
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Selecciona el estudiante existente al cual deseas anexar las estrategias y diagnóstico de la plantilla <strong>"{selectedTemplate.nombre}"</strong>:
              </p>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estudiante Destino *
                </label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecciona un estudiante...</option>
                  {estudiantes.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nombre} ({st.curso || 'Sin curso'}) - RUT: {st.rut}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-2xs text-amber-900">
                <strong>Nota:</strong> Se integrarán las estrategias contextuales, sensoriales y relacionales de la plantilla sin borrar los datos personales previamente ingresados del estudiante.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!targetStudentId}
                  onClick={() => {
                    if (targetStudentId) {
                      onApplyTemplateToExisting(selectedTemplate, targetStudentId);
                      setShowApplyModal(false);
                      setSelectedTemplate(null);
                    }
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs"
                >
                  Confirmar e Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
