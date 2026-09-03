import { EstudiantePAEC, EscuelaConfig, HitoPedagogico, EpisodioDesregulacion } from '../types';

export const ESCUELA_DEFAULT: EscuelaConfig = {
  nombre: 'Liceo Agrícola de Quillota "Profesor Víctor Olguín Morales"',
  nombreEstablecimiento: 'Liceo Agrícola de Quillota "Profesor Víctor Olguín Morales"',
  rbd: '1452-3',
  dependencia: 'Municipal',
  direccion: 'Av. Condell 340',
  comuna: 'Quillota',
  region: 'Región de Valparaíso',
  director: 'Prof. Mario Valenzuela Sepúlveda',
  coordinadorPie: 'Mg. Claudia Arancibia Fuentes',
  encargadoConvivencia: 'Ps. Rodrigo Morales Silva',
  anoEscolar: '2026'
};

export const DEFAULT_ESCUELA_CONFIG = ESCUELA_DEFAULT;

export const ESTUDIANTES_INICIALES: EstudiantePAEC[] = [
  {
    id: 'est-001',
    nombre: 'Lucas Benjamín Valenzuela Morales',
    rut: '22.485.912-K',
    curso: '6° Básico A',
    fechaNacimiento: '2014-04-18',
    edad: '12 años',
    nombreApoderado: 'Patricia Morales Henríquez',
    numeroContactoApoderado: '+56 9 8452 1198',
    nombreProfesoraJefe: 'Prof. Marcela Contreras Vidal',
    nombreEducadoraDiferencial: 'Ed. Viviana Carrasco López',
    profesionalesApoyo: {
      terapeutaOcupacional: 'TO. Gabriel Oyarzún',
      fonoaudiologo: 'Flga. Camila Soto',
      psicologo: 'Ps. Andrea Vergara'
    },
    contactosEmergencia: [
      {
        prioridad: 1,
        nombre: 'Patricia Morales Henríquez',
        telefono: '+56 9 8452 1198',
        vinculo: 'Madre'
      },
      {
        prioridad: 2,
        nombre: 'Gonzalo Valenzuela Rivas',
        telefono: '+56 9 7312 9945',
        vinculo: 'Padre'
      },
      {
        prioridad: 3,
        nombre: 'Rosa Henríquez Bravo',
        telefono: '+56 9 9123 4488',
        vinculo: 'Abuela(o)'
      }
    ],
    diagnosticoPie: {
      trastornoEspectroAutista: true,
      nivelTea: 'Nivel 1. Requiere apoyo.',
      comorbilidades: [
        'Trastorno de Integración Sensorial',
        'Déficit Atencional'
      ]
    },
    tratamientoMedico: {
      tieneTratamiento: true,
      medicamentos: ['Metilfenidato'],
      descripcion: 'Metilfenidato 10mg: 1 comprimido matutino en el desayuno (07:30 hrs). Indicado por Neurólogo Dr. Fernando Riquelme.',
      cambios: [
        {
          id: 'cambio-1',
          descripcion: 'Ajuste de dosis de 5mg a 10mg por recomendación médica de control semestral.',
          informante: 'Madre (cert. neurólogo adjunto)',
          fecha: '2026-03-10'
        }
      ]
    },
    antecedentesSocioemocionales: 'Estudiante con lenguaje formal enriquecido. Presenta intereses restringidos en entomología y astronomía. Manifiesta alta sensibilidad al ruido ambiental imprevisto (gritos, timbres). Requiere anticipación de transiciones para evitar sobrecarga.',
    descripcionEpisodiosPrevios: 'Ante cambios no advertidos de profesor o exceso de bullicio en el patio, suele bloquearse, taparse los oídos y retirarse al fondo de la sala o solicitar ir al baño a lavarse la cara.',
    desarrolloPaec: {
      fechaInicio: '2026-03-05',
      fechaDesarrollo: '2026-03-18',
      fechaCierre: '2026-12-15',
      fechaEntrevistaInicial: '2026-03-12',
      fechaEntrevistaCierre: '2026-11-28',
      periodoAplicacion: 'Primer y Segundo Semestre 2026',
      propuestaFlexible: true,
      fechasModificacion: ['2026-03-18', '2026-06-20']
    },
    planApoyoContextual: [
      {
        id: 'ctx-1',
        dimension: 'contextual',
        accionGatillante: 'Cambios imprevistos de sala, suspensión de clases o actos escolares sin previo aviso.',
        respuestaContencion: 'Uso de panel de anticipación visual y recordatorio verbal individualizado 10 minutos antes del inicio de la actividad por parte del profesor jefe.',
        adultoMediador: 'Prof. Marcela Contreras (Prof. Jefe) / Ed. Viviana Carrasco (PIE)'
      },
      {
        id: 'ctx-2',
        dimension: 'contextual',
        accionGatillante: 'Evaluaciones escritas de formato extenso con instrucciones complejas.',
        respuestaContencion: 'Aplicación de Decreto 83: parcelación de ítems en 2 tiempos con descanso visual de 3 minutos y tiempo adicional de 15 minutos.',
        adultoMediador: 'Profesor(a) de Asignatura'
      }
    ],
    planApoyoSensorial: [
      {
        id: 'sen-1',
        dimension: 'sensorial',
        accionGatillante: 'Timbres de recreo de tono agudo y bullicio simultáneo en pasillos.',
        respuestaContencion: 'Autorización para salida anticipada 2 minutos antes del timbre general y uso de auriculares de cancelación de ruido en recreos masivos.',
        adultoMediador: 'Asistente de Aula / Inspector de Patio'
      },
      {
        id: 'sen-2',
        dimension: 'sensorial',
        accionGatillante: 'Sobrecarga de estímulos lumínicos directos en sala de clases.',
        respuestaContencion: 'Ubicación de puesto escolar en hilera intermedia, lejos de reflejos directos de ventanales o fluorescentes con zumbido.',
        adultoMediador: 'TO. Gabriel Oyarzún / Educadora PIE'
      }
    ],
    planApoyoRelacional: [
      {
        id: 'rel-1',
        dimension: 'relacional',
        accionGatillante: 'Trabajos grupales sin asignación precisa de roles o con discusiones abiertas.',
        respuestaContencion: 'Asignación estructurada de roles específicos (ej. encargado de redacción, custodio de materiales) con pauta de pasos claros.',
        adultoMediador: 'Prof. de Asignatura / Docente PIE'
      },
      {
        id: 'rel-2',
        dimension: 'relacional',
        accionGatillante: 'Situaciones de conflicto o malentendidos con pares durante juegos deportivos.',
        respuestaContencion: 'Mediación con preguntas cerradas y neutrales, validando su perspectiva y recordando las reglas explícitas de convivencia.',
        adultoMediador: 'Encargado de Convivencia / Asistente de Educación'
      }
    ],
    tomaConocimiento: [
      {
        id: 'tk-1',
        nombre: 'Marcela Contreras Vidal',
        rol: 'Profesor(a) Jefe',
        firmado: true,
        fechaFirma: '2026-03-20'
      },
      {
        id: 'tk-2',
        nombre: 'Viviana Carrasco López',
        rol: 'Educadora Diferencial PIE',
        firmado: true,
        fechaFirma: '2026-03-20'
      },
      {
        id: 'tk-3',
        nombre: 'Gabriel Oyarzún',
        rol: 'Terapeuta Ocupacional',
        firmado: true,
        fechaFirma: '2026-03-22'
      },
      {
        id: 'tk-4',
        nombre: 'Patricia Morales Henríquez',
        rol: 'Apoderado(a)',
        firmado: true,
        fechaFirma: '2026-03-23'
      },
      {
        id: 'tk-5',
        nombre: 'Claudia Arancibia Fuentes',
        rol: 'Coordinador(a) PIE',
        firmado: true,
        fechaFirma: '2026-03-25'
      }
    ],
    creadoEl: '2026-03-05',
    actualizadoEl: '2026-08-20',
    estado: 'Activo'
  },
  {
    id: 'est-002',
    nombre: 'Martina Ignacia Sepúlveda Castro',
    rut: '24.112.450-3',
    curso: '3° Básico B',
    fechaNacimiento: '2017-09-12',
    edad: '8 años',
    nombreApoderado: 'Loreto Castro Mella',
    numeroContactoApoderado: '+56 9 9541 2309',
    nombreProfesoraJefe: 'Prof. Claudia Donoso',
    nombreEducadoraDiferencial: 'Ed. Romina Peña',
    profesionalesApoyo: {
      terapeutaOcupacional: 'TO. Daniela Alarcón',
      fonoaudiologo: 'Flgo. Esteban Pavez',
      psicologo: 'Ps. Sergio Muñoz'
    },
    contactosEmergencia: [
      {
        prioridad: 1,
        nombre: 'Loreto Castro Mella',
        telefono: '+56 9 9541 2309',
        vinculo: 'Madre'
      },
      {
        prioridad: 2,
        nombre: 'Víctor Sepúlveda Rojas',
        telefono: '+56 9 8812 0041',
        vinculo: 'Padre'
      }
    ],
    diagnosticoPie: {
      trastornoEspectroAutista: true,
      nivelTea: 'Nivel 2. Requiere apoyo sustancial.',
      comorbilidades: [
        'Trastorno de Integración Sensorial',
        'Alteraciones Motoras'
      ]
    },
    tratamientoMedico: {
      tieneTratamiento: true,
      medicamentos: ['Risperidona'],
      descripcion: 'Risperidona 0.5mg gotas (3 gotas nocturnas para regular conciliación del sueño e irritabilidad).',
      cambios: []
    },
    antecedentesSocioemocionales: 'Comprende órdenes simples mediante apoyo de pictogramas ARASAAC. Utiliza frases de dos palabras o gestos para manifestar necesidades. Necesidad de presión profunda (chaleco de peso) para autorregulación.',
    descripcionEpisodiosPrevios: 'Ante frustración o hambre, puede arrojar útiles al suelo o dar pequeños gritos agudos. Responde positivamente al aislamiento breve en sala de calma con iluminación cálida.',
    desarrolloPaec: {
      fechaInicio: '2026-03-08',
      fechaDesarrollo: '2026-03-24',
      fechaCierre: '2026-12-10',
      fechaEntrevistaInicial: '2026-03-15',
      fechaEntrevistaCierre: '2026-11-20',
      periodoAplicacion: 'Primer y Segundo Semestre 2026',
      propuestaFlexible: true,
      fechasModificacion: ['2026-03-24']
    },
    planApoyoContextual: [
      {
        id: 'ctx-m1',
        dimension: 'contextual',
        accionGatillante: 'Exigencia de permanecer sentada en mesa de trabajo por más de 20 minutos seguidos.',
        respuestaContencion: 'Metodología DUA: fragmentación en bloques de 10 min de trabajo + 3 min de descanso en cojín sensorial de aire.',
        adultoMediador: 'Ed. Romina Peña / Asistente de Aula'
      }
    ],
    planApoyoSensorial: [
      {
        id: 'sen-m1',
        dimension: 'sensorial',
        accionGatillante: 'Textura de témperas o pegamento en actividades de Artes Visuales.',
        respuestaContencion: 'Uso de rodillos plásticos, hisopos o sellos con mango ergonómico. Mantener toallas húmedas al alcance.',
        adultoMediador: 'TO. Daniela Alarcón / Técnico Diferencial'
      }
    ],
    planApoyoRelacional: [
      {
        id: 'rel-m1',
        dimension: 'relacional',
        accionGatillante: 'Interrupción involuntaria por parte de compañeros mientras manipula su juguete sensorial favorito.',
        respuestaContencion: 'Uso de pictogramas de turnos y mediación verbal corta: "Ahora Martina, después Juan".',
        adultoMediador: 'Prof. Claudia Donoso'
      }
    ],
    tomaConocimiento: [
      {
        id: 'tk-m1',
        nombre: 'Claudia Donoso',
        rol: 'Profesor(a) Jefe',
        firmado: true,
        fechaFirma: '2026-03-26'
      },
      {
        id: 'tk-m2',
        nombre: 'Loreto Castro Mella',
        rol: 'Apoderado(a)',
        firmado: true,
        fechaFirma: '2026-03-28'
      }
    ],
    creadoEl: '2026-03-08',
    actualizadoEl: '2026-07-15',
    estado: 'Activo'
  }
];

export const HITOS_INICIALES: HitoPedagogico[] = [
  {
    id: 'hito-001',
    estudianteId: 'est-001',
    titulo: 'Uso autónomo de protectores auditivos en actos y recreos',
    descripcion: 'El estudiante reconoce la sobrecarga acústica y se coloca sus auriculares de cancelación de ruido antes de presentar signos de angustia.',
    dimension: 'Sensorial',
    estado: 'logrado',
    porcentajeLogro: 90,
    metaEsperada: 'Uso preventivo en el 90% de los eventos escolares ruidosos.',
    fechaEvaluacion: '2026-06-15',
    responsable: 'TO. Gabriel Oyarzún',
    observaciones: 'Consolidado durante el 1er semestre. Lucas ahora los pide de manera proactiva a su profesora.'
  },
  {
    id: 'hito-002',
    estudianteId: 'est-001',
    titulo: 'Anticipación de cambios de horario mediante agenda visual',
    descripcion: 'Revisa su panel de pictogramas al inicio de la jornada escolar y tolera la sustitución de docentes sin manifestaciones de desregulación.',
    dimension: 'Contextual',
    estado: 'en_desarrollo',
    porcentajeLogro: 75,
    metaEsperada: 'Aceptar sustitución de asignaturas con mediación de 5 minutos.',
    fechaEvaluacion: '2026-07-20',
    responsable: 'Ed. Viviana Carrasco',
    observaciones: 'Presenta excelente disposición cuando se le avisa con 10 minutos de antelación.'
  },
  {
    id: 'hito-003',
    estudianteId: 'est-001',
    titulo: 'Participación en dinámicas grupales con roles estructurados',
    descripcion: 'Cumple el rol de encargado de registro o materiales en actividades de ciencias en grupos de 3 estudiantes.',
    dimension: 'Relacional',
    estado: 'en_proceso',
    porcentajeLogro: 60,
    metaEsperada: 'Completar 3 proyectos grupales colaborativos durante el año.',
    fechaEvaluacion: '2026-08-10',
    responsable: 'Prof. Marcela Contreras',
    observaciones: 'Trabaja fluidamente cuando se le asigna como par a su compañero tutor afín.'
  },
  {
    id: 'hito-004',
    estudianteId: 'est-002',
    titulo: 'Petición funcional mediante pictogramas ARASAAC',
    descripcion: 'Entrega la tarjeta de "Quiero agua" o "Quiero descanso" a la docente antes de iniciar conductas de irritabilidad.',
    dimension: 'Relacional',
    estado: 'en_desarrollo',
    porcentajeLogro: 70,
    metaEsperada: 'Emitir al menos 4 peticiones pictográficas funcionales al día.',
    fechaEvaluacion: '2026-06-30',
    responsable: 'Flgo. Esteban Pavez',
    observaciones: 'Gran avance en el uso del cuaderno de comunicación en el aula.'
  }
];

export const EPISODIOS_INICIALES: EpisodioDesregulacion[] = [
  {
    id: 'ep-001',
    estudianteId: 'est-001',
    fecha: '2026-04-22',
    hora: '11:35',
    responsableRegistro: 'Viviana Carrasco López',
    funcionResponsable: 'Educadora Diferencial PIE',
    lugar: 'Patio Techado / Entrada al Gimnasio',
    actividad: 'Preparación de acto del Día del Libro con parlantes a volumen elevado',
    personasInvolucradas: 'Estudiante, Docente de Música, Asistente de Aula',
    relatoOcurrido: 'Durante el ensayo del acto cívico, un acople imprevisto en los micrófonos generó un sonido agudo muy intenso. El estudiante se cubrió los oídos, se agachó y comenzó a respirar agitadamente.',
    intensidad: 'Moderada',
    gatillante: 'Acople agudo imprevisto de micrófono y parlantes a alto volumen en patio',
    conductaObservada: 'Estudiante se cubrió los oídos, se agachó y presentó taquipnea transitoria',
    estrategiaAplicada: 'Uso de protectores auditivos de su mochila, traslado a zona aireada y técnica de respiración 4-4',
    tiempoRetornoCalmaMinutos: 20,
    adultosIntervinientes: 'Ed. Viviana Carrasco y Asistente de Aula',
    seContactaApoderado: true,
    fasesObservadas: {
      desencadenante: true,
      intensificacion: true,
      explosion: false,
      recuperacion: true
    },
    accionesPorFase: [
      {
        fase: 'Desencadenante',
        accionContencion: 'La educadora PIE acudió con calma, bajó a la altura del estudiante y le ofreció sus protectores auditivos guardados en su mochila.',
        adultoMediador: 'Ed. Viviana Carrasco',
        resultado: 'Estudiante aceptó colocarse los audífonos inmediatamente.'
      },
      {
        fase: 'Intensificación',
        accionContencion: 'Se le acompañó caminando a un área tranquila y aireada junto al jardín del establecimiento.',
        adultoMediador: 'Asistente de Aula',
        resultado: 'Disminución del ritmo respiratorio en 3 minutos.'
      },
      {
        fase: 'Recuperación',
        accionContencion: 'Se le ofreció un vaso de agua y se realizó técnica de respiración diafragmática 4-4.',
        adultoMediador: 'Ed. Viviana Carrasco',
        resultado: 'Retorno sereno a la sala de clases a las 11:55 hrs sin necesidad de retiro.'
      }
    ],
    contactoApoderado: true,
    horaContactoApoderado: '12:10',
    solicitudAcudirEstablecimiento: false,
    activacionProtocoloAccidente: false,
    derivacionSalaCalma: false,
    seguimiento: {
      fechaSeguimiento: '2026-04-23',
      descripcionAccion: 'Se coordinó con el profesor de música la prueba de sonido previa sin alumnos en el patio y la entrega de aviso previo.',
      situacionActual: 'Estudiante asistió con normalidad al acto con sus audífonos colocados.',
      responsableSeguimiento: 'Viviana Carrasco López'
    }
  }
];
