import React from 'react';
import { 
  Printer, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Stethoscope, 
  Sparkles,
  Layers,
  Edit3
} from 'lucide-react';
import { EstudiantePAEC, EscuelaConfig } from '../types';

interface OfficialDocumentViewProps {
  student: EstudiantePAEC;
  escuela: EscuelaConfig;
  onBack: () => void;
  onEdit: () => void;
}

export const OfficialDocumentView: React.FC<OfficialDocumentViewProps> = ({
  student,
  escuela,
  onBack,
  onEdit
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top action toolbar (hidden on print) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Editor / Listado</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar PAEC</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF Oficial</span>
          </button>
        </div>
      </div>

      {/* Official Legal PAEC Sheet */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 space-y-8 font-sans printable-document">
        {/* School Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
          <div>
            <span className="font-extrabold text-sm uppercase tracking-wide block text-slate-900">
              {escuela.nombre}
            </span>
            <div className="text-2xs text-slate-600 space-y-0.5 mt-0.5">
              <p>RBD: {escuela.rbd} • Dependencia: {escuela.dependencia}</p>
              <p>{escuela.direccion}, {escuela.comuna} • Región: {escuela.region}</p>
              <p>Directora: {escuela.director} • Coordinador(a) PIE: {escuela.coordinadorPie}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 uppercase block">
              MINISTERIO DE EDUCACIÓN
            </span>
            <span className="text-2xs font-semibold text-indigo-900 block">
              Programa de Integración Escolar (PIE)
            </span>
            <span className="text-2xs text-slate-500 font-mono">
              Año Escolar {escuela.anoEscolar}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">
            PLAN DE ACOMPAÑAMIENTO EMOCIONAL Y CONDUCTUAL (PAEC)
          </h1>
          <p className="text-xs text-slate-600 font-semibold">
            En conformidad a la Ley N° 21.545 (Ley TEA) y Resolución Exenta N° 586 del MINEDUC
          </p>
        </div>

        {/* I) Objetivo */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 text-slate-900">
            I) OBJETIVO
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed text-justify px-2">
            El presente Plan de Acompañamiento Emocional y Conductual constituye un conjunto de acciones preventivas y de abordaje emocional y conductual, que acompañará la trayectoria educativa del estudiante de acuerdo a sus necesidades específicas en este ámbito. Su propósito fundamental es mitigar su vulnerabilidad ante el entorno y responder comprensiva y eficazmente ante conductas desafiantes de manejar para el contexto educativo, sea por su intensidad, naturaleza o temporalidad (Resolución Exenta N° 586).
          </p>
        </div>

        {/* II) Datos de Identificación */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 text-slate-900">
            II) DATOS DE IDENTIFICACIÓN
          </h2>

          {/* a) Personales y Escolares */}
          <div className="space-y-2 px-2">
            <h3 className="text-2xs font-bold uppercase text-slate-700">
              a) Identificación Personal y Escolar
            </h3>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold bg-slate-50 w-1/4 border-r border-slate-300">Nombre Estudiante:</td>
                  <td className="p-2 w-1/4 border-r border-slate-300">{student.nombre}</td>
                  <td className="p-2 font-bold bg-slate-50 w-1/4 border-r border-slate-300">RUT / Edad:</td>
                  <td className="p-2 w-1/4 font-mono">{student.rut} ({student.edad || 'No calculada'})</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Curso:</td>
                  <td className="p-2 border-r border-slate-300">{student.curso}</td>
                  <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Fecha Nacimiento:</td>
                  <td className="p-2">{student.fechaNacimiento || 'No registrada'}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Apoderado Titular:</td>
                  <td className="p-2 border-r border-slate-300">{student.nombreApoderado}</td>
                  <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Contacto Apoderado:</td>
                  <td className="p-2 font-mono">{student.numeroContactoApoderado}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Profesor(a) Jefe:</td>
                  <td className="p-2 border-r border-slate-300">{student.nombreProfesoraJefe}</td>
                  <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Educador(a) PIE:</td>
                  <td className="p-2">{student.nombreEducadoraDiferencial}</td>
                </tr>
                {student.profesionalesApoyo && (
                  <tr>
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Otros Profesionales PIE:</td>
                    <td colSpan={3} className="p-2 text-2xs">
                      {student.profesionalesApoyo.terapeutaOcupacional && `TO: ${student.profesionalesApoyo.terapeutaOcupacional} • `}
                      {student.profesionalesApoyo.fonoaudiologo && `Flgo: ${student.profesionalesApoyo.fonoaudiologo} • `}
                      {student.profesionalesApoyo.psicologo && `Ps: ${student.profesionalesApoyo.psicologo}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* b) Contactos de Prioridad */}
          <div className="space-y-2 px-2">
            <h3 className="text-2xs font-bold uppercase text-slate-700">
              b) Personas que se contactarán en caso de Desregulación Emocional y Conductual
            </h3>
            <table className="w-full text-xs border border-slate-300 border-collapse text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">Prioridad</th>
                  <th className="p-2 border-r border-slate-300">Nombre Completo</th>
                  <th className="p-2 border-r border-slate-300">Teléfono</th>
                  <th className="p-2">Vínculo</th>
                </tr>
              </thead>
              <tbody>
                {([1, 2, 3] as const).map(p => {
                  const c = student.contactosEmergencia.find(x => x.prioridad === p);
                  return (
                    <tr key={p} className="border-b border-slate-300">
                      <td className="p-2 font-bold border-r border-slate-300">{p}° Prioridad</td>
                      <td className="p-2 border-r border-slate-300">{c?.nombre || 'No registrado'}</td>
                      <td className="p-2 font-mono border-r border-slate-300">{c?.telefono || '-'}</td>
                      <td className="p-2">{c?.vinculo || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* c) Diagnóstico PIE */}
          <div className="space-y-2 px-2">
            <h3 className="text-2xs font-bold uppercase text-slate-700">
              c) Diagnóstico de Ingreso PIE (Ley TEA N° 21.545)
            </h3>
            <div className="p-3 border border-slate-300 rounded text-xs space-y-1.5 bg-slate-50/50">
              <div>
                <strong>Nivel de Apoyo TEA:</strong> <span className="font-semibold text-slate-900">{student.diagnosticoPie?.nivelTea}</span>
              </div>
              <div>
                <strong>Comorbilidades Asociadas:</strong>{' '}
                <span>{student.diagnosticoPie?.comorbilidades?.join(', ') || 'Ninguna registrada'}</span>
                {student.diagnosticoPie?.otraComorbilidad && ` • ${student.diagnosticoPie.otraComorbilidad}`}
              </div>
            </div>
          </div>

          {/* d) Tratamiento Médico */}
          <div className="space-y-2 px-2">
            <h3 className="text-2xs font-bold uppercase text-slate-700">
              d) Tratamiento Médico
            </h3>
            <div className="p-3 border border-slate-300 rounded text-xs space-y-2">
              <p>
                <strong>¿Mantiene Tratamiento Farmacológico?:</strong> {student.tratamientoMedico?.tieneTratamiento ? 'SÍ' : 'NO'}
              </p>
              {student.tratamientoMedico?.tieneTratamiento && (
                <>
                  <p>
                    <strong>Fármacos Indicados:</strong> {student.tratamientoMedico.medicamentos.join(', ') || 'No especificados'}
                  </p>
                  <p>
                    <strong>Indicación / Posología:</strong> {student.tratamientoMedico.descripcion || 'Sin detalle de horario'}
                  </p>
                  {student.tratamientoMedico.cambios.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <strong className="block text-2xs uppercase mb-1">Registro de Cambios en Tratamiento:</strong>
                      <ul className="list-disc pl-4 space-y-1 text-2xs">
                        {student.tratamientoMedico.cambios.map(c => (
                          <li key={c.id}>
                            <strong>{c.fecha}:</strong> {c.descripcion} (Informante: {c.informante})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* e y f) Socioemocional y Desregulación */}
          <div className="space-y-2 px-2">
            <h3 className="text-2xs font-bold uppercase text-slate-700">
              e) y f) Antecedentes Socioemocionales y Conductuales / Episodios de Desregulación
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 border border-slate-300 rounded bg-slate-50/50">
                <strong className="block mb-1 text-2xs uppercase">Antecedentes Socioemocionales:</strong>
                <p className="leading-relaxed text-justify">{student.antecedentesSocioemocionales || 'No registrados.'}</p>
              </div>
              <div className="p-3 border border-slate-300 rounded bg-slate-50/50">
                <strong className="block mb-1 text-2xs uppercase">Descripción de Episodios Previos de Desregulación:</strong>
                <p className="leading-relaxed text-justify">{student.descripcionEpisodiosPrevios || 'No registrados.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* III) Antecedentes Desarrollo PAEC */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 text-slate-900">
            III) ANTECEDENTES RESPECTO AL DESARROLLO DEL PLAN DE ACOMPAÑAMIENTO
          </h2>
          <table className="w-full text-xs border border-slate-300 border-collapse">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-50 w-1/4 border-r border-slate-300">Fechas Elaboración:</td>
                <td className="p-2 border-r border-slate-300" colSpan={3}>
                  Inicio: {student.desarrolloPaec?.fechaInicio || '-'} • Desarrollo: {student.desarrolloPaec?.fechaDesarrollo || '-'} • Cierre: {student.desarrolloPaec?.fechaCierre || '-'}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Entrevistas Apoderado:</td>
                <td className="p-2 border-r border-slate-300" colSpan={3}>
                  Entrevista Inicial: {student.desarrolloPaec?.fechaEntrevistaInicial || '-'} • Entrevista Cierre: {student.desarrolloPaec?.fechaEntrevistaCierre || '-'}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Periodo de Aplicación:</td>
                <td className="p-2 border-r border-slate-300">{student.desarrolloPaec?.periodoAplicacion}</td>
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Propuesta Flexible:</td>
                <td className="p-2">{student.desarrolloPaec?.propuestaFlexible ? 'SÍ (Modificable)' : 'NO'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* IV) Plan de Apoyo (Matriz Oficial Res. 586) */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 text-slate-900">
            IV) DESARROLLO DEL PLAN DE APOYO (RESOLUCIÓN EXENTA N° 586)
          </h2>

          {/* 1. Contextual */}
          <div className="space-y-1.5 px-2">
            <h3 className="text-2xs font-bold uppercase text-slate-800 bg-slate-50 p-1.5 border border-slate-200">
              1. ELEMENTOS CONTEXTUALES (Espacio, Factores Ambientales, Metodologías, Transiciones)
            </h3>
            <table className="w-full text-2xs border border-slate-300 border-collapse text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-5/12">Acción / Acontecimiento de Posible Afectación</th>
                  <th className="p-2 border-r border-slate-300 w-4/12">Respuesta de Contención / Estrategia</th>
                  <th className="p-2 w-3/12">Adulto Mediador</th>
                </tr>
              </thead>
              <tbody>
                {student.planApoyoContextual.length === 0 ? (
                  <tr><td colSpan={3} className="p-2 text-center text-slate-400">Sin registros.</td></tr>
                ) : (
                  student.planApoyoContextual.map((item) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 align-top">{item.accionGatillante}</td>
                      <td className="p-2 border-r border-slate-300 align-top">{item.respuestaContencion}</td>
                      <td className="p-2 align-top">{item.adultoMediador}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 2. Sensorial */}
          <div className="space-y-1.5 px-2">
            <h3 className="text-2xs font-bold uppercase text-slate-800 bg-slate-50 p-1.5 border border-slate-200">
              2. ELEMENTOS SENSORIALES (Auditivo, Visual, Táctil, Vestibular, Interocepción)
            </h3>
            <table className="w-full text-2xs border border-slate-300 border-collapse text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-5/12">Acción / Acontecimiento de Posible Afectación</th>
                  <th className="p-2 border-r border-slate-300 w-4/12">Respuesta de Contención / Estrategia</th>
                  <th className="p-2 w-3/12">Adulto Mediador</th>
                </tr>
              </thead>
              <tbody>
                {student.planApoyoSensorial.length === 0 ? (
                  <tr><td colSpan={3} className="p-2 text-center text-slate-400">Sin registros.</td></tr>
                ) : (
                  student.planApoyoSensorial.map((item) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 align-top">{item.accionGatillante}</td>
                      <td className="p-2 border-r border-slate-300 align-top">{item.respuestaContencion}</td>
                      <td className="p-2 align-top">{item.adultoMediador}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 3. Relacional */}
          <div className="space-y-1.5 px-2">
            <h3 className="text-2xs font-bold uppercase text-slate-800 bg-slate-50 p-1.5 border border-slate-200">
              3. ELEMENTOS RELACIONALES (Comunicación, Interacción con Pares, Docentes y Asistentes)
            </h3>
            <table className="w-full text-2xs border border-slate-300 border-collapse text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-5/12">Acción / Acontecimiento de Posible Afectación</th>
                  <th className="p-2 border-r border-slate-300 w-4/12">Respuesta de Contención / Estrategia</th>
                  <th className="p-2 w-3/12">Adulto Mediador</th>
                </tr>
              </thead>
              <tbody>
                {student.planApoyoRelacional.length === 0 ? (
                  <tr><td colSpan={3} className="p-2 text-center text-slate-400">Sin registros.</td></tr>
                ) : (
                  student.planApoyoRelacional.map((item) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 align-top">{item.accionGatillante}</td>
                      <td className="p-2 border-r border-slate-300 align-top">{item.respuestaContencion}</td>
                      <td className="p-2 align-top">{item.adultoMediador}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* V) Toma de Conocimiento y Firmas */}
        <div className="space-y-3 page-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-slate-900 text-slate-900">
            V) TOMA DE CONOCIMIENTO Y REGISTRO DE FIRMAS
          </h2>
          <p className="text-2xs text-slate-600 px-2">
            Los abajo firmantes declaran haber tomado pleno conocimiento del Plan de Acompañamiento Emocional y Conductual y se comprometen a implementar las acciones y estrategias preventivas y reactivas aquí estipuladas.
          </p>

          <table className="w-full text-2xs border border-slate-300 border-collapse text-left">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">Nombre</th>
                <th className="p-2 border-r border-slate-300">Función / Rol</th>
                <th className="p-2 border-r border-slate-300">Fecha</th>
                <th className="p-2 text-center w-36">Firma</th>
              </tr>
            </thead>
            <tbody>
              {student.tomaConocimiento.map((tk) => (
                <tr key={tk.id} className="border-b border-slate-300 h-12">
                  <td className="p-2 border-r border-slate-300 font-semibold">{tk.nombre || '________________________'}</td>
                  <td className="p-2 border-r border-slate-300">{tk.rol}</td>
                  <td className="p-2 border-r border-slate-300">{tk.fechaFirma || '-'}</td>
                  <td className="p-2 text-center align-bottom text-2xs text-slate-400">
                    {tk.firmado ? '✓ Registrado' : '__________________'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
