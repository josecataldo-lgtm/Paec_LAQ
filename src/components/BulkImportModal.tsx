import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ClipboardCopy, 
  Layers, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { EstudiantePAEC, HitoPedagogico, NivelTea } from '../types';
import { formatRut, calculateAge, validateRut } from '../utils/helpers';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (newStudents: EstudiantePAEC[], mode: 'append' | 'replace') => void;
  existingCount: number;
}

interface ParsedStudentRow {
  nombre: string;
  rut: string;
  curso: string;
  fechaNacimiento: string;
  nivelTea: string;
  nombreApoderado: string;
  telefonoApoderado: string;
  profesoraJefe: string;
  educadoraPie: string;
  comorbilidades: string;
  antecedentes: string;
  isValid: boolean;
  validationError?: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
  existingCount
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'paste' | 'json'>('paste');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [createInitialMilestones, setCreateInitialMilestones] = useState<boolean>(true);
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [jsonBackupData, setJsonBackupData] = useState<EstudiantePAEC[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // CSV Template download
  const handleDownloadTemplate = () => {
    const headers = [
      "Nombre Completo",
      "RUT",
      "Curso",
      "Fecha Nacimiento (AAAA-MM-DD)",
      "Nivel TEA (1, 2 o 3)",
      "Nombre Apoderado",
      "Telefono Apoderado",
      "Profesor(a) Jefe",
      "Educadora Diferencial PIE",
      "Comorbilidades",
      "Antecedentes Socioemocionales"
    ];

    const sampleRow1 = [
      "Agustín Andrés Silva Morales",
      "24.589.123-4",
      "5° Básico A",
      "2014-06-15",
      "1",
      "Carolina Morales Pérez",
      "+569 9876 5432",
      "Marcelo Vega R.",
      "Patricia Gómez",
      "Trastorno del Procesamiento Sensorial",
      "Sensibilidad a ruidos fuertes en patio y cambios de sala."
    ];

    const sampleRow2 = [
      "Sofia Ignacia Valenzuela Castro",
      "23.112.450-K",
      "7° Básico B",
      "2012-10-22",
      "2",
      "Roberto Valenzuela",
      "+569 8765 4321",
      "Claudia Herrera",
      "Camila Soto",
      "TDAH",
      "Requiere anticipación visual con timer para transiciones."
    ];

    const csvContent = "\uFEFF" + [
      headers.join(";"),
      sampleRow1.join(";"),
      sampleRow2.join(";")
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Plantilla_Carga_Masiva_PAEC.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust line and column parser supporting CSV, TSV (Excel copy-paste), semicolons and commas
  const parseRawText = (text: string) => {
    setErrorFeedback(null);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return;

    // Detect delimiter: tab (Excel paste), semicolon, or comma
    const firstLine = lines[0];
    let delimiter = '\t';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';')) delimiter = ';';
    else if (firstLine.includes(',')) delimiter = ',';

    const rows: ParsedStudentRow[] = [];

    // Check if first line is a header
    const lowerFirst = firstLine.toLowerCase();
    const hasHeader = lowerFirst.includes('nombre') || lowerFirst.includes('rut') || lowerFirst.includes('curso') || lowerFirst.includes('estudiante');
    const startIdx = hasHeader ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted cells or simple split
      const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length === 0 || !cols[0]) continue;

      const rawNombre = cols[0] || '';
      const rawRut = cols[1] || '';
      const rawCurso = cols[2] || 'Sin Curso';
      const rawFechaNac = cols[3] || '';
      const rawNivel = cols[4] || '1';
      const rawApoNombre = cols[5] || '';
      const rawApoTel = cols[6] || '';
      const rawProfeJefe = cols[7] || '';
      const rawEduPie = cols[8] || '';
      const rawComorb = cols[9] || '';
      const rawAntec = cols[10] || '';

      const formattedRut = formatRut(rawRut);
      const isRutValid = formattedRut.length >= 8 ? validateRut(formattedRut) : true;
      const isValid = rawNombre.length >= 3;

      let errorMsg = undefined;
      if (rawNombre.length < 3) errorMsg = 'Nombre muy corto';
      else if (formattedRut && !isRutValid) errorMsg = 'RUT con dígito verificador inválido (se cargará como advertencia)';

      rows.push({
        nombre: rawNombre,
        rut: formattedRut,
        curso: rawCurso,
        fechaNacimiento: rawFechaNac,
        nivelTea: rawNivel.includes('3') ? 'Nivel 3' : rawNivel.includes('2') ? 'Nivel 2' : 'Nivel 1',
        nombreApoderado: rawApoNombre,
        telefonoApoderado: rawApoTel,
        profesoraJefe: rawProfeJefe,
        educadoraPie: rawEduPie,
        comorbilidades: rawComorb,
        antecedentes: rawAntec,
        isValid,
        validationError: errorMsg
      });
    }

    setParsedRows(rows);
    if (rows.length === 0) {
      setErrorFeedback('No se detectaron registros válidos en los datos ingresados.');
    }
  };

  // File Upload handler for CSV or JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          // Check if it's our full backup structure or array of students
          const studentList = Array.isArray(json) 
            ? json 
            : Array.isArray(json.estudiantes) 
            ? json.estudiantes 
            : null;

          if (studentList && studentList.length > 0) {
            setJsonBackupData(studentList);
            setErrorFeedback(null);
          } else {
            setErrorFeedback('El archivo JSON no contiene un arreglo de estudiantes válido.');
          }
        } catch {
          setErrorFeedback('Error al leer el archivo JSON. Verifique su formato.');
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseRawText(text);
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  // Confirm Import
  const handleConfirmImport = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Case 1: Importing from JSON backup
    if (activeTab === 'json' && jsonBackupData && jsonBackupData.length > 0) {
      onImportStudents(jsonBackupData, importMode);
      onClose();
      return;
    }

    // Case 2: Importing from CSV / Paste
    if (parsedRows.length === 0) return;

    const newStudents: EstudiantePAEC[] = parsedRows.map((row, index) => {
      const studentId = `st-bulk-${Date.now()}-${index}`;
      const nivelEnum: NivelTea = row.nivelTea === 'Nivel 3'
        ? 'Nivel 3. Requiere apoyo muy sustancial.'
        : row.nivelTea === 'Nivel 2'
        ? 'Nivel 2. Requiere apoyo sustancial.'
        : 'Nivel 1. Requiere apoyo.';

      const calculatedAge = row.fechaNacimiento ? calculateAge(row.fechaNacimiento) : '';

      return {
        id: studentId,
        nombre: row.nombre,
        rut: row.rut,
        curso: row.curso || '1° Básico A',
        fechaNacimiento: row.fechaNacimiento,
        edad: calculatedAge,
        nombreApoderado: row.nombreApoderado || '',
        numeroContactoApoderado: row.telefonoApoderado || '',
        nombreProfesoraJefe: row.profesoraJefe || '',
        nombreEducadoraDiferencial: row.educadoraPie || '',
        profesionalesApoyo: {
          profesorJefe: row.profesoraJefe || '',
          educadoraDiferencial: row.educadoraPie || '',
          terapeutaOcupacional: 'Por designar',
          fonoaudiologo: 'Por designar',
          psicologo: 'Por designar',
          asistenteAula: 'Por designar'
        },
        contactosEmergencia: [
          { prioridad: 1, nombre: row.nombreApoderado || '', telefono: row.telefonoApoderado || '', vinculo: 'Madre' },
          { prioridad: 2, nombre: '', telefono: '', vinculo: 'Padre' },
          { prioridad: 3, nombre: '', telefono: '', vinculo: 'Tutor Legal' }
        ],
        diagnosticoPie: {
          trastornoEspectroAutista: true,
          nivelTea: nivelEnum,
          comorbilidades: row.comorbilidades ? row.comorbilidades.split(',').map(c => c.trim()) : []
        },
        tratamientoMedico: {
          tieneTratamiento: false,
          medicamentos: [],
          descripcion: '',
          cambios: []
        },
        antecedentesSocioemocionales: row.antecedentes || 'Sensibilidad sensorial y necesidad de estructuración de rutina.',
        descripcionEpisodiosPrevios: 'Sin registros de episodios de desregulación previos informados.',
        desarrolloPaec: {
          fechaInicio: todayStr,
          fechaDesarrollo: todayStr,
          fechaCierre: '',
          fechaEntrevistaInicial: todayStr,
          fechaEntrevistaCierre: '',
          periodoAplicacion: 'Primer y Segundo Semestre 2026',
          propuestaFlexible: true,
          fechasModificacion: []
        },
        planApoyoContextual: [
          {
            id: `ctx-${Date.now()}-1`,
            dimension: 'contextual',
            accionGatillante: 'Cambio imprevisto de sala de clases o sustitución de docente.',
            respuestaContencion: 'Uso de panel de anticipación visual individual con 15 minutos de aviso.',
            adultoMediador: row.educadoraPie || 'Educadora Diferencial PIE'
          }
        ],
        planApoyoSensorial: [
          {
            id: `sen-${Date.now()}-1`,
            dimension: 'sensorial',
            accionGatillante: 'Timbre estridente de recreo o ruido masivo en patio.',
            respuestaContencion: 'Permitir uso preventivo de auriculares con cancelación de ruido 3 minutos antes.',
            adultoMediador: row.profesoraJefe || 'Profesor(a) Jefe'
          }
        ],
        planApoyoRelacional: [
          {
            id: `rel-${Date.now()}-1`,
            dimension: 'relacional',
            accionGatillante: 'Juegos grupales en recreos con reglas complejas no explícitas.',
            respuestaContencion: 'Facilitar mediación con roles definidos y apoyo de pares tutores capacitados.',
            adultoMediador: 'Asistente de Aula / Inspectoría'
          }
        ],
        tomaConocimiento: [
          { id: '1', nombre: row.profesoraJefe || 'Profesor(a) Jefe', rol: 'Profesor(a) Jefe', firmado: false, fechaFirma: todayStr },
          { id: '2', nombre: row.educadoraPie || 'Educadora Diferencial PIE', rol: 'Educadora Diferencial PIE', firmado: false, fechaFirma: todayStr },
          { id: '3', nombre: row.nombreApoderado || 'Apoderado(a)', rol: 'Apoderado(a)', firmado: false, fechaFirma: todayStr }
        ],
        estado: 'Borrador',
        creadoEl: todayStr,
        actualizadoEl: todayStr
      };
    });

    onImportStudents(newStudents, importMode);
    onClose();
  };

  const validRowCount = parsedRows.filter(r => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Carga Masiva de Estudiantes y Expedientes PAEC</span>
              </h2>
              <p className="text-xs text-slate-400">
                Importa listas desde Excel, Google Sheets, CSV o respaldos JSON
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

        {/* Tabs */}
        <div className="bg-slate-100 px-6 pt-3 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-t border-x ${
              activeTab === 'paste'
                ? 'bg-white text-emerald-800 border-slate-200 shadow-xs'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            📋 Copiar y Pegar desde Excel
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-t border-x ${
              activeTab === 'csv'
                ? 'bg-white text-emerald-800 border-slate-200 shadow-xs'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            📁 Subir Archivo Excel / CSV
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-t border-x ${
              activeTab === 'json'
                ? 'bg-white text-emerald-800 border-slate-200 shadow-xs'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            💾 Respaldo JSON
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-700 flex-1">
          {/* TAB 1: PASTE FROM EXCEL */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ClipboardCopy className="w-3.5 h-3.5 text-emerald-700" />
                    Cómo importar directamente desde Excel o Google Sheets:
                  </p>
                  <p className="text-[11px] text-slate-600">
                    1. En tu planilla, selecciona las celdas de tus estudiantes (con o sin encabezado).<br/>
                    2. Presiona <strong>Ctrl + C</strong> y pégalas en el recuadro inferior con <strong>Ctrl + V</strong>.<br/>
                    3. El sistema autodetectará las columnas de Nombre, RUT, Curso, Nivel TEA y Apoderados.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 rounded-lg font-bold text-2xs flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Plantilla CSV</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Pega aquí las filas copiadas de tu Excel / Planilla:
                </label>
                <textarea
                  rows={6}
                  placeholder={`Agustín Andrés Silva Morales\t24.589.123-4\t5° Básico A\t2014-06-15\t1\tCarolina Morales\t+56998765432
Sofia Ignacia Valenzuela\t23.112.450-K\t7° Básico B\t2012-10-22\t2\tRoberto Valenzuela\t+56987654321`}
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    parseRawText(e.target.value);
                  }}
                  className="w-full p-3 font-mono text-[11px] border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD CSV FILE */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center">
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mb-2" />
                <p className="font-bold text-slate-800 text-sm mb-1">
                  Selecciona tu archivo de estudiantes (.csv o .txt)
                </p>
                <p className="text-slate-500 text-2xs mb-4">
                  Separado por comas, punto y coma o tabulaciones
                </p>
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="csv-file-input"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Examinar Archivo</span>
                  </label>
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Descargar Plantilla</span>
                  </button>
                </div>
                {fileName && (
                  <p className="mt-3 text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    📄 {fileName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: JSON BACKUP */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50">
                <Database className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm mb-1">
                  Restaurar Respaldo Completo en formato JSON
                </p>
                <p className="text-slate-500 text-2xs mb-4">
                  Carga un archivo generado previamente con el botón "Respaldar Datos JSON"
                </p>
                <input
                  type="file"
                  id="json-file-input"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="json-file-input"
                  className="inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cargar Archivo .json</span>
                </label>
                {jsonBackupData && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs text-blue-900">
                    <p className="font-bold">✅ Archivo de respaldo válido detectado:</p>
                    <p className="text-[11px] mt-0.5">Se cargarán {jsonBackupData.length} expedientes completos con sus hitos y matrices correspondientes.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {errorFeedback && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorFeedback}</span>
            </div>
          )}

          {/* PREVIEW TABLE (For CSV / Paste) */}
          {activeTab !== 'json' && parsedRows.length > 0 && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Vista Previa ({validRowCount} de {parsedRows.length} registros listos)
                </h4>
                <span className="text-2xs text-slate-500">
                  Verifica que los datos coincidan antes de confirmar
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2 border-b">#</th>
                      <th className="p-2 border-b">Estudiante</th>
                      <th className="p-2 border-b">RUT</th>
                      <th className="p-2 border-b">Curso</th>
                      <th className="p-2 border-b">Nivel TEA</th>
                      <th className="p-2 border-b">Apoderado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                        <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{row.nombre}</td>
                        <td className="p-2 font-mono text-slate-600">{row.rut || '—'}</td>
                        <td className="p-2 font-medium text-slate-700">{row.curso}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800">
                            {row.nivelTea}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600 truncate max-w-xs">{row.nombreApoderado || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Mode Options */}
          {(parsedRows.length > 0 || jsonBackupData) && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Opciones de Importación
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  importMode === 'append' ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-500' : 'bg-white border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Agregar a los existentes</span>
                    <span className="text-[11px] text-slate-500">Conserva los {existingCount} estudiantes actuales y suma los nuevos.</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  importMode === 'replace' ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-500' : 'bg-white border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Reemplazar lista completa</span>
                    <span className="text-[11px] text-slate-500">Borra los anteriores e inicia con la nueva lista importada.</span>
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={createInitialMilestones}
                    onChange={(e) => setCreateInitialMilestones(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Generar automáticamente estructura inicial del PAEC (Matrices Res. Exenta 586)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={(activeTab === 'json' ? !jsonBackupData : validRowCount === 0)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            <span>
              {activeTab === 'json'
                ? `Importar ${jsonBackupData?.length || 0} Expedientes JSON`
                : `Confirmar Carga de ${validRowCount} Estudiantes`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
