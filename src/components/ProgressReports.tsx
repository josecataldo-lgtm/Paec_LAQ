import React, { useState } from 'react';
import { 
  Sparkles, 
  Printer, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Calendar, 
  User, 
  Download, 
  Copy, 
  Share2,
  BookOpen,
  Award,
  BarChart,
  Edit3
} from 'lucide-react';
import { EstudiantePAEC, HitoPedagogico, EpisodioDesregulacion, EscuelaConfig } from '../types';

interface ProgressReportsProps {
  estudiantes: EstudiantePAEC[];
  hitos: HitoPedagogico[];
  episodios: EpisodioDesregulacion[];
  escuela: EscuelaConfig;
  selectedStudentId?: string;
}

export const ProgressReports: React.FC<ProgressReportsProps> = ({
  estudiantes,
  hitos,
  episodios,
  escuela,
  selectedStudentId: initialStudentId
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || estudiantes[0]?.id || ''
  );
  const [periodoReporte, setPeriodoReporte] = useState<string>('Primer Semestre 2026');
  const [destinatario, setDestinatario] = useState<'familia' | 'equipo_pie' | 'informe_oficial_mineduc'>('familia');
  const [reporteGenerado, setReporteGenerado] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentStudent = estudiantes.find(s => s.id === selectedStudentId) || estudiantes[0];
  const studentHitos = currentStudent ? hitos.filter(h => h.estudianteId === currentStudent.id) : [];
  const studentEpisodios = currentStudent ? episodios.filter(e => e.estudianteId === currentStudent.id) : [];

  const handleGenerateAiReport = async () => {
    if (!currentStudent) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/gemini/generate-progress-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: currentStudent,
          hitos: studentHitos,
          episodios: studentEpisodios,
          period: periodoReporte
        })
      });
      const data = await res.json();
      if (data.report) {
        setReporteGenerado(data.report);
      }
    } catch (err) {
      console.error('Error generating AI report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!reporteGenerado) return;
    const fullText = `INFORME DE PROGRESO PAEC - LEY TEA N° 21.545
Estudiante: ${currentStudent?.nombre}
RUT: ${currentStudent?.rut} | Curso: ${currentStudent?.curso}
Periodo: ${periodoReporte}
Establecimiento: ${escuela.nombre} (RBD: ${escuela.rbd})

1. RESUMEN EJECUTIVO:
${reporteGenerado.resumenEjecutivo}

2. LOGROS EN AUTORREGULACIÓN E HITOS PEDAGÓGICOS:
${reporteGenerado.analisisHitos}

3. EFICACIA DE ESTRATEGIAS DEL PAEC:
${reporteGenerado.estrategiasEfectivas}

4. ORIENTACIONES PARA EL HOGAR:
${reporteGenerado.orientacionesFamilia}

5. PROYECCIONES Y RECOMENDACIONES DE AULA:
${reporteGenerado.sugerenciasAula}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Generador Inteligente de Informes
            </span>
            <span className="text-2xs text-slate-300">Normativa PIE & Ley TEA</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Reportes de Progreso y Evaluación PAEC
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Genera informes pedagógicos personalizados para familias, equipos de aula o expedientes MINEDUC integrando automáticamente el cumplimiento de hitos y la bitácora de desregulación.
          </p>
        </div>

        <button
          type="button"
          disabled={isGenerating || !currentStudent}
          onClick={handleGenerateAiReport}
          className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl flex items-center gap-2 shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Sparkles className="w-4 h-4 text-slate-950" />
          )}
          <span>{reporteGenerado ? 'Regenerar con IA' : 'Generar Informe con IA'}</span>
        </button>
      </div>

      {/* Control Configuration Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs print:hidden">
        <div className="flex items-center flex-wrap gap-4">
          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Estudiante *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setReporteGenerado(null);
              }}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
            >
              {estudiantes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.curso}) - {s.rut}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Periodo Académico
            </label>
            <select
              value={periodoReporte}
              onChange={(e) => setPeriodoReporte(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Primer Semestre 2026">Primer Semestre 2026</option>
              <option value="Segundo Semestre 2026">Segundo Semestre 2026</option>
              <option value="Informe Anual Consolidado 2026">Informe Anual Consolidado 2026</option>
              <option value="Evaluación Diagnóstica Inicial">Evaluación Diagnóstica Inicial</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tipo de Destinatario
            </label>
            <select
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="familia">Familia / Apoderado (Lenguaje formativo empático)</option>
              <option value="equipo_pie">Equipo de Aula / Consejo de Profesores</option>
              <option value="informe_oficial_mineduc">Expediente Oficial PIE / MINEDUC</option>
            </select>
          </div>
        </div>

        {reporteGenerado && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Report Canvas */}
      {!reporteGenerado && !isGenerating && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 print:hidden">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Genera el Informe de Progreso para {currentStudent?.nombre}
            </h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
              El motor de IA analizará los {studentHitos.length} hitos registrados y los {studentEpisodios.length} episodios de la bitácora para redactar una síntesis pedagógica rigurosa según la Ley TEA.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateAiReport}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generar Informe Ahora con IA</span>
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3 print:hidden">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Analizando trayectoria pedagógica...</h3>
          <p className="text-xs text-slate-500">
            Sintetizando matrices sensoriales, hitos logrados y recomendaciones según normativa Ley N° 21.545
          </p>
        </div>
      )}

      {reporteGenerado && currentStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 md:p-10 space-y-6 text-slate-800 printable-document">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  {escuela.nombre}
                </span>
                <span className="text-2xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  RBD: {escuela.rbd}
                </span>
              </div>
              <p className="text-2xs text-slate-500">
                Programa de Integración Escolar (PIE) • {escuela.comuna}, {escuela.region}
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-xs font-bold text-indigo-900 block">
                INFORME DE PROGRESO Y SEGUIMIENTO PAEC
              </span>
              <span className="text-2xs text-slate-500">
                Ley TEA N° 21.545 • Res. Exenta N° 586
              </span>
            </div>
          </div>

          {/* Student Identifiers Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-2xs text-slate-500 block">Estudiante:</span>
              <strong className="text-slate-900">{currentStudent.nombre}</strong>
            </div>
            <div>
              <span className="text-2xs text-slate-500 block">RUT / Curso:</span>
              <strong className="text-slate-900 font-mono">{currentStudent.rut} • {currentStudent.curso}</strong>
            </div>
            <div>
              <span className="text-2xs text-slate-500 block">Diagnóstico:</span>
              <strong className="text-slate-900">{currentStudent.diagnosticoPie?.nivelTea?.split('.')[0] || 'TEA'}</strong>
            </div>
            <div>
              <span className="text-2xs text-slate-500 block">Periodo Evaluado:</span>
              <strong className="text-slate-900">{periodoReporte}</strong>
            </div>
          </div>

          {/* Report Sections */}
          <div className="space-y-6 text-xs leading-relaxed">
            {/* 1. Resumen Ejecutivo */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1">
                <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
                1. Síntesis y Trayectoria Socioemocional
              </h4>
              <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 text-justify">
                {reporteGenerado.resumenEjecutivo}
              </p>
            </div>

            {/* 2. Análisis de Hitos */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1">
                <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                2. Cumplimiento de Hitos Pedagógicos y Autorregulación
              </h4>
              <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 text-justify">
                {reporteGenerado.analisisHitos}
              </p>
            </div>

            {/* 3. Estrategias PAEC */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1">
                <span className="w-1.5 h-3.5 bg-amber-600 rounded-full"></span>
                3. Efectividad de las Estrategias de Contención y Apoyo
              </h4>
              <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 text-justify">
                {reporteGenerado.estrategiasEfectivas}
              </p>
            </div>

            {/* 4. Sugerencias Familia */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                4. Orientaciones y Co-responsabilidad con la Familia
              </h4>
              <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 text-justify">
                {reporteGenerado.orientacionesFamilia}
              </p>
            </div>

            {/* 5. Sugerencias Aula */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1">
                <span className="w-1.5 h-3.5 bg-purple-600 rounded-full"></span>
                5. Recomendaciones Pedagógicas para Aula Regular y Docentes
              </h4>
              <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 text-justify">
                {reporteGenerado.sugerenciasAula}
              </p>
            </div>
          </div>

          {/* Signatures Area */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-2xs mt-8">
            <div className="border-t border-slate-400 pt-2">
              <strong className="block text-slate-800">{currentStudent.nombreEducadoraDiferencial || 'Educadora Diferencial'}</strong>
              <span className="text-slate-500">Educadora Especialista PIE</span>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <strong className="block text-slate-800">{currentStudent.nombreProfesoraJefe || 'Profesor(a) Jefe'}</strong>
              <span className="text-slate-500">Docente de Aula Regular</span>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <strong className="block text-slate-800">{escuela.coordinadorPie || 'Coordinador(a) PIE'}</strong>
              <span className="text-slate-500">Coordinación PIE Institucional</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
