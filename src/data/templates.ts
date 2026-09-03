import { PlantillaPAEC } from '../types';

export const PLANTILLAS_PREDEFINIDAS: PlantillaPAEC[] = [
  {
    id: 'plantilla-tea-1-basica',
    nombre: 'TEA Nivel 1 - Educación Básica (Flexibilidad Cognitiva y Sobrecarga Sensorial)',
    descripcion: 'Diseñada para estudiantes de 1° a 6° básico con diagnóstico TEA Grado 1 que presentan hipersensibilidad sonora, rigidez ante cambios de horario y necesidad de mediación en interacciones con pares.',
    nivelTea: 'Nivel 1. Requiere apoyo.',
    etapaEducativa: 'Educación Básica',
    diagnosticoSugerido: {
      trastornoEspectroAutista: true,
      nivelTea: 'Nivel 1. Requiere apoyo.',
      comorbilidades: ['Trastorno de Integración Sensorial', 'Déficit Atencional']
    },
    antecedentesSocioemocionalesEjemplo: 'Estudiante con alto nivel de lenguaje verbal formal. Intereses profundos en temas científicos y estructurados. Presenta fatiga cognitiva ante jornadas extensas y dificultad para interpretar ironías o lenguaje no verbal de sus pares.',
    descripcionEpisodiosEjemplo: 'Episodios de frustración manifestados mediante mutismo selectivo, llanto o taparse los oídos cuando el nivel de ruido en el aula aumenta o ante evaluaciones imprevistas.',
    planContextual: [
      {
        dimension: 'contextual',
        accionGatillante: 'Cambios imprevistos de horario, reemplazo docente o actividades masivas no programadas.',
        respuestaContencion: 'Uso de panel de anticipación visual y entrega de agenda diaria al inicio de la jornada. Explicación verbal individualizada y serena con 10 minutos de anticipación.',
        adultoMediador: 'Profesor(a) Jefe / Educadora Diferencial PIE'
      },
      {
        dimension: 'contextual',
        accionGatillante: 'Evaluaciones extensas con múltiples instrucciones simultáneas.',
        respuestaContencion: 'Adecuación curricular de acceso (Decreto 83): parcelación del instrumento, otorgamiento de 15 minutos adicionales y apoyo de cronómetro visual para autorregulación del tiempo.',
        adultoMediador: 'Profesor(a) de Asignatura / Asistente de Aula'
      }
    ],
    planSensorial: [
      {
        dimension: 'sensorial',
        accionGatillante: 'Ruido elevado en sala de clases, timbres de cambio de hora o actos cívicos en patio techado.',
        respuestaContencion: 'Uso libre y autorizado de protectores auditivos (auriculares de cancelación). Ubicación estratégica en el aula lejos de parlantes y fuentes de eco.',
        adultoMediador: 'Profesor(a) de Asignatura / Asistente de Aula'
      },
      {
        dimension: 'sensorial',
        accionGatillante: 'Sobrecarga visual o lumínica (pantallas brillantes, luces fluorescentes parpadeantes).',
        respuestaContencion: 'Atenuación de luz artificial cuando sea factible, uso de visera o filtros si lo requiere y autorización de pausas sensoriales activas de 3 minutos.',
        adultoMediador: 'Terapeuta Ocupacional PIE / Educadora PIE'
      }
    ],
    planRelacional: [
      {
        dimension: 'relacional',
        accionGatillante: 'Juegos de recreo con reglas implícitas o dinámicas de grupo sin roles asignados.',
        respuestaContencion: 'Implementación de sistema de Recreos Entretenidos / Estructurados con juegos de mesa o patio mediado. Designación de un par tutor con afinidad.',
        adultoMediador: 'Inspectoría de Patio / Encargado(a) de Convivencia Escolar'
      },
      {
        dimension: 'relacional',
        accionGatillante: 'Malentendidos comunicativos, bromas o correcciones en público por parte de adultos.',
        respuestaContencion: 'Retroalimentación privada con tono de voz neutro y claro, sin sarcasmos. Uso de historias sociales para reflexionar sobre situaciones interpersonales.',
        adultoMediador: 'Psicólogo(a) PIE / Profesor(a) Jefe'
      }
    ],
    hitosSugeridos: [
      {
        titulo: 'Uso autónomo de protectores auditivos',
        descripcion: 'El estudiante reconoce la sensación de molestia auditiva y coloca sus audífonos de forma autónoma sin necesidad de recordatorio.',
        dimension: 'Sensorial',
        estado: 'en_proceso',
        porcentajeLogro: 60,
        metaEsperada: 'Identificar el 80% de situaciones de sobrecarga y colocarse los audífonos preventivamente.',
        fechaEvaluacion: '2026-05-30',
        responsable: 'Terapeuta Ocupacional',
        observaciones: 'Ha mostrado gran progreso en clases de Educación Física y Música.'
      },
      {
        titulo: 'Solicitud de tarjeta de pausa de autorregulación',
        descripcion: 'Presenta la tarjeta verde/roja a la docente para solicitar 3 minutos en el rincón de la calma antes de una desregulación.',
        dimension: 'Autonomía y Autorregulación',
        estado: 'en_desarrollo',
        porcentajeLogro: 75,
        metaEsperada: 'Uso de la tarjeta en el 100% de momentos de tensión identificados.',
        fechaEvaluacion: '2026-06-15',
        responsable: 'Educadora Diferencial PIE',
        observaciones: 'Se observa buena asimilación en asignaturas de lenguaje y matemática.'
      }
    ]
  },
  {
    id: 'plantilla-tea-2-sensorial',
    nombre: 'TEA Nivel 2 - Apoyo Sustancial (Integración Sensorial y Comunicación Funcional)',
    descripcion: 'Diseñada para estudiantes que requieren apoyo permanente en el aula, con alta reactividad sensorial, dificultades de comunicación expresiva y necesidad de rutinas pictográficas muy estructuradas.',
    nivelTea: 'Nivel 2. Requiere apoyo sustancial.',
    etapaEducativa: 'Educación Básica',
    diagnosticoSugerido: {
      trastornoEspectroAutista: true,
      nivelTea: 'Nivel 2. Requiere apoyo sustancial.',
      comorbilidades: ['Trastorno de Integración Sensorial', 'Déficit Atencional - Hiperactividad', 'Alteraciones Motoras']
    },
    antecedentesSocioemocionalesEjemplo: 'Estudiante con habla basada en frases simples o ecolalias funcionales. Utiliza apoyos visuales (pictogramas ARASAAC/PECS). Presenta necesidad de estimulación propioceptiva (balanceo, presión profunda) para calmarse.',
    descripcionEpisodiosEjemplo: 'Gatillantes por dolor o malestar físico no verbalizado, calor excesivo o exceso de demanda verbal. Conductas desafiantes con llanto intenso, tirarse al suelo o autoestimulación motora intensa.',
    planContextual: [
      {
        dimension: 'contextual',
        accionGatillante: 'Demandas pedagógicas continuas sin descansos sensoriales intercalados.',
        respuestaContencion: 'Implementación del sistema visual "Primero - Después" (First/Then) y pausas activas con cojín sensorial o elementos de peso en hombros.',
        adultoMediador: 'Educadora Diferencial PIE / Asistente de Aula'
      },
      {
        dimension: 'contextual',
        accionGatillante: 'Espacio de trabajo desorganizado o con exceso de estímulos en las paredes.',
        respuestaContencion: 'Ubicación en puesto preferencial con separador visual si es necesario y caja de materiales individual rotulada con fotos.',
        adultoMediador: 'Asistente de Aula / Terapeuta Ocupacional'
      }
    ],
    planSensorial: [
      {
        dimension: 'sensorial',
        accionGatillante: 'Texturas pegajosas, olores intensos en el comedor o ropa ajustada/etiquetas.',
        respuestaContencion: 'Respetar selectividad sensorial, permitir alternativas de materiales y permitir al apoderado enviar utensilios o elementos familiares.',
        adultoMediador: 'Asistente de Aula / Terapeuta Ocupacional'
      },
      {
        dimension: 'sensorial',
        accionGatillante: 'Sobrecarga vestibular o propioceptiva (necesidad de movimiento intenso).',
        respuestaContencion: 'Habilitación de banda elástica en patas de la silla, pelota de estimulación o caminatas programadas al patio junto a la asistente.',
        adultoMediador: 'Terapeuta Ocupacional PIE'
      }
    ],
    planRelacional: [
      {
        dimension: 'relacional',
        accionGatillante: 'Invasión de su espacio personal por parte de compañeros en filas o agrupaciones.',
        respuestaContencion: 'Delimitación en el suelo con cinta de color de su espacio personal y trabajo de sensibilización con el curso sobre el espacio de cada compañero.',
        adultoMediador: 'Profesor(a) Jefe / Educadora PIE'
      },
      {
        dimension: 'relacional',
        accionGatillante: 'Frustración al no ser comprendido en sus solicitudes verbales.',
        respuestaContencion: 'Uso de comunicador aumentativo o cuaderno PECS. Validación verbal inmediata de su emoción ("Sé que estás cansado, vamos a respirar").',
        adultoMediador: 'Fonoaudiólogo/a PIE / Asistente de Aula'
      }
    ],
    hitosSugeridos: [
      {
        titulo: 'Comunicación funcional con pictogramas PECS',
        descripcion: 'Entrega la tarjeta de "Quiero agua" o "Quiero descanso" ante la necesidad física o emocional.',
        dimension: 'Relacional',
        estado: 'en_proceso',
        porcentajeLogro: 50,
        metaEsperada: 'Uso espontáneo de 3 pictogramas básicos de petición durante la jornada escolar.',
        fechaEvaluacion: '2026-06-30',
        responsable: 'Fonoaudiólogo/a PIE',
        observaciones: 'Se articula trabajo coordinado con la familia para el hogar.'
      }
    ]
  },
  {
    id: 'plantilla-tea-3-apoyo-intensivo',
    nombre: 'TEA Nivel 3 - Apoyo Muy Sustancial (Plan de Contingencia y Calma Sensorial)',
    descripcion: 'Para estudiantes con requerimientos permanentes de alta intensidad, apoyo de asistente 1 a 1, comunicación no verbal y protocolos de desregulación conductual severa con resguardo de seguridad física.',
    nivelTea: 'Nivel 3. Requiere apoyo muy sustancial.',
    etapaEducativa: 'Educación Básica',
    diagnosticoSugerido: {
      trastornoEspectroAutista: true,
      nivelTea: 'Nivel 3. Requiere apoyo muy sustancial.',
      comorbilidades: ['Déficit Intelectual Moderado', 'Trastorno de Integración Sensorial', 'Trastorno del sueño', 'Alteraciones Motoras']
    },
    antecedentesSocioemocionalesEjemplo: 'Comunicación no verbal mediante gestos guiados, miradas y apoyos de alta tecnología. Alta sensibilidad a estímulos ambientales combinados.',
    descripcionEpisodiosEjemplo: 'Conductas de hetero y autolesión en momentos de crisis aguda. Necesidad imperiosa de despejar el entorno y activar mediador entrenado en contención no restrictiva.',
    planContextual: [
      {
        dimension: 'contextual',
        accionGatillante: 'Ruptura drástica de rutina, ruidos imprevistos de sirenas o taladros en mantención.',
        respuestaContencion: 'Traslado preventivo inmediato a Sala de Calma Sensorial habilitada con colchonetas, luz cálida y objetos propioceptivos.',
        adultoMediador: 'Asistente de Aula / Terapeuta Ocupacional'
      }
    ],
    planSensorial: [
      {
        dimension: 'sensorial',
        accionGatillante: 'Saturación multisensorial en horarios punta de entrada y salida.',
        respuestaContencion: 'Flexibilización horaria con ingreso 15 minutos posterior y salida 15 minutos anticipada para evitar aglomeraciones.',
        adultoMediador: 'Inspectoría General / Coordinador(a) PIE'
      }
    ],
    planRelacional: [
      {
        dimension: 'relacional',
        accionGatillante: 'Presencia de múltiples personas hablándole simultáneamente en momentos de tensión.',
        respuestaContencion: 'Principio de Un Solo Adulto Mediador: los demás presentes se retiran o mantienen distancia silente para no sobrecargar canales auditivos.',
        adultoMediador: 'Educadora PIE asignada'
      }
    ],
    hitosSugeridos: [
      {
        titulo: 'Aceptación de la Sala de Calma como espacio seguro',
        descripcion: 'Ingresa caminando voluntariamente a la sala de calma cuando se le presenta el pictograma respectivo.',
        dimension: 'Sensorial',
        estado: 'en_proceso',
        porcentajeLogro: 70,
        metaEsperada: 'Reducción del tiempo de desregulación a menos de 10 minutos.',
        fechaEvaluacion: '2026-07-10',
        responsable: 'Terapeuta Ocupacional / Educadora PIE',
        observaciones: 'Responde muy bien a la iluminación tenue y música de frecuencias bajas.'
      }
    ]
  },
  {
    id: 'plantilla-parvularia',
    nombre: 'Educación Parvularia / Transición Inicial (Jardín, NT1 y NT2)',
    descripcion: 'Enfocada en primeras experiencias escolares de párvulos en el espectro autista, adaptación al espacio educativo, juego simbólico compartido y desapego familiar respetuoso.',
    nivelTea: 'Nivel 1. Requiere apoyo.',
    etapaEducativa: 'Educación Parvularia',
    diagnosticoSugerido: {
      trastornoEspectroAutista: true,
      nivelTea: 'Nivel 1. Requiere apoyo.',
      comorbilidades: ['Trastorno de Integración Sensorial']
    },
    antecedentesSocioemocionalesEjemplo: 'Párvulo en etapa de exploración sensorial. Muestra apego a un objeto suave de transición. Requiere acompañamiento para compartir materiales de juego.',
    descripcionEpisodiosEjemplo: 'Llanto y angustia de separación en el momento del saludo inicial, o al guardar juguetes con los que aún desea interactuar.',
    planContextual: [
      {
        dimension: 'contextual',
        accionGatillante: 'Momento de ordenar la sala ("A guardar los juguetes").',
        respuestaContencion: 'Canción o aviso sonoro suave con conteo regresivo visual de 3 minutos antes de finalizar la actividad libre.',
        adultoMediador: 'Educadora de Párvulos / Técnico en Párvulos'
      }
    ],
    planSensorial: [
      {
        dimension: 'sensorial',
        accionGatillante: 'Contacto con témperas, espuma o plastilina en actividades plásticas.',
        respuestaContencion: 'Ofrecer pinceles de mango grueso o esponjas con mango, toallitas húmedas a mano y no obligar a la inmersión táctil directa.',
        adultoMediador: 'Educadora Diferencial PIE / Técnico de Párvulos'
      }
    ],
    planRelacional: [
      {
        dimension: 'relacional',
        accionGatillante: 'Rondas o actividades donde se exige tomarse de las manos.',
        respuestaContencion: 'Permitir sujetar un pañuelo o aro intermedio para mantener el enlace sin exigir contacto piel con piel.',
        adultoMediador: 'Educadora de Párvulos'
      }
    ],
    hitosSugeridos: [
      {
        titulo: 'Participación en el círculo de saludo inicial',
        descripcion: 'Permanece en su colchoneta durante el saludo de la mañana con apoyo de su juguete de apego.',
        dimension: 'Contextual',
        estado: 'logrado',
        porcentajeLogro: 90,
        metaEsperada: 'Participación en al menos 4 de 5 días de la semana.',
        fechaEvaluacion: '2026-05-15',
        responsable: 'Educadora de Párvulos',
        observaciones: 'Hito logrado exitosamente con gran satisfacción de la familia.'
      }
    ]
  },
  {
    id: 'plantilla-media-tp',
    nombre: 'Enseñanza Media y Técnico-Profesional (Talleres Prácticos y Autonomía)',
    descripcion: 'Diseñada para adolescentes de 7° a 4° medio (Liceos Científico-Humanistas y Técnico-Profesionales con especialidades como Agropecuaria, Mecánica, Electricidad, Gastronomía, etc.).',
    nivelTea: 'Nivel 1. Requiere apoyo.',
    etapaEducativa: 'Educación Media / TP',
    diagnosticoSugerido: {
      trastornoEspectroAutista: true,
      nivelTea: 'Nivel 1. Requiere apoyo.',
      comorbilidades: ['Déficit Atencional']
    },
    antecedentesSocioemocionalesEjemplo: 'Adolescente con gran vocación técnica e interés profundo en procesos mecánicos o informáticos. Presenta ansiedad de rendimiento ante evaluaciones y susceptibilidad ante el juicio social de sus pares.',
    descripcionEpisodiosEjemplo: 'Bloqueo cognitivo o retiro abrupto del taller/laboratorio ante ruidos estridentes de maquinaria o presión de tiempo en entregas de proyectos.',
    planContextual: [
      {
        dimension: 'contextual',
        accionGatillante: 'Trabajo práctico en talleres con maquinaria pesada, herramientas ruidosas o cambios de estación.',
        respuestaContencion: 'Capacitación previa con manual ilustrado de seguridad, uso de protector auditivo industrial homologado y puesto asignado con buena ventilación.',
        adultoMediador: 'Profesor(a) de Especialidad / Técnico de Taller'
      },
      {
        dimension: 'contextual',
        accionGatillante: 'Disertaciones orales frente a todo el curso.',
        respuestaContencion: 'Alternativas de evaluación DUA: presentación grabada en video, disertación en grupo reducido ante el docente o formato póster explicativo.',
        adultoMediador: 'Profesor(a) de Asignatura'
      }
    ],
    planSensorial: [
      {
        dimension: 'sensorial',
        accionGatillante: 'Olores de solventes, combustibles o vapores en talleres agropecuarios/industriales.',
        respuestaContencion: 'Uso de mascarilla con filtro de carbón si es necesario y descansos en áreas abiertas con aire limpio.',
        adultoMediador: 'Profesor(a) de Taller / Asistente PIE'
      }
    ],
    planRelacional: [
      {
        dimension: 'relacional',
        accionGatillante: 'Presión de pares en conversaciones con doble sentido o debates acalorados.',
        respuestaContencion: 'Acompañamiento del profesor tutor para clarificar acuerdos y brindar mediación en resolución pacífica de discrepancias.',
        adultoMediador: 'Profesor(a) Tutor / Psicólogo(a) PIE'
      }
    ],
    hitosSugeridos: [
      {
        titulo: 'Autogestión de tareas y calendario de entregas',
        descripcion: 'Utiliza agenda digital o física para secuenciar las etapas de los proyectos de taller.',
        dimension: 'Autonomía y Autorregulación',
        estado: 'en_desarrollo',
        porcentajeLogro: 80,
        metaEsperada: 'Completar el 85% de las bitácoras de taller en los plazos acordados.',
        fechaEvaluacion: '2026-06-20',
        responsable: 'Profesor(a) Jefe de Taller',
        observaciones: 'Ha demostrado alta rigurosidad y calidad técnica en el manejo de herramientas.'
      }
    ]
  }
];
