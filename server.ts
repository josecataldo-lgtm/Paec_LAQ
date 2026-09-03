import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // In-memory / file backed storage for standalone server deployments
  const DATA_FILE = path.join(process.cwd(), 'data_paec_store.json');
  let memoryStore: any = null;

  function getStoredData() {
    if (memoryStore) return memoryStore;
    try {
      if (fs.existsSync(DATA_FILE)) {
        memoryStore = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        return memoryStore;
      }
    } catch (e) {
      console.warn('Error reading data store:', e);
    }
    return null;
  }

  function saveStoredData(data: any) {
    memoryStore = data;
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Error writing data store:', e);
    }
  }

  // API: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiEnabled: Boolean(process.env.GEMINI_API_KEY) });
  });

  // API: Get complete school PAEC dataset
  app.get("/api/data", (req, res) => {
    const data = getStoredData();
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: "No data stored on server yet" });
    }
  });

  // API: Save/Sync complete school PAEC dataset
  app.post("/api/data/sync", (req, res) => {
    const data = req.body;
    if (data) {
      saveStoredData(data);
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    } else {
      res.status(400).json({ error: "Missing data payload" });
    }
  });

  // API: AI Suggestions for PAEC Plan de Apoyo (Contextual, Sensorial, Relacional)
  app.post("/api/gemini/generate-strategies", async (req, res) => {
    try {
      const { student, sectionType, currentEntries } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // High quality fallback strategies if no API key
        return res.json({
          strategies: [
            {
              gatillante: sectionType === 'contextual' 
                ? 'Cambio imprevisto de sala o sustitución de docente sin aviso previo.' 
                : sectionType === 'sensorial' 
                ? 'Timbre estridente de cambio de hora y ruidos de alta frecuencia en el patio.' 
                : 'Interacciones en recreos con juegos grupales de reglas complejas y no explícitas.',
              contencion: sectionType === 'contextual'
                ? 'Uso de panel de anticipación visual individual con 15 minutos de aviso y acompañamiento de educadora PIE.'
                : sectionType === 'sensorial'
                ? 'Permitir uso anticipado de protectores auditivos (auriculares de cancelación de ruido) 3 minutos antes del timbre y acceso a zona de calma.'
                : 'Docente o asistente facilita la mediación con roles estructurados y apoyo de pares tutores capacitados.',
              adultoMediador: 'Educadora Diferencial PIE / Asistente de Aula',
            },
            {
              gatillante: sectionType === 'contextual'
                ? 'Evaluaciones escritas extensas con distractores visuales múltiples.'
                : sectionType === 'sensorial'
                ? 'Texturas táctiles en talleres artísticos o de ciencias (témperas, arcilla, adhesivos).'
                : 'Trabajo en grupos numerosos sin designación clara de tareas.',
              contencion: sectionType === 'contextual'
                ? 'Fragmentación de instrumentos evaluativos en bloques cortos con cronómetro visual y pausas activas.'
                : sectionType === 'sensorial'
                ? 'Ofrecer alternativas de herramientas (espátulas, guantes de nitrilo suaves) y desensibilización paulatina respetando su límite de tolerancia.'
                : 'Asignación de parejas de trabajo afines con tareas delimitadas paso a paso mediante lista de cotejo visual.',
              adultoMediador: 'Profesor(a) de Asignatura / Terapeuta Ocupacional',
            }
          ]
        });
      }

      const prompt = `Eres un especialista chileno en Educación Especial, Inclusión y Trastorno del Espectro Autista (TEA), experto en la Ley 21.545 y la Resolución Exenta N° 586 del MINEDUC de Chile.
Genera 3 propuestas concretas y profesionales para el PAEC (Plan de Acompañamiento Emocional y Conductual) en la dimensión: ${sectionType?.toUpperCase()} (contextual, sensorial o relacional).

Datos del Estudiante:
- Nombre: ${student.nombre || 'Estudiante'}
- Curso: ${student.curso || 'No especificado'}
- Diagnóstico TEA: ${student.diagnosticoPie?.nivelTea || 'Nivel 1'}
- Comorbilidades: ${student.diagnosticoPie?.comorbilidades?.join(', ') || 'Ninguna especificada'}
- Antecedentes socioemocionales: ${student.antecedentesSocioemocionales || 'Sensibilidad al ruido y cambios de rutina'}

Devuelve un JSON estricto con la siguiente estructura:
{
  "strategies": [
    {
      "gatillante": "Descripción clara de la acción, acontecimiento o situación posible de afectación conductual y/o emocional",
      "contencion": "Respuesta preventiva y de contención pedagógica/emocional concreta",
      "adultoMediador": "Rol del adulto mediador (ej. Educadora Diferencial PIE, Asistente de Aula, Profesor Jefe, Inspector General)"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Error in /api/gemini/generate-strategies:", err);
      return res.status(500).json({ error: err.message || "Error generating strategies" });
    }
  });

  // API: AI Suggestions for Hitos Pedagógicos y Metas del PAEC
  app.post("/api/gemini/generate-milestones", async (req, res) => {
    try {
      const { student } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          milestones: [
            {
              titulo: "Autorregulación ante estímulos sonoros intensos",
              descripcion: "El estudiante solicita y utiliza de manera autónoma sus protectores auditivos al anticipar ruidos fuertes (actos cívicos o timbres) sin desregularse.",
              dimension: "Sensorial",
              metaEsperada: "Lograr uso autónomo en el 80% de las situaciones de sobrecarga auditiva durante el semestre.",
              responsable: "Terapeuta Ocupacional / Educadora PIE"
            },
            {
              titulo: "Anticipación y tolerancia a transiciones escolares",
              descripcion: "Acepta el cambio de actividades y asignaturas siguiendo el horario visual individual con apoyo mínimo del adulto mediador.",
              dimension: "Contextual",
              metaEsperada: "Realizar transiciones en aula sin episodios de negativa o angustia en al menos 4 de 5 días de la semana.",
              responsable: "Profesor(a) Jefe / Asistente de Aula"
            },
            {
              titulo: "Comunicación funcional y solicitud de descansos",
              descripcion: "Identifica su nivel de activación en el termómetro emocional y utiliza la tarjeta de 'Pausa Sensorial' antes de alcanzar la fase de desregulación.",
              dimension: "Relacional / Socioemocional",
              metaEsperada: "Solicitar pausa preventiva de forma verbal o pictográfica ante signos iniciales de frustración.",
              responsable: "Psicólogo(a) PIE / Educadora Diferencial"
            }
          ]
        });
      }

      const prompt = `Como especialista en el Programa de Integración Escolar (PIE) y Ley TEA (Ley 21.545 / Res. Exenta 586 de Chile), genera 4 hitos pedagógicos y metas socioemocionales SMART para el estudiante:
Nombre: ${student.nombre || 'Estudiante'}
Curso: ${student.curso || 'Básico'}
Nivel TEA: ${student.diagnosticoPie?.nivelTea || 'Nivel 1 o 2'}
Intereses/Antecedentes: ${student.antecedentesSocioemocionales || 'Requiere apoyo en transiciones e interacción'}

Responde en formato JSON con la siguiente estructura:
{
  "milestones": [
    {
      "titulo": "Título breve del hito",
      "descripcion": "Descripción detallada del comportamiento objetivo y apoyo requerido",
      "dimension": "Sensorial | Contextual | Relacional | Autonomía",
      "metaEsperada": "Criterio de logro medible",
      "responsable": "Cargo profesional responsable (Educadora PIE, TO, Fonoaudiólogo/a, Profesor Jefe)"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Error in /api/gemini/generate-milestones:", err);
      return res.status(500).json({ error: err.message || "Error generating milestones" });
    }
  });

  // API: AI Personalized Progress Report Synthesis
  app.post("/api/gemini/generate-progress-report", async (req, res) => {
    try {
      const { student, paec, hitos, episodios, targetAudience } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          report: {
            sintesisEjecutiva: `Durante el presente periodo escolar, el estudiante ${student.nombre || 'el estudiante'} ha mostrado un avance significativo en su proceso de adaptación y autorregulación escolar bajo las orientaciones de la Ley TEA N° 21.545 y Resolución Exenta N° 586. Se destaca su respuesta positiva a las estrategias de anticipación visual y adecuaciones en el entorno de aula.`,
            fortalezasObservadas: [
              "Mayor receptividad al uso de apoyos visuales y paneles de anticipación en el aula.",
              "Fortalecimiento del vínculo de confianza con su Educadora Diferencial y Profesor(a) Jefe.",
              "Disminución en el tiempo de recuperación tras episodios de sobrecarga sensorial."
            ],
            areasEnDesarrollo: [
              "Consolidar la solicitud espontánea de pausas sensoriales antes del punto de saturación.",
              "Fomentar la participación en actividades grupales estructuradas con reglas explícitas.",
              "Tolerancia a cambios imprevistos de rutina mediante mediación previa."
            ],
            analisisEpisodios: episodios?.length > 0 
              ? `Se han registrado ${episodios.length} episodios de desregulación en el periodo, observándose una tendencia favorable en la efectividad de las maniobras de contención preventiva en fase desencadenante.`
              : `No se han registrado episodios de desregulación de alta intensidad en el periodo evaluado, lo que refleja un entorno escolar preventivo eficaz.`,
            recomendacionesFamilia: [
              "Mantener en el hogar rutinas visuales consistentes con los horarios escolares.",
              "Reforzar el uso del termómetro de emociones para validar sus estados afectivos.",
              "Mantener comunicación fluida con el equipo PIE ante ajustes de medicación o eventos estresores."
            ],
            recomendacionesEquipoDocente: [
              "Continuar con la anticipación de 5 a 10 minutos antes de concluir una actividad.",
              "Respetar el uso libre de protectores auditivos en eventos masivos del establecimiento.",
              "Designar roles claros y estructurados en trabajos colaborativos."
            ],
            conclusionFinal: "El plan de acompañamiento emocional y conductual se evalúa como pertinente y eficaz. Se recomienda mantener las adecuaciones implementadas y continuar el seguimiento semestral acordado."
          }
        });
      }

      const prompt = `Genera un Reporte de Progreso y Síntesis Pedagógica integral para el PAEC (Plan de Acompañamiento Emocional y Conductual) bajo la normativa chilena Ley TEA (Ley 21.545 / Res. Exenta 586 MINEDUC).
Audiencia objetivo del informe: ${targetAudience === 'familia' ? 'Familia y Apoderados (tono cercano, empático, claro y pedagógico)' : 'Equipo Directivo, Docente y Carpeta PIE (tono técnico-pedagógico formal)'}

Datos del Estudiante:
- Nombre: ${student.nombre}
- RUT: ${student.rut}
- Curso: ${student.curso}
- Nivel TEA: ${student.diagnosticoPie?.nivelTea || 'Nivel 1'}
- Medicación: ${student.tratamientoMedico?.tieneTratamiento ? student.tratamientoMedico.descripcion : 'Sin tratamiento farmacológico informado'}

Hitos pedagógicos registrados:
${JSON.stringify(hitos || [])}

Registro de episodios de desregulación:
${JSON.stringify(episodios || [])}

Devuelve un JSON estricto con la siguiente estructura:
{
  "report": {
    "sintesisEjecutiva": "Párrafo introductorio con la síntesis del periodo",
    "fortalezasObservadas": ["Fortaleza 1", "Fortaleza 2", "Fortaleza 3"],
    "areasEnDesarrollo": ["Área 1", "Área 2", "Área 3"],
    "analisisEpisodios": "Análisis cualitativo y cuantitativo de los episodios de desregulación y la efectividad de la contención",
    "recomendacionesFamilia": ["Recomendación 1", "Recomendación 2", "Recomendación 3"],
    "recomendacionesEquipoDocente": ["Recomendación 1", "Recomendación 2", "Recomendación 3"],
    "conclusionFinal": "Conclusión técnica y sugerencia de continuidad del PAEC"
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Error in /api/gemini/generate-progress-report:", err);
      return res.status(500).json({ error: err.message || "Error generating progress report" });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gestor PAEC Server running on port ${PORT}`);
  });
}

startServer();
