import React, { useState } from 'react';
import { 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  Layers, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  User, 
  HeartHandshake, 
  Stethoscope, 
  Clock, 
  ShieldAlert, 
  PenTool, 
  RefreshCw,
  Info,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { 
  EstudiantePAEC, 
  ItemPlanApoyo, 
  FirmaTomaConocimiento, 
  CambioTratamiento, 
  PersonaContacto,
  NivelTea
} from '../types';
import { 
  formatRut, 
  validateRut, 
  calculateAge, 
  MEDICAMENTOS_COMUNES, 
  COMORBILIDADES_COMUNES, 
  CURSOS_CHILE 
} from '../utils/helpers';

interface PaecEditorProps {
  student: EstudiantePAEC;
  onSaveStudent: (student: EstudiantePAEC) => void;
  onOpenTemplateSelector: () => void;
  onViewDocument: (student: EstudiantePAEC) => void;
}

export const PaecEditor: React.FC<PaecEditorProps> = ({
  student,
  onSaveStudent,
  onOpenTemplateSelector,
  onViewDocument
}) => {
  const [data, setData] = useState<EstudiantePAEC>({ ...student });
  const [activeSection, setActiveSection] = useState<'objetivo' | 'identificacion' | 'contactos' | 'diagnostico' | 'tratamiento' | 'socioemocional' | 'fechas' | 'plan-apoyo' | 'firmas'>('identificacion');
  const [planSubTab, setPlanSubTab] = useState<'contextual' | 'sensorial' | 'relacional'>('contextual');
  const [loadingAi, setLoadingAi] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [rutError, setRutError] = useState<string | null>(null);

  // Sync state if student prop changes
  React.useEffect(() => {
    setData({ ...student });
  }, [student.id]);

  const handleSave = () => {
    const updated = {
      ...data,
      actualizadoEl: new Date().toISOString().split('T')[0]
    };
    onSaveStudent(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleRutChange = (val: string) => {
    const formatted = formatRut(val);
    setData({ ...data, rut: formatted });
    if (formatted.length >= 8 && !validateRut(formatted)) {
      setRutError('RUT inválido (revise dígito verificador)');
    } else {
      setRutError(null);
    }
  };

  const handleBirthDateChange = (val: string) => {
    const ageStr = calculateAge(val);
    setData({
      ...data,
      fechaNacimiento: val,
      edad: ageStr
    });
  };

  // Plan de Apoyo Helpers
  const addPlanItem = (dimension: 'contextual' | 'sensorial' | 'relacional') => {
    const newItem: ItemPlanApoyo = {
      id: `item-${Date.now()}`,
      dimension,
      accionGatillante: '',
      respuestaContencion: '',
      adultoMediador: 'Educadora Diferencial PIE / Asistente de Aula'
    };

    if (dimension === 'contextual') {
      setData({ ...data, planApoyoContextual: [...data.planApoyoContextual, newItem] });
    } else if (dimension === 'sensorial') {
      setData({ ...data, planApoyoSensorial: [...data.planApoyoSensorial, newItem] });
    } else {
      setData({ ...data, planApoyoRelacional: [...data.planApoyoRelacional, newItem] });
    }
  };

  const updatePlanItem = (dimension: 'contextual' | 'sensorial' | 'relacional', id: string, field: keyof ItemPlanApoyo, value: string) => {
    if (dimension === 'contextual') {
      setData({
        ...data,
        planApoyoContextual: data.planApoyoContextual.map(it => it.id === id ? { ...it, [field]: value } : it)
      });
    } else if (dimension === 'sensorial') {
      setData({
        ...data,
        planApoyoSensorial: data.planApoyoSensorial.map(it => it.id === id ? { ...it, [field]: value } : it)
      });
    } else {
      setData({
        ...data,
        planApoyoRelacional: data.planApoyoRelacional.map(it => it.id === id ? { ...it, [field]: value } : it)
      });
    }
  };

  const removePlanItem = (dimension: 'contextual' | 'sensorial' | 'relacional', id: string) => {
    if (dimension === 'contextual') {
      setData({ ...data, planApoyoContextual: data.planApoyoContextual.filter(it => it.id !== id) });
    } else if (dimension === 'sensorial') {
      setData({ ...data, planApoyoSensorial: data.planApoyoSensorial.filter(it => it.id !== id) });
    } else {
      setData({ ...data, planApoyoRelacional: data.planApoyoRelacional.filter(it => it.id !== id) });
    }
  };

  // AI Strategy Generator
  const generateAiStrategies = async (dimension: 'contextual' | 'sensorial' | 'relacional') => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/generate-strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: data,
          sectionType: dimension,
          currentEntries: dimension === 'contextual' 
            ? data.planApoyoContextual 
            : dimension === 'sensorial' 
            ? data.planApoyoSensorial 
            : data.planApoyoRelacional
        })
      });
      const result = await res.json();
      if (result.strategies && Array.isArray(result.strategies)) {
        const newItems: ItemPlanApoyo[] = result.strategies.map((st: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          dimension,
          accionGatillante: st.gatillante || '',
          respuestaContencion: st.contencion || '',
          adultoMediador: st.adultoMediador || 'Educadora PIE / Profesor Jefe'
        }));

        if (dimension === 'contextual') {
          setData(prev => ({ ...prev, planApoyoContextual: [...prev.planApoyoContextual, ...newItems] }));
        } else if (dimension === 'sensorial') {
          setData(prev => ({ ...prev, planApoyoSensorial: [...prev.planApoyoSensorial, ...newItems] }));
        } else {
          setData(prev => ({ ...prev, planApoyoRelacional: [...prev.planApoyoRelacional, ...newItems] }));
        }
      }
    } catch (err) {
      console.error('Error generating AI strategies:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Medication Changes Helper
  const addMedicationChange = () => {
    const newChange: CambioTratamiento = {
      id: `cambio-${Date.now()}`,
      descripcion: '',
      informante: 'Apoderado(a)',
      fecha: new Date().toISOString().split('T')[0]
    };
    setData({
      ...data,
      tratamientoMedico: {
        ...data.tratamientoMedico,
        cambios: [...data.tratamientoMedico.cambios, newChange]
      }
    });
  };

  const removeMedicationChange = (id: string) => {
    setData({
      ...data,
      tratamientoMedico: {
        ...data.tratamientoMedico,
        cambios: data.tratamientoMedico.cambios.filter(c => c.id !== id)
      }
    });
  };

  // Signatures helper
  const addSignatureRow = () => {
    const newRow: FirmaTomaConocimiento = {
      id: `tk-${Date.now()}`,
      nombre: '',
      rol: 'Profesor(a) Jefe',
      firmado: false,
      fechaFirma: new Date().toISOString().split('T')[0]
    };
    setData({
      ...data,
      tomaConocimiento: [...data.tomaConocimiento, newRow]
    });
  };

  const removeSignatureRow = (id: string) => {
    setData({
      ...data,
      tomaConocimiento: data.tomaConocimiento.filter(t => t.id !== id)
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Action & Status Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
            PAEC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {data.nombre || 'Nuevo Estudiante PAEC'}
              </h2>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {data.curso || 'Sin curso'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Resolución Exenta N° 586 • Ley TEA N° 21.545
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Status selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Estado:</span>
            <select
              value={data.estado}
              onChange={(e) => setData({ ...data, estado: e.target.value as any })}
              className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Activo">Activo</option>
              <option value="Borrador">Borrador</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          <button
            onClick={onOpenTemplateSelector}
            className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Importar estructura desde plantilla preconfigurada"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cargar Plantilla</span>
          </button>

          <button
            onClick={() => onViewDocument(data)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Ver Documento Oficial</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Plan de Acompañamiento Emocional y Conductual guardado correctamente!</span>
        </div>
      )}

      {/* Editor Main Grid: Sidebar Navigator + Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-1">
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-1 sticky top-24">
            <div className="px-3 py-2 text-2xs font-bold text-slate-400 uppercase tracking-wider">
              Estructura Oficial Res. 586
            </div>

            <button
              onClick={() => setActiveSection('objetivo')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                activeSection === 'objetivo'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                I. Objetivo PAEC
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <button
              onClick={() => setActiveSection('identificacion')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                activeSection === 'identificacion'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                II. a) Identificación Escolar
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <button
              onClick={() => setActiveSection('contactos')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                activeSection === 'contactos'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-slate-400" />
                II. b) Contactos de Prioridad
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <button
              onClick={() => setActiveSection('diagnostico')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                activeSection === 'diagnostico'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                II. c) Diagnóstico PIE
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <button
              onClick={() => setActiveSection('tratamiento')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                activeSection === 'tratamiento'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                II. d) Tratamiento Médico
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <button
              onClick={() => setActiveSection('socioemocional')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                activeSection === 'socioemocional'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                II. e/f) Socioemocional & Crisis
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <button
              onClick={() => setActiveSection('fechas')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                activeSection === 'fechas'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                III. Fechas y Periodo
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <button
              onClick={() => setActiveSection('plan-apoyo')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                activeSection === 'plan-apoyo'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                IV. Plan de Apoyo (Matriz)
              </span>
              <span className="text-2xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                {data.planApoyoContextual.length + data.planApoyoSensorial.length + data.planApoyoRelacional.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('firmas')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                activeSection === 'firmas'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5 text-slate-400" />
                V. Toma Conocimiento & Firmas
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Section Content Area */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          {/* SECTION I: OBJETIVO */}
          {activeSection === 'objetivo' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-600" />
                  I) Objetivo del Plan de Acompañamiento Emocional y Conductual
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fundamentación técnica según la Resolución Exenta N° 586 y Ley TEA N° 21.545 del MINEDUC
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-800 text-sm leading-relaxed space-y-4">
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <span className="font-bold text-slate-900 block mb-1">
                    Definición Oficial (Resolución Exenta N° 586):
                  </span>
                  <p className="text-slate-700 text-xs sm:text-sm">
                    "Conjunto de acciones preventivas y de abordaje emocional y conductual, que acompañará la trayectoria educativa de un estudiante con diagnóstico TEA de acuerdo a sus necesidades específicas en este ámbito. Cuyo propósito es mitigar su vulnerabilidad ante el entorno y responder comprensiva y eficazmente ante conductas desafiantes de manejar para el contexto educativo, sea por su intensidad, naturaleza o temporalidad."
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-lg">
                    <span className="font-bold text-indigo-950 block mb-1">Eje Preventivo:</span>
                    <p className="text-indigo-900">
                      Identificar elementos contextuales, sensoriales y relacionales que puedan afectar el bienestar del o la estudiante en el espacio escolar, previniendo la aparición de episodios de desregulación.
                    </p>
                  </div>

                  <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-lg">
                    <span className="font-bold text-blue-950 block mb-1">Eje Reactivo o de Respuesta:</span>
                    <p className="text-blue-900">
                      Planificar y articular acciones de contención respetuosa y desescalamiento ante situaciones de mayor vulnerabilidad o conductas desafiantes manifiestas en el colegio.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveSection('identificacion')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <span>Continuar a Identificación Escolar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION II-A: DATOS DE IDENTIFICACIÓN */}
          {activeSection === 'identificacion' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  II. a) Datos de Identificación Personales y Escolares
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Información oficial del estudiante y equipo pedagógico de aula
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre Completo del Estudiante *
                  </label>
                  <input
                    type="text"
                    required
                    value={data.nombre}
                    onChange={(e) => setData({ ...data, nombre: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej. Lucas Benjamín Valenzuela Morales"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    RUT del Estudiante *
                  </label>
                  <input
                    type="text"
                    required
                    value={data.rut}
                    onChange={(e) => handleRutChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej. 22.485.912-K"
                  />
                  {rutError && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {rutError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Curso *
                  </label>
                  <select
                    value={data.curso}
                    onChange={(e) => setData({ ...data, curso: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Seleccionar curso...</option>
                    {CURSOS_CHILE.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={data.fechaNacimiento}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Edad
                  </label>
                  <input
                    type="text"
                    value={data.edad}
                    onChange={(e) => setData({ ...data, edad: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium"
                    placeholder="Se calcula automáticamente o ingrese edad"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Familia y Equipo Pedagógico Responsable
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombre del Apoderado(a) Titular *
                    </label>
                    <input
                      type="text"
                      value={data.nombreApoderado}
                      onChange={(e) => setData({ ...data, nombreApoderado: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ej. Patricia Morales Henríquez"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Número de Contacto Apoderado *
                    </label>
                    <input
                      type="text"
                      value={data.numeroContactoApoderado}
                      onChange={(e) => setData({ ...data, numeroContactoApoderado: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ej. +56 9 8452 1198"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombre Profesor(a) Jefe *
                    </label>
                    <input
                      type="text"
                      value={data.nombreProfesoraJefe}
                      onChange={(e) => setData({ ...data, nombreProfesoraJefe: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ej. Prof. Marcela Contreras Vidal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombre Educador(a) Diferencial PIE *
                    </label>
                    <input
                      type="text"
                      value={data.nombreEducadoraDiferencial}
                      onChange={(e) => setData({ ...data, nombreEducadoraDiferencial: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ej. Ed. Viviana Carrasco López"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Otros Profesionales de Apoyo PIE (Opcional):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1">Terapeuta Ocupacional</label>
                      <input
                        type="text"
                        value={data.profesionalesApoyo?.terapeutaOcupacional || ''}
                        onChange={(e) => setData({
                          ...data,
                          profesionalesApoyo: { ...data.profesionalesApoyo, terapeutaOcupacional: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        placeholder="Ej. TO. Gabriel Oyarzún"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Fonoaudiólogo/a</label>
                      <input
                        type="text"
                        value={data.profesionalesApoyo?.fonoaudiologo || ''}
                        onChange={(e) => setData({
                          ...data,
                          profesionalesApoyo: { ...data.profesionalesApoyo, fonoaudiologo: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        placeholder="Ej. Flga. Camila Soto"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Psicólogo/a</label>
                      <input
                        type="text"
                        value={data.profesionalesApoyo?.psicologo || ''}
                        onChange={(e) => setData({
                          ...data,
                          profesionalesApoyo: { ...data.profesionalesApoyo, psicologo: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        placeholder="Ej. Ps. Andrea Vergara"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION II-B: CONTACTOS DE PRIORIDAD */}
          {activeSection === 'contactos' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-indigo-600" />
                  II. b) Personas que se contactarán en caso de Desregulación Emocional y Conductual
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Orden de prioridad estricto para comunicación inmediata en situaciones de crisis o desregulación
                </p>
              </div>

              <div className="space-y-4">
                {([1, 2, 3] as const).map((prioridadNum) => {
                  const contacto = data.contactosEmergencia.find(c => c.prioridad === prioridadNum) || {
                    prioridad: prioridadNum,
                    nombre: '',
                    telefono: '',
                    vinculo: 'Madre'
                  };

                  const updateContacto = (field: keyof PersonaContacto, val: any) => {
                    const exists = data.contactosEmergencia.some(c => c.prioridad === prioridadNum);
                    let newContacts: PersonaContacto[];
                    if (exists) {
                      newContacts = data.contactosEmergencia.map(c => 
                        c.prioridad === prioridadNum ? { ...c, [field]: val } : c
                      );
                    } else {
                      newContacts = [...data.contactosEmergencia, { ...contacto, [field]: val }];
                    }
                    setData({ ...data, contactosEmergencia: newContacts });
                  };

                  return (
                    <div 
                      key={prioridadNum}
                      className={`p-4 rounded-xl border ${
                        prioridadNum === 1 
                          ? 'border-indigo-200 bg-indigo-50/40 ring-1 ring-indigo-300/50' 
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          prioridadNum === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-800'
                        }`}>
                          {prioridadNum}°
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Prioridad de Contacto {prioridadNum}° {prioridadNum === 1 && '(Primer Llamado)'}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-2xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
                          <input
                            type="text"
                            value={contacto.nombre}
                            onChange={(e) => updateContacto('nombre', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                            placeholder="Nombre del familiar o tutor"
                          />
                        </div>

                        <div>
                          <label className="block text-2xs font-semibold text-slate-600 mb-1">Teléfono de Contacto</label>
                          <input
                            type="text"
                            value={contacto.telefono}
                            onChange={(e) => updateContacto('telefono', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                            placeholder="+56 9 XXXX XXXX"
                          />
                        </div>

                        <div>
                          <label className="block text-2xs font-semibold text-slate-600 mb-1">Vínculo con el Estudiante</label>
                          <select
                            value={contacto.vinculo}
                            onChange={(e) => updateContacto('vinculo', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            <option value="Madre">Madre</option>
                            <option value="Padre">Padre</option>
                            <option value="Tía(o)">Tía(o)</option>
                            <option value="Abuela(o)">Abuela(o)</option>
                            <option value="Tutor Legal">Tutor Legal</option>
                            <option value="Hermano(a)">Hermano(a)</option>
                            <option value="Otro">Otro vínculo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION II-C: DIAGNÓSTICO PIE */}
          {activeSection === 'diagnostico' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  II. c) Diagnóstico de Ingreso PIE
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clasificación diagnóstica según Ley TEA 21.545 y Decreto 170
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                  <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">
                    Nivel de Apoyo Requerido (TEA) *
                  </label>
                  <div className="space-y-2">
                    {(['Nivel 1. Requiere apoyo.', 'Nivel 2. Requiere apoyo sustancial.', 'Nivel 3. Requiere apoyo muy sustancial.'] as NivelTea[]).map((nivel) => (
                      <label 
                        key={nivel}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          data.diagnosticoPie?.nivelTea === nivel
                            ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="nivelTea"
                          checked={data.diagnosticoPie?.nivelTea === nivel}
                          onChange={() => setData({
                            ...data,
                            diagnosticoPie: { ...data.diagnosticoPie, nivelTea: nivel }
                          })}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{nivel}</span>
                          <span className="text-2xs text-slate-500">
                            {nivel.includes('Nivel 1') 
                              ? 'Dificultad en interacción social, rigidez de pensamiento y organización pero con autonomía funcional.'
                              : nivel.includes('Nivel 2')
                              ? 'Marcados déficits en comunicación verbal y no verbal, inflexibilidad conductual que interfiere el funcionamiento en diversos contextos.'
                              : 'Alteraciones graves del funcionamiento, comunicación muy limitada y conductas altamente restrictivas o repetitivas.'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Comorbilidades Asociadas
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {COMORBILIDADES_COMUNES.map((comorb) => {
                      const isChecked = data.diagnosticoPie?.comorbilidades?.includes(comorb);
                      return (
                        <label 
                          key={comorb}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked 
                              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-medium' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const current = data.diagnosticoPie?.comorbilidades || [];
                              const updated = e.target.checked
                                ? [...current, comorb]
                                : current.filter(c => c !== comorb);
                              setData({
                                ...data,
                                diagnosticoPie: { ...data.diagnosticoPie, comorbilidades: updated }
                              });
                            }}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span>{comorb}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3">
                    <label className="block text-2xs font-semibold text-slate-600 mb-1">Otra comorbilidad o condición médica relevante:</label>
                    <input
                      type="text"
                      value={data.diagnosticoPie?.otraComorbilidad || ''}
                      onChange={(e) => setData({
                        ...data,
                        diagnosticoPie: { ...data.diagnosticoPie, otraComorbilidad: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      placeholder="Especificar diagnóstico o condición adicional..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION II-D: TRATAMIENTO MÉDICO */}
          {activeSection === 'tratamiento' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-indigo-600" />
                  II. d) Tratamiento Médico y Farmacológico
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro de medicamentos prescritos por neurólogo/psiquiatra y bitácora de ajustes de dosis
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-slate-800">¿El estudiante mantiene Tratamiento Médico / Farmacológico?</span>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="tieneTratamiento"
                        checked={data.tratamientoMedico?.tieneTratamiento === true}
                        onChange={() => setData({
                          ...data,
                          tratamientoMedico: { ...data.tratamientoMedico, tieneTratamiento: true }
                        })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Sí</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="tieneTratamiento"
                        checked={data.tratamientoMedico?.tieneTratamiento === false}
                        onChange={() => setData({
                          ...data,
                          tratamientoMedico: { ...data.tratamientoMedico, tieneTratamiento: false }
                        })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {data.tratamientoMedico?.tieneTratamiento && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Medicamento(s) Indicado(s)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {MEDICAMENTOS_COMUNES.map((med) => {
                          const isSelected = data.tratamientoMedico?.medicamentos?.includes(med);
                          return (
                            <label
                              key={med}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                                isSelected ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium' : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const current = data.tratamientoMedico?.medicamentos || [];
                                  const updated = e.target.checked
                                    ? [...current, med]
                                    : current.filter(m => m !== med);
                                  setData({
                                    ...data,
                                    tratamientoMedico: { ...data.tratamientoMedico, medicamentos: updated }
                                  });
                                }}
                                className="w-3.5 h-3.5 text-indigo-600 rounded"
                              />
                              <span className="truncate">{med}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Descripción del Tratamiento (Dosis, Temporalidad, Horario)
                      </label>
                      <textarea
                        rows={3}
                        value={data.tratamientoMedico?.descripcion || ''}
                        onChange={(e) => setData({
                          ...data,
                          tratamientoMedico: { ...data.tratamientoMedico, descripcion: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ej. Metilfenidato 10mg: 1 comprimido diario a las 07:30 hrs en el desayuno. Indicado por Neurólogo Dr. Fernando Riquelme."
                      />
                    </div>

                    {/* Table of medication changes */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Historial de Cambios en el Tratamiento
                        </span>
                        <button
                          type="button"
                          onClick={addMedicationChange}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Registrar Cambio</span>
                        </button>
                      </div>

                      {data.tratamientoMedico.cambios.length === 0 ? (
                        <p className="text-2xs text-slate-400 italic">No se han registrado modificaciones de tratamiento médico.</p>
                      ) : (
                        <div className="space-y-2">
                          {data.tratamientoMedico.cambios.map((cambio) => (
                            <div key={cambio.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 items-center text-xs">
                              <div className="sm:col-span-6">
                                <input
                                  type="text"
                                  value={cambio.descripcion}
                                  onChange={(e) => {
                                    setData({
                                      ...data,
                                      tratamientoMedico: {
                                        ...data.tratamientoMedico,
                                        cambios: data.tratamientoMedico.cambios.map(c => c.id === cambio.id ? { ...c, descripcion: e.target.value } : c)
                                      }
                                    });
                                  }}
                                  placeholder="Describir cambio de dosis o fármaco..."
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <input
                                  type="text"
                                  value={cambio.informante}
                                  onChange={(e) => {
                                    setData({
                                      ...data,
                                      tratamientoMedico: {
                                        ...data.tratamientoMedico,
                                        cambios: data.tratamientoMedico.cambios.map(c => c.id === cambio.id ? { ...c, informante: e.target.value } : c)
                                      }
                                    });
                                  }}
                                  placeholder="Informante (Ej. Madre)"
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="date"
                                  value={cambio.fecha}
                                  onChange={(e) => {
                                    setData({
                                      ...data,
                                      tratamientoMedico: {
                                        ...data.tratamientoMedico,
                                        cambios: data.tratamientoMedico.cambios.map(c => c.id === cambio.id ? { ...c, fecha: e.target.value } : c)
                                      }
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                />
                              </div>
                              <div className="sm:col-span-1 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeMedicationChange(cambio.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION II-E/F: SOCIOEMOCIONAL & EPISODIOS PREVIOS */}
          {activeSection === 'socioemocional' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-indigo-600" />
                  II. e) y f) Antecedentes Socioemocionales y Conductuales
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perfil de comunicación, intereses, autorregulación y descripción de episodios de desregulación previa
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    e) Antecedentes Socioemocionales y Conductuales relevantes *
                  </label>
                  <p className="text-2xs text-slate-500 mb-1.5">
                    Intereses especiales, patrones de comunicación, rutinas, motivadores clave, formas de autorregulación.
                  </p>
                  <textarea
                    rows={4}
                    value={data.antecedentesSocioemocionales}
                    onChange={(e) => setData({ ...data, antecedentesSocioemocionales: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej. Estudiante con lenguaje formal enriquecido. Presenta intereses restringidos en entomología y astronomía. Manifiesta alta sensibilidad al ruido ambiental imprevisto..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    f) Descripción de Episodios de Desregulación Emocional y Conductual (Naturaleza, Intensidad, Temporalidad) *
                  </label>
                  <p className="text-2xs text-slate-500 mb-1.5">
                    Gatillantes típicos observados, signos prodrómicos (tempranos), intensidad del malestar y tiempo usual de retorno a la calma.
                  </p>
                  <textarea
                    rows={4}
                    value={data.descripcionEpisodiosPrevios}
                    onChange={(e) => setData({ ...data, descripcionEpisodiosPrevios: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej. Ante cambios no advertidos de profesor o exceso de bullicio en el patio, suele bloquearse, taparse los oídos y retirarse al fondo de la sala..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION III: ANTECEDENTES DESARROLLO PAEC (FECHAS) */}
          {activeSection === 'fechas' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  III. Antecedentes Respecto al Desarrollo del Plan de Acompañamiento
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cronograma de elaboración, entrevistas con la familia y periodos de vigencia y modificación
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Fechas de Elaboración del PAEC
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-2xs font-semibold text-slate-600 mb-1">Inicio</label>
                      <input
                        type="date"
                        value={data.desarrolloPaec?.fechaInicio || ''}
                        onChange={(e) => setData({
                          ...data,
                          desarrolloPaec: { ...data.desarrolloPaec, fechaInicio: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold text-slate-600 mb-1">Desarrollo</label>
                      <input
                        type="date"
                        value={data.desarrolloPaec?.fechaDesarrollo || ''}
                        onChange={(e) => setData({
                          ...data,
                          desarrolloPaec: { ...data.desarrolloPaec, fechaDesarrollo: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold text-slate-600 mb-1">Cierre / Evaluación Anual</label>
                      <input
                        type="date"
                        value={data.desarrolloPaec?.fechaCierre || ''}
                        onChange={(e) => setData({
                          ...data,
                          desarrolloPaec: { ...data.desarrolloPaec, fechaCierre: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Entrevistas a Apoderado(a) / Elaboración de PAEC
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs font-semibold text-slate-600 mb-1">Fecha de Entrevista Inicial / Desarrollo PAEC</label>
                      <input
                        type="date"
                        value={data.desarrolloPaec?.fechaEntrevistaInicial || ''}
                        onChange={(e) => setData({
                          ...data,
                          desarrolloPaec: { ...data.desarrolloPaec, fechaEntrevistaInicial: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold text-slate-600 mb-1">Fecha de Entrevista de Cierre de PAEC</label>
                      <input
                        type="date"
                        value={data.desarrolloPaec?.fechaEntrevistaCierre || ''}
                        onChange={(e) => setData({
                          ...data,
                          desarrolloPaec: { ...data.desarrolloPaec, fechaEntrevistaCierre: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Periodo de Aplicación PAEC
                    </label>
                    <select
                      value={data.desarrolloPaec?.periodoAplicacion || 'Primer y Segundo Semestre 2026'}
                      onChange={(e) => setData({
                        ...data,
                        desarrolloPaec: { ...data.desarrolloPaec, periodoAplicacion: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Primer Semestre 2026">Primer Semestre 2026</option>
                      <option value="Segundo Semestre 2026">Segundo Semestre 2026</option>
                      <option value="Primer y Segundo Semestre 2026">Primer y Segundo Semestre 2026 (Anual)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Propuesta Flexible Modificable
                    </label>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="propuestaFlexible"
                          checked={data.desarrolloPaec?.propuestaFlexible === true}
                          onChange={() => setData({
                            ...data,
                            desarrolloPaec: { ...data.desarrolloPaec, propuestaFlexible: true }
                          })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Sí (Sujeto a ajustes continuos)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="propuestaFlexible"
                          checked={data.desarrolloPaec?.propuestaFlexible === false}
                          onChange={() => setData({
                            ...data,
                            desarrolloPaec: { ...data.desarrolloPaec, propuestaFlexible: false }
                          })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION IV: PLAN DE APOYO (MATRIZ RES. 586) */}
          {activeSection === 'plan-apoyo' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    IV) Desarrollo del Plan de Apoyo (Resolución Exenta N° 586)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Eje Preventivo y Eje Reactivo o de Respuesta estructurado en 3 dimensiones
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loadingAi}
                  onClick={() => generateAiStrategies(planSubTab)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
                >
                  {loadingAi ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Sugerir Estrategias con IA</span>
                </button>
              </div>

              {/* Sub-tabs for the 3 dimensions */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setPlanSubTab('contextual')}
                  className={`px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                    planSubTab === 'contextual'
                      ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>1. Elementos Contextuales</span>
                  <span className="px-1.5 py-0.2 rounded-full text-2xs bg-slate-200 text-slate-700">
                    {data.planApoyoContextual.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanSubTab('sensorial')}
                  className={`px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                    planSubTab === 'sensorial'
                      ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>2. Elementos Sensoriales</span>
                  <span className="px-1.5 py-0.2 rounded-full text-2xs bg-slate-200 text-slate-700">
                    {data.planApoyoSensorial.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanSubTab('relacional')}
                  className={`px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                    planSubTab === 'relacional'
                      ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>3. Elementos Relacionales</span>
                  <span className="px-1.5 py-0.2 rounded-full text-2xs bg-slate-200 text-slate-700">
                    {data.planApoyoRelacional.length}
                  </span>
                </button>
              </div>

              {/* Guidance helper card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
                {planSubTab === 'contextual' && (
                  <p>
                    <strong>Orientación Contextual:</strong> Considerar diseño y organización del espacio de aula, factores ambientales (iluminación, ventilación), estrategias metodológicas DUA, transiciones entre asignaturas e interacciones ambientales.
                  </p>
                )}
                {planSubTab === 'sensorial' && (
                  <p>
                    <strong>Orientación Sensorial:</strong> Considerar sonidos amplificados, timbres, luces brillantes, hipersensibilidad o hiposensibilidad al tacto/olores, texturas de alimentos, equilibrio, necesidad de balanceo/movimiento o autorreconocimiento de necesidades corporales.
                  </p>
                )}
                {planSubTab === 'relacional' && (
                  <p>
                    <strong>Orientación Relacional:</strong> Considerar formas de comunicarse, relación con compañeros y compañeras en clases y recreos, vinculación afectiva con docentes, asistentes de la educación y resolución mediada de conflictos.
                  </p>
                )}
              </div>

              {/* List of Matrix rows */}
              <div className="space-y-3">
                {(() => {
                  const currentList = planSubTab === 'contextual' 
                    ? data.planApoyoContextual 
                    : planSubTab === 'sensorial' 
                    ? data.planApoyoSensorial 
                    : data.planApoyoRelacional;

                  if (currentList.length === 0) {
                    return (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">No hay estrategias registradas para esta dimensión.</p>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => addPlanItem(planSubTab)}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                          >
                            + Agregar fila manual
                          </button>
                          <button
                            type="button"
                            onClick={() => generateAiStrategies(planSubTab)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                          >
                            ✨ Sugerir con IA
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {currentList.map((item, idx) => (
                        <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">
                              Estrategia #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePlanItem(planSubTab, item.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 text-xs flex items-center gap-1"
                              title="Eliminar estrategia"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-5">
                              <label className="block text-2xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Acción, acontecimiento o situación de posible afectación conductual y/o emocional (Gatillante) *
                              </label>
                              <textarea
                                rows={3}
                                value={item.accionGatillante}
                                onChange={(e) => updatePlanItem(planSubTab, item.id, 'accionGatillante', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describir situación detonante..."
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block text-2xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Respuesta de Contención / Estrategia de Apoyo *
                              </label>
                              <textarea
                                rows={3}
                                value={item.respuestaContencion}
                                onChange={(e) => updatePlanItem(planSubTab, item.id, 'respuestaContencion', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Estrategia de contención preventiva o reactiva..."
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-2xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Adulto Mediador Responsable *
                              </label>
                              <input
                                type="text"
                                value={item.adultoMediador}
                                onChange={(e) => updatePlanItem(planSubTab, item.id, 'adultoMediador', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ej. Educadora PIE / Profesor Jefe"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addPlanItem(planSubTab)}
                        className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 flex items-center justify-center gap-1.5 transition-colors bg-white"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar Otra Estrategia a {planSubTab.toUpperCase()}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* SECTION V: TOMA DE CONOCIMIENTO Y FIRMAS */}
          {activeSection === 'firmas' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-indigo-600" />
                    V) Nombre y Toma de Conocimiento Plan de Acompañamiento (Res. 586)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Acta formal de firmas y compromiso del equipo multidisciplinario y apoderado
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSignatureRow}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Firmante</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Nombre del Profesional / Apoderado</th>
                      <th className="p-2.5">Rol / Función Institucional</th>
                      <th className="p-2.5 text-center">Estado de Firma</th>
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.tomaConocimiento.map((firma) => (
                      <tr key={firma.id} className="hover:bg-slate-50">
                        <td className="p-2">
                          <input
                            type="text"
                            value={firma.nombre}
                            onChange={(e) => {
                              setData({
                                ...data,
                                tomaConocimiento: data.tomaConocimiento.map(f => f.id === firma.id ? { ...f, nombre: e.target.value } : f)
                              });
                            }}
                            placeholder="Nombre completo..."
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={firma.rol}
                            onChange={(e) => {
                              setData({
                                ...data,
                                tomaConocimiento: data.tomaConocimiento.map(f => f.id === firma.id ? { ...f, rol: e.target.value } : f)
                              });
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                          >
                            <option value="Profesor(a) Jefe">Profesor(a) Jefe</option>
                            <option value="Educadora Diferencial PIE">Educadora Diferencial PIE</option>
                            <option value="Terapeuta Ocupacional">Terapeuta Ocupacional</option>
                            <option value="Fonoaudiólogo/a">Fonoaudiólogo/a</option>
                            <option value="Psicólogo/a PIE">Psicólogo/a PIE</option>
                            <option value="Coordinador(a) PIE">Coordinador(a) PIE</option>
                            <option value="Inspector(a) General">Inspector(a) General</option>
                            <option value="Asistente de Aula">Asistente de Aula</option>
                            <option value="Apoderado(a)">Apoderado(a)</option>
                            <option value="Directivo">Directivo</option>
                          </select>
                        </td>
                        <td className="p-2 text-center">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={firma.firmado}
                              onChange={(e) => {
                                setData({
                                  ...data,
                                  tomaConocimiento: data.tomaConocimiento.map(f => f.id === firma.id ? { ...f, firmado: e.target.checked } : f)
                                });
                              }}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span className={`text-2xs font-semibold ${firma.firmado ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {firma.firmado ? 'Firmado' : 'Pendiente'}
                            </span>
                          </label>
                        </td>
                        <td className="p-2">
                          <input
                            type="date"
                            value={firma.fechaFirma}
                            onChange={(e) => {
                              setData({
                                ...data,
                                tomaConocimiento: data.tomaConocimiento.map(f => f.id === firma.id ? { ...f, fechaFirma: e.target.value } : f)
                              });
                            }}
                            className="px-2 py-1 border border-slate-200 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeSignatureRow(firma.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="border-t border-slate-200 pt-5 mt-6 flex items-center justify-between">
            <div className="text-2xs text-slate-400">
              Última actualización: {data.actualizadoEl || 'Hoy'}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Plan PAEC</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
