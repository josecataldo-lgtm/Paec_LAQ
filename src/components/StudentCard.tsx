import React from 'react';
import { 
  FileText, 
  Activity, 
  AlertTriangle, 
  User, 
  Phone, 
  Pill, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  MoreVertical,
  Trash2,
  Copy,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { EstudiantePAEC, HitoPedagogico, EpisodioDesregulacion } from '../types';

interface StudentCardProps {
  student: EstudiantePAEC;
  hitos: HitoPedagogico[];
  episodios: EpisodioDesregulacion[];
  onEditPaec: (student: EstudiantePAEC) => void;
  onViewDocument: (student: EstudiantePAEC) => void;
  onViewHitos: (student: EstudiantePAEC) => void;
  onAddIncident: (student: EstudiantePAEC) => void;
  onGenerateReport: (student: EstudiantePAEC) => void;
  onDeleteStudent: (studentId: string) => void;
  onDuplicateStudent: (student: EstudiantePAEC) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  hitos,
  episodios,
  onEditPaec,
  onViewDocument,
  onViewHitos,
  onAddIncident,
  onGenerateReport,
  onDeleteStudent,
  onDuplicateStudent
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const studentHitos = hitos.filter(h => h.estudianteId === student.id);
  const studentEpisodios = episodios.filter(e => e.estudianteId === student.id);
  
  const hitosLogrados = studentHitos.filter(h => h.estado === 'logrado' || h.estado === 'consolidado').length;
  const porcentajeHitos = studentHitos.length > 0 
    ? Math.round((hitosLogrados / studentHitos.length) * 100) 
    : 0;

  // Nivel TEA badge color
  const nivelBadge = student.diagnosticoPie?.nivelTea?.includes('Nivel 1')
    ? { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Nivel 1 (Apoyo)' }
    : student.diagnosticoPie?.nivelTea?.includes('Nivel 2')
    ? { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Nivel 2 (Sustancial)' }
    : { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Nivel 3 (Muy Sustancial)' };

  // Status badge
  const statusColor = student.estado === 'Activo'
    ? 'bg-emerald-100 text-emerald-800 font-semibold'
    : student.estado === 'Borrador'
    ? 'bg-slate-100 text-slate-700'
    : student.estado === 'En Revisión'
    ? 'bg-indigo-100 text-indigo-700'
    : 'bg-slate-200 text-slate-800';

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500/80 transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group">
      {/* Top Section */}
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${nivelBadge.bg} ${nivelBadge.text}`}>
                {nivelBadge.label}
              </span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${statusColor}`}>
                {student.estado}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-full">
                {student.curso || 'Sin curso'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors pt-0.5">
              {student.nombre}
            </h3>
            <p className="text-xs font-mono text-slate-400">
              RUT: {student.rut || 'No ingresado'} • {student.edad || 'Edad no calculada'}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Más opciones"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 top-7 z-20 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => { setShowMenu(false); onDuplicateStudent(student); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Duplicar PAEC</span>
                </button>
                <button
                  onClick={() => { setShowMenu(false); onGenerateReport(student); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-emerald-700 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reporte de Progreso</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => { setShowMenu(false); onDeleteStudent(student.id); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Estudiante</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* High-density Info Box */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-3.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-medium">Educadora PIE:</span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[170px]">
              {student.nombreEducadoraDiferencial || 'No asignada'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-medium">Apoderado:</span>
            <span className="font-medium text-slate-800 text-right truncate max-w-[170px]">
              {student.nombreApoderado || 'No registrado'}
            </span>
          </div>
          {student.tratamientoMedico?.tieneTratamiento && (
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] pt-1 border-t border-slate-200/60 font-medium">
              <Pill className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">Fármacos: {student.tratamientoMedico.medicamentos.join(', ') || 'Registrados'}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Progreso Hitos
            </span>
            <span className="font-bold text-slate-800 font-mono text-[11px]">
              {hitosLogrados}/{studentHitos.length} ({porcentajeHitos}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                porcentajeHitos >= 75 ? 'bg-emerald-500' : porcentajeHitos >= 40 ? 'bg-blue-500' : 'bg-amber-400'
              }`}
              style={{ width: `${porcentajeHitos}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDocument(student)}
          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition-colors shadow-2xs"
          title="Ver Documento Oficial PAEC (Resolución Exenta N° 586)"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Ver PDF Oficial</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddIncident(student)}
            className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
            title="Registrar episodio de desregulación en bitácora"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditPaec(student)}
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Gestionar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
