import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Trash2, 
  Edit3, 
  Filter, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Layers,
  Search
} from 'lucide-react';
import { HitoPedagogico, EstudiantePAEC, EstadoHito } from '../types';

interface MilestoneTrackerProps {
  hitos: HitoPedagogico[];
  estudiantes: EstudiantePAEC[];
  onSaveHitos: (newHitos: HitoPedagogico[]) => void;
  selectedStudentId?: string;
  onSelectStudentId?: (id: string) => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  hitos,
  estudiantes,
  onSaveHitos,
  selectedStudentId: initialStudentId,
  onSelectStudentId
}) => {
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(initialStudentId || 'todos');
  const [selectedDimensionFilter, setSelectedDimensionFilter] = useState<string>('todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Modal new milestone
  const [showNewModal, setShowNewModal] = useState(false);
  const [newHito, setNewHito] = useState<Partial<HitoPedagogico>>({
    estudianteId: estudiantes[0]?.id || '',
    titulo: '',
    descripcion: '',
    dimension: 'Sensorial',
    estado: 'en_proceso',
    porcentajeLogro: 50,
    metaEsperada: '',
    fechaEvaluacion: new Date().toISOString().split('T')[0],
    responsable: 'Educadora Diferencial PIE',
    observaciones: ''
  });

  const filteredHitos = hitos.filter(h => {
    if (selectedStudentFilter !== 'todos' && h.estudianteId !== selectedStudentFilter) return false;
    if (selectedDimensionFilter !== 'todas' && h.dimension !== selectedDimensionFilter) return false;
    if (selectedStatusFilter !== 'todos' && h.estado !== selectedStatusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return h.titulo.toLowerCase().includes(q) || h.descripcion.toLowerCase().includes(q) || h.responsable.toLowerCase().includes(q);
    }
    return true;
  });

  const totalLogrados = hitos.filter(h => h.estado === 'logrado' || h.estado === 'consolidado').length;
  const porcentajeTotal = hitos.length > 0 ? Math.round((totalLogrados / hitos.length) * 100) : 0;

  const handleUpdateStatus = (id: string, newStatus: EstadoHito) => {
    const updated = hitos.map(h => {
      if (h.id === id) {
        let pct = h.porcentajeLogro;
        if (newStatus === 'consolidado') pct = 100;
        else if (newStatus === 'logrado' && pct < 85) pct = 90;
        else if (newStatus === 'no_iniciado') pct = 0;
        return { ...h, estado: newStatus, porcentajeLogro: pct };
      }
      return h;
    });
    onSaveHitos(updated);
  };

  const handleUpdatePercentage = (id: string, pct: number) => {
    const updated = hitos.map(h => {
      if (h.id === id) {
        let estado: EstadoHito = h.estado;
        if (pct === 100) estado = 'consolidado';
        else if (pct >= 85) estado = 'logrado';
        else if (pct >= 50) estado = 'en_desarrollo';
        else if (pct > 0) estado = 'en_proceso';
        else estado = 'no_iniciado';
        return { ...h, porcentajeLogro: pct, estado };
      }
      return h;
    });
    onSaveHitos(updated);
  };

  const handleDeleteHito = (id: string) => {
    onSaveHitos(hitos.filter(h => h.id !== id));
  };

  const handleCreateHito = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHito.titulo || !newHito.estudianteId) return;

    const created: HitoPedagogico = {
      id: `hito-${Date.now()}`,
      estudianteId: newHito.estudianteId!,
      titulo: newHito.titulo!,
      descripcion: newHito.descripcion || '',
      dimension: newHito.dimension as any || 'Sensorial',
      estado: newHito.estado as any || 'en_proceso',
      porcentajeLogro: Number(newHito.porcentajeLogro) || 50,
      metaEsperada: newHito.metaEsperada || '',
      fechaEvaluacion: newHito.fechaEvaluacion || new Date().toISOString().split('T')[0],
      responsable: newHito.responsable || 'Educadora PIE',
      observaciones: newHito.observaciones || ''
    };

    onSaveHitos([...hitos, created]);
    setShowNewModal(false);
    setNewHito({
      estudianteId: estudiantes[0]?.id || '',
      titulo: '',
      descripcion: '',
      dimension: 'Sensorial',
      estado: 'en_proceso',
      porcentajeLogro: 50,
      metaEsperada: '',
      fechaEvaluacion: new Date().toISOString().split('T')[0],
      responsable: 'Educadora Diferencial PIE',
      observaciones: ''
    });
  };

  // AI Milestone generator
  const handleGenerateAiMilestones = async () => {
    const targetStudent = estudiantes.find(s => s.id === selectedStudentFilter) || estudiantes[0];
    if (!targetStudent) return;

    setLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/generate-milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: targetStudent })
      });
      const data = await res.json();
      if (data.milestones && Array.isArray(data.milestones)) {
        const newGeneratedHitos: HitoPedagogico[] = data.milestones.map((m: any, idx: number) => ({
          id: `hito-ai-${Date.now()}-${idx}`,
          estudianteId: targetStudent.id,
          titulo: m.titulo || 'Hito Pedagógico PAEC',
          descripcion: m.descripcion || '',
          dimension: (m.dimension as any) || 'Sensorial',
          estado: 'en_proceso',
          porcentajeLogro: 40,
          metaEsperada: m.metaEsperada || 'Criterio semestral',
          fechaEvaluacion: new Date().toISOString().split('T')[0],
          responsable: m.responsable || 'Equipo Multidisciplinario PIE',
          observaciones: 'Generado con IA según perfil clínico-pedagógico y Ley TEA.'
        }));

        onSaveHitos([...hitos, ...newGeneratedHitos]);
        if (selectedStudentFilter === 'todos') {
          setSelectedStudentFilter(targetStudent.id);
        }
      }
    } catch (err) {
      console.error('Error generating AI milestones:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner with Statistics */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Evaluación Continua y DUA
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Seguimiento de Hitos Pedagógicos y Metas del PAEC
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mt-0.5">
            Supervisa el avance de los objetivos socioemocionales, autorregulación sensorial y adecuaciones de acceso para cada estudiante.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Progress gauge */}
          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">Cumplimiento Global</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">{porcentajeTotal}%</span>
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-slate-200 flex items-center justify-center font-bold text-xs text-emerald-700 bg-white">
              {totalLogrados}/{hitos.length}
            </div>
          </div>

          <button
            type="button"
            disabled={loadingAi || estudiantes.length === 0}
            onClick={handleGenerateAiMilestones}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
            title="Generar metas SMART adaptadas con IA para el estudiante seleccionado"
          >
            {loadingAi ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-600" />
            )}
            <span>Sugerir Hitos con IA</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Hito</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Student Filter */}
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos los Estudiantes ({estudiantes.length})</option>
              {estudiantes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} ({s.curso})</option>
              ))}
            </select>
          </div>

          {/* Dimension Filter */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDimensionFilter}
              onChange={(e) => setSelectedDimensionFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todas">Todas las Dimensiones</option>
              <option value="Sensorial">Sensorial</option>
              <option value="Contextual">Contextual</option>
              <option value="Relacional">Relacional</option>
              <option value="Autonomía y Autorregulación">Autonomía y Autorregulación</option>
              <option value="Académico / DUA">Académico / DUA</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos los Estados</option>
              <option value="no_iniciado">No Iniciado</option>
              <option value="en_proceso">En Proceso</option>
              <option value="en_desarrollo">En Desarrollo</option>
              <option value="logrado">Logrado</option>
              <option value="consolidado">Consolidado</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Buscar hito..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 rounded-lg border border-slate-300 w-full sm:w-48 bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* List of Milestones */}
      {filteredHitos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
          <Activity className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No se encontraron hitos pedagógicos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Crea un nuevo hito para registrar las metas de acompañamiento o utiliza el generador con Inteligencia Artificial.
          </p>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            + Crear Primer Hito
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHitos.map((hito) => {
            const studentOwner = estudiantes.find(s => s.id === hito.estudianteId);
            
            const statusConfig = hito.estado === 'consolidado' 
              ? { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Consolidado' }
              : hito.estado === 'logrado'
              ? { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Logrado' }
              : hito.estado === 'en_desarrollo'
              ? { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'En Desarrollo' }
              : hito.estado === 'en_proceso'
              ? { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'En Proceso' }
              : { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'No Iniciado' };

            return (
              <div 
                key={hito.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2 py-0.5 text-2xs font-semibold rounded-full bg-slate-100 text-slate-800 font-mono">
                          {studentOwner ? studentOwner.nombre : 'Estudiante'}
                        </span>
                        <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {hito.dimension}
                        </span>
                        <span className={`px-2 py-0.5 text-2xs font-semibold rounded-full border ${statusConfig.bg}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {hito.titulo}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteHito(hito.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Eliminar hito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {hito.descripcion}
                  </p>

                  {hito.metaEsperada && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-2xs text-slate-700 mb-3">
                      <strong>Criterio de Logro:</strong> {hito.metaEsperada}
                    </div>
                  )}

                  {/* Progress slider */}
                  <div className="space-y-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-2xs font-semibold text-slate-700">
                      <span>Nivel de Logro Actual:</span>
                      <span className="font-mono text-indigo-700 font-bold">{hito.porcentajeLogro}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={hito.porcentajeLogro}
                      onChange={(e) => handleUpdatePercentage(hito.id, Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Status Toggle buttons & metadata */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-1 flex-wrap text-2xs">
                    {(['no_iniciado', 'en_proceso', 'en_desarrollo', 'logrado', 'consolidado'] as EstadoHito[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(hito.id, st)}
                        className={`px-2 py-1 rounded transition-colors ${
                          hito.estado === st
                            ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'no_iniciado' ? 'No Iniciado' : st === 'en_proceso' ? 'Proceso' : st === 'en_desarrollo' ? 'Desarrollo' : st === 'logrado' ? 'Logrado' : 'Consolidado'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-2xs text-slate-400">
                    <span>Responsable: {hito.responsable}</span>
                    <span>Eval: {hito.fechaEvaluacion}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Milestone */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Nuevo Hito Pedagógico PAEC</span>
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHito} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estudiante Asignado *</label>
                <select
                  required
                  value={newHito.estudianteId}
                  onChange={(e) => setNewHito({ ...newHito, estudianteId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  {estudiantes.map(st => (
                    <option key={st.id} value={st.id}>{st.nombre} ({st.curso})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título del Hito o Meta *</label>
                <input
                  type="text"
                  required
                  value={newHito.titulo}
                  onChange={(e) => setNewHito({ ...newHito, titulo: e.target.value })}
                  placeholder="Ej. Uso autónomo de protectores auditivos en actos"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dimensión</label>
                  <select
                    value={newHito.dimension}
                    onChange={(e) => setNewHito({ ...newHito, dimension: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Sensorial">Sensorial</option>
                    <option value="Contextual">Contextual</option>
                    <option value="Relacional">Relacional</option>
                    <option value="Autonomía y Autorregulación">Autonomía y Autorregulación</option>
                    <option value="Académico / DUA">Académico / DUA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado Inicial</label>
                  <select
                    value={newHito.estado}
                    onChange={(e) => setNewHito({ ...newHito, estado: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="no_iniciado">No Iniciado</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="en_desarrollo">En Desarrollo</option>
                    <option value="logrado">Logrado</option>
                    <option value="consolidado">Consolidado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción de la Conducta Esperada</label>
                <textarea
                  rows={2}
                  value={newHito.descripcion}
                  onChange={(e) => setNewHito({ ...newHito, descripcion: e.target.value })}
                  placeholder="Descripción del comportamiento observado..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Criterio de Logro Medible (Meta SMART)</label>
                <input
                  type="text"
                  value={newHito.metaEsperada}
                  onChange={(e) => setNewHito({ ...newHito, metaEsperada: e.target.value })}
                  placeholder="Ej. Lograr uso en el 80% de los momentos de sobrecarga acústica"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Profesional Responsable</label>
                  <input
                    type="text"
                    value={newHito.responsable}
                    onChange={(e) => setNewHito({ ...newHito, responsable: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Evaluación</label>
                  <input
                    type="date"
                    value={newHito.fechaEvaluacion}
                    onChange={(e) => setNewHito({ ...newHito, fechaEvaluacion: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Guardar Hito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
