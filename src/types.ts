/**
 * Tipos de datos para el Gestor PAEC
 * Basado en la Ley TEA N° 21.545 y Resolución Exenta N° 586 de Chile
 */

export type TabType = 'estudiantes' | 'editor' | 'plantillas' | 'hitos' | 'bitacora' | 'reportes';

export type NivelTea = 
  | 'Nivel 1. Requiere apoyo.'
  | 'Nivel 2. Requiere apoyo sustancial.'
  | 'Nivel 3. Requiere apoyo muy sustancial.';

export type VinculoFamiliar = 'Madre' | 'Padre' | 'Tía(o)' | 'Abuela(o)' | 'Tutor Legal' | 'Hermano(a)' | 'Otro';

export interface PersonaContacto {
  prioridad: 1 | 2 | 3;
  nombre: string;
  telefono: string;
  vinculo: VinculoFamiliar;
  otroVinculo?: string;
}

export interface CambioTratamiento {
  id: string;
  descripcion: string;
  informante: string;
  fecha: string;
}

export interface TratamientoMedico {
  tieneTratamiento: boolean;
  medicamentos: string[];
  otroMedicamento?: string;
  descripcion: string; // Dosis, temporalidad, horario
  cambios: CambioTratamiento[];
}

export interface DiagnosticoPIE {
  trastornoEspectroAutista: boolean;
  nivelTea: NivelTea;
  comorbilidades: string[];
  otraComorbilidad?: string;
}

export interface AntecedentesDesarrolloPAEC {
  fechaInicio: string;
  fechaDesarrollo: string;
  fechaCierre: string;
  fechaEntrevistaInicial: string;
  fechaEntrevistaCierre: string;
  periodoAplicacion: 'Primer Semestre 2026' | 'Segundo Semestre 2026' | 'Primer y Segundo Semestre 2026';
  propuestaFlexible: boolean;
  fechasModificacion: string[];
}

export interface ItemPlanApoyo {
  id: string;
  dimension: 'contextual' | 'sensorial' | 'relacional';
  accionGatillante: string; // Acción, acontecimiento o situación posible de afectación conductual y/o emocional
  respuestaContencion: string; // Respuesta de contención / Estrategia de apoyo
  adultoMediador: string; // Adulto mediador responsable
}

export type RolInstitucional = 
  | 'Profesor(a) Jefe'
  | 'Educadora Diferencial PIE'
  | 'Terapeuta Ocupacional'
  | 'Fonoaudiólogo/a'
  | 'Psicólogo/a PIE'
  | 'Coordinador(a) PIE'
  | 'Inspector(a) General'
  | 'Asistente de Aula'
  | 'Apoderado(a)'
  | 'Directivo';

export interface FirmaTomaConocimiento {
  id: string;
  nombre: string;
  rol: RolInstitucional | string;
  firmado: boolean;
  fechaFirma: string;
}

export type EstadoHito = 'no_iniciado' | 'en_proceso' | 'en_desarrollo' | 'logrado' | 'consolidado';

export interface HitoPedagogico {
  id: string;
  estudianteId: string;
  titulo: string;
  descripcion: string;
  dimension: 'Sensorial' | 'Contextual' | 'Relacional' | 'Autonomía y Autorregulación' | 'Académico / DUA';
  estado: EstadoHito;
  porcentajeLogro: number;
  metaEsperada: string;
  fechaEvaluacion: string;
  responsable: string;
  observaciones: string;
}

export interface AccionFaseEpisodio {
  fase: 'Desencadenante' | 'Intensificación' | 'Explosión' | 'Recuperación';
  accionContencion: string;
  adultoMediador: string;
  resultado?: string;
}

export interface EpisodioDesregulacion {
  id: string;
  estudianteId: string;
  fecha: string;
  hora: string;
  responsableRegistro?: string;
  funcionResponsable?: string;
  lugar: string;
  actividad?: string;
  personasInvolucradas?: string;
  relatoOcurrido?: string;
  intensidad?: 'Leve' | 'Moderada' | 'Severa';
  gatillante: string;
  conductaObservada: string;
  estrategiaAplicada: string;
  tiempoRetornoCalmaMinutos?: number;
  adultosIntervinientes?: string;
  seContactaApoderado?: boolean;
  observacionesPosteriores?: string;
  fasesObservadas?: {
    desencadenante: boolean;
    intensificacion: boolean;
    explosion: boolean;
    recuperacion: boolean;
  };
  accionesPorFase?: AccionFaseEpisodio[];
  contactoApoderado?: boolean;
  horaContactoApoderado?: string;
  solicitudAcudirEstablecimiento?: boolean;
  activacionProtocoloAccidente?: boolean;
  derivacionSalaCalma?: boolean;
  seguimiento?: {
    fechaSeguimiento: string;
    descripcionAccion: string;
    situacionActual: string;
    responsableSeguimiento: string;
  };
}

export interface ReporteProgreso {
  id: string;
  estudianteId: string;
  fechaGeneracion: string;
  periodo: string;
  sintesisEjecutiva: string;
  fortalezasObservadas: string[];
  areasEnDesarrollo: string[];
  analisisEpisodios: string;
  recomendacionesFamilia: string[];
  recomendacionesEquipoDocente: string[];
  conclusionFinal: string;
  autor: string;
}

export interface EstudiantePAEC {
  id: string;
  // Datos personales y escolares
  nombre: string;
  rut: string;
  curso: string;
  fechaNacimiento: string;
  edad: string;
  nombreApoderado: string;
  numeroContactoApoderado: string;
  nombreProfesoraJefe: string;
  nombreEducadoraDiferencial: string;
  profesionalesApoyo?: {
    terapeutaOcupacional?: string;
    fonoaudiologo?: string;
    psicologo?: string;
    asistenteAula?: string;
  };
  // Personas de contacto prioritarias
  contactosEmergencia: PersonaContacto[];
  // Diagnóstico PIE
  diagnosticoPie: DiagnosticoPIE;
  // Tratamiento médico
  tratamientoMedico: TratamientoMedico;
  // Antecedentes socioemocionales y conductuales
  antecedentesSocioemocionales: string;
  descripcionEpisodiosPrevios: string;
  // Antecedentes desarrollo PAEC
  desarrolloPaec: AntecedentesDesarrolloPAEC;
  // Plan de apoyo preventivo y reactivo
  planApoyoContextual: ItemPlanApoyo[];
  planApoyoSensorial: ItemPlanApoyo[];
  planApoyoRelacional: ItemPlanApoyo[];
  // Firmas
  tomaConocimiento: FirmaTomaConocimiento[];
  // Metadatos
  creadoEl: string;
  actualizadoEl: string;
  estado: 'Borrador' | 'Activo' | 'En Revisión' | 'Cerrado';
}

export interface PlantillaPAEC {
  id: string;
  nombre: string;
  descripcion: string;
  nivelTea: NivelTea;
  etapaEducativa: 'Educación Parvularia' | 'Educación Básica' | 'Educación Media / TP';
  diagnosticoSugerido?: Partial<DiagnosticoPIE>;
  comorbilidadesSugeridas?: string[];
  sugerenciasAntecedentes?: string;
  sugerenciasDesregulacion?: string;
  tratamientoSugerido?: Partial<TratamientoMedico>;
  antecedentesSocioemocionalesEjemplo?: string;
  descripcionEpisodiosEjemplo?: string;
  planContextual: Omit<ItemPlanApoyo, 'id'>[];
  planSensorial: Omit<ItemPlanApoyo, 'id'>[];
  planRelacional: Omit<ItemPlanApoyo, 'id'>[];
  hitosSugeridos: Omit<HitoPedagogico, 'id' | 'estudianteId'>[];
}

export interface EscuelaConfig {
  nombre: string;
  nombreEstablecimiento?: string;
  rbd: string;
  dependencia: 'Municipal' | 'SLEP' | 'Particular Subvencionado' | 'Particular Pagado';
  direccion?: string;
  comuna: string;
  region: string;
  director: string;
  coordinadorPie: string;
  encargadoConvivencia: string;
  anoEscolar: string;
  logoUrl?: string;
}
