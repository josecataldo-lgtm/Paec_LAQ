import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  PhoneCall, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { EpisodioDesregulacion, EstudiantePAEC } from '../types';

interface IncidentLogProps {
  episodios: EpisodioDesregulacion[];
  estudiantes: EstudiantePAEC[];
  onSaveEpisodios: (newEpisodios: EpisodioDesregulacion[]) => void;
  selectedStudentId?: string;
}

export const IncidentLog: React.FC<IncidentLogProps> = ({
  episodios,
  estudiantes,
  onSaveEpisodios,
  selectedStudentId: initialStudentId
}) => {
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(initialStudentId || 'todos');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const [newEpisodio, setNewEpisodio] = useState<Partial<EpisodioDesregulacion>>({
    estudianteId: estudiantes[0]?.id || '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    lugar: 'Sala de Clases',
    intensidad: 'Moderada',
    gatillante: '',
    conductaObservada: '',
    estrategiaAplicada: '',
    tiempoRetornoCalmaMinutos: 15,
    adultosIntervinientes: 'Educadora PIE y Asistente de Aula',
    seContactaApoderado: false,
    observacionesPosteriores: ''
  });

  const filteredEpisodios = episodios.filter(ep => {
    if (selectedStudentFilter !== 'todos' && ep.estudianteId !== selectedStudentFilter) return false;
    if (selectedSeverityFilter !== 'todas' && ep.intensidad !== selectedSeverityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return ep.gatillante.toLowerCase().includes(q) || ep.conductaObservada.toLowerCase().includes(q) || ep.lugar.toLowerCase().includes(q);
    }
    return true;
  });

  const totalEpisodios = episodios.length;
  const episodiosCriticos = episodios.filter(e => e.intensidad === 'Severa').length;
  const promedioMinutos = episodios.length > 0 
    ? Math.round(episodios.reduce((acc, curr) => acc + (curr.tiempoRetornoCalmaMinutos || 0), 0) / episodios.length)
    : 0;

  const handleDeleteEpisodio = (id: string) => {
    onSaveEpisodios(episodios.filter(e => e.id !== id));
  };

  const handleCreateEpisodio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpisodio.estudianteId || !newEpisodio.gatillante) return;

    const created: EpisodioDesregulacion = {
      id: `ep-${Date.now()}`,
      estudianteId: newEpisodio.estudianteId!,
      fecha: newEpisodio.fecha || new Date().toISOString().split('T')[0],
      hora: newEpisodio.hora || '10:00',
      lugar: newEpisodio.lugar || 'Sala de Clases',
      intensidad: (newEpisodio.intensidad as any) || 'Moderada',
      gatillante: newEpisodio.gatillante!,
      conductaObservada: newEpisodio.conductaObservada || '',
      estrategiaAplicada: newEpisodio.estrategiaAplicada || '',
      tiempoRetornoCalmaMinutos: Number(newEpisodio.tiempoRetornoCalmaMinutos) || 15,
      adultosIntervinientes: newEpisodio.adultosIntervinientes || 'Equipo PIE',
      seContactaApoderado: !!newEpisodio.seContactaApoderado,
      observacionesPosteriores: newEpisodio.observacionesPosteriores || ''
    };

    onSaveEpisodios([created, ...episodios]);
    setShowNewModal(false);
    setNewEpisodio({
      estudianteId: estudiantes[0]?.id || '',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().slice(0, 5),
      lugar: 'Sala de Clases',
      intensidad: 'Moderada',
      gatillante: '',
      conductaObservada: '',
      estrategiaAplicada: '',
      tiempoRetornoCalmaMinutos: 15,
      adultosIntervinientes: 'Educadora PIE y Asistente de Aula',
      seContactaApoderado: false,
      observacionesPosteriores: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Protocolo de Actuación Ley 21.545
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Bitácora de Episodios de Desregulación Emocional y Conductual
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mt-0.5">
            Registro cronológico formal de incidentes, respuestas de contención ejecutadas y verificación de efectividad del plan de apoyo.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
            <span className="text-lg font-bold text-slate-900 font-mono">{totalEpisodios}</span>
            <span className="block text-2xs text-slate-500">Total Registros</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
            <span className="text-lg font-bold text-amber-600 font-mono">{promedioMinutos} min</span>
            <span className="block text-2xs text-slate-500">Promedio Calma</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
            <span className="text-lg font-bold text-rose-600 font-mono">{episodiosCriticos}</span>
            <span className="block text-2xs text-slate-500">Intensidad Alta</span>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Episodio</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="todos">Todos los Estudiantes</option>
              {estudiantes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} ({s.curso})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSeverityFilter}
              onChange={(e) => setSelectedSeverityFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="todas">Todas las Intensidades</option>
              <option value="Leve">Leve</option>
              <option value="Moderada">Moderada</option>
              <option value="Severa">Severa</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Buscar por gatillante o lugar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 rounded-lg border border-slate-300 w-full sm:w-56 bg-white"
          />
        </div>
      </div>

      {/* Incident List */}
      {filteredEpisodios.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No hay episodios registrados con los filtros actuales</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Todos los eventos de desregulación documentados quedarán registrados para el análisis y ajuste del PAEC.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEpisodios.map((ep) => {
            const student = estudiantes.find(s => s.id === ep.estudianteId);
            const severityBadge = ep.intensidad === 'Severa'
              ? 'bg-rose-100 text-rose-800 border-rose-200'
              : ep.intensidad === 'Moderada'
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-blue-100 text-blue-800 border-blue-200';

            return (
              <div 
                key={ep.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {student ? student.nombre : 'Estudiante'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      ({student?.curso || 'Sin curso'})
                    </span>
                    <span className={`px-2 py-0.5 text-2xs font-bold rounded-full border ${severityBadge}`}>
                      Intensidad {ep.intensidad}
                    </span>
                    {ep.seContactaApoderado && (
                      <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" />
                        Apoderado Contactado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {ep.fecha}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {ep.hora} hrs
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {ep.lugar}
                    </span>
                    <button
                      onClick={() => handleDeleteEpisodio(ep.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 block text-2xs uppercase tracking-wider">
                      Gatillante & Conducta Observada:
                    </span>
                    <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Gatillante:</strong> {ep.gatillante}
                    </p>
                    {ep.conductaObservada && (
                      <p className="text-slate-600 pl-2 border-l-2 border-slate-300">
                        <strong>Manifestación:</strong> {ep.conductaObservada}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 block text-2xs uppercase tracking-wider">
                      Respuesta de Contención Aplicada:
                    </span>
                    <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {ep.estrategiaAplicada || 'Contención según PAEC.'}
                    </p>
                    <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
                      <span><strong>Mediadores:</strong> {ep.adultosIntervinientes}</span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Retorno a calma: {ep.tiempoRetornoCalmaMinutos} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Incident */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Registrar Episodio de Desregulación</span>
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEpisodio} className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estudiante *</label>
                <select
                  required
                  value={newEpisodio.estudianteId}
                  onChange={(e) => setNewEpisodio({ ...newEpisodio, estudianteId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  {estudiantes.map(st => (
                    <option key={st.id} value={st.id}>{st.nombre} ({st.curso})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newEpisodio.fecha}
                    onChange={(e) => setNewEpisodio({ ...newEpisodio, fecha: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    value={newEpisodio.hora}
                    onChange={(e) => setNewEpisodio({ ...newEpisodio, hora: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Intensidad</label>
                  <select
                    value={newEpisodio.intensidad}
                    onChange={(e) => setNewEpisodio({ ...newEpisodio, intensidad: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="Leve">Leve</option>
                    <option value="Moderada">Moderada</option>
                    <option value="Severa">Severa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lugar del Evento</label>
                <input
                  type="text"
                  value={newEpisodio.lugar}
                  onChange={(e) => setNewEpisodio({ ...newEpisodio, lugar: e.target.value })}
                  placeholder="Ej. Sala de clases, Patio central, Comedor..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gatillante Observado o Factor Detonante *</label>
                <textarea
                  rows={2}
                  required
                  value={newEpisodio.gatillante}
                  onChange={(e) => setNewEpisodio({ ...newEpisodio, gatillante: e.target.value })}
                  placeholder="Ej. Sobrecarga acústica durante cambio de hora o frustración en trabajo grupal..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conducta Observada / Manifestación</label>
                <textarea
                  rows={2}
                  value={newEpisodio.conductaObservada}
                  onChange={(e) => setNewEpisodio({ ...newEpisodio, conductaObservada: e.target.value })}
                  placeholder="Ej. Llanto, bloqueo verbal, rechazo a instrucciones..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estrategia de Contención Aplicada (PAEC)</label>
                <textarea
                  rows={2}
                  value={newEpisodio.estrategiaAplicada}
                  onChange={(e) => setNewEpisodio({ ...newEpisodio, estrategiaAplicada: e.target.value })}
                  placeholder="Ej. Traslado a espacio de calma sensorial, uso de audífonos y respiración guiada..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tiempo de Retorno a la Calma</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={newEpisodio.tiempoRetornoCalmaMinutos}
                      onChange={(e) => setNewEpisodio({ ...newEpisodio, tiempoRetornoCalmaMinutos: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <span className="text-slate-500 font-medium">minutos</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adultos Mediadores</label>
                  <input
                    type="text"
                    value={newEpisodio.adultosIntervinientes}
                    onChange={(e) => setNewEpisodio({ ...newEpisodio, adultosIntervinientes: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={newEpisodio.seContactaApoderado}
                    onChange={(e) => setNewEpisodio({ ...newEpisodio, seContactaApoderado: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-800">¿Se activó contacto telefónico con el apoderado/a?</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  Guardar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
