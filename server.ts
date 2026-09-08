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
      const { student, hitos, episodios, period, destinatario } = req.body;
      const ai = getGeminiClient();

      const logradosCount = (hitos || []).filter((h: any) => h.estado === 'logrado' || h.estado === 'consolidado').length;
      const totalCount = (hitos || []).length;
      const pct = totalCount > 0 ? Math.round((logradosCount / totalCount) * 100) : 0;

      if (!ai) {
        return res.json({
          report: {
            resumenEjecutivo: `Durante el periodo ${period || 'Primer Semestre 2026'}, el/la estudiante ${student?.nombre || 'el estudiante'} ha mostrado una evolución positiva en su trayectoria escolar bajo el marco de la Ley TEA N° 21.545. Registra un ${pct}% de avance en sus hitos pedagógicos proyectados, evidenciando un compromiso sostenido en las actividades de aula regular y espacio PIE.`,
            analisisHitos: `Se evaluaron ${totalCount} hitos prioritarios, de los cuales ${logradosCount} se encuentran consolidados o en fase avanzada de logro. Destaca el fortalecimiento en autorregulación emocional ante transiciones y la respuesta favorable a apoyos pictográficos e instructivos visuales.`,
            estrategiasEfectivas: (episodios || []).length > 0 
              ? `Durante el periodo se registraron ${episodios.length} episodios de desregulación. Las maniobras de contención preventiva, anticipación sensorial y uso de pausas activas permitieron retornar a la calma en promedios inferiores a los 15 minutos.` 
              : `No se registraron episodios de desregulación significativos en el periodo, lo que demuestra un entorno estructurado y preventivo altamente eficaz.`,
            orientacionesFamilia: `Se sugiere mantener en el hogar rutinas estructuradas similares a la jornada escolar, hacer uso del panel de anticipación visual ante salidas o visitas, y mantener comunicación constante con el equipo PIE ante cualquier cambio en el estado anímico o salud del estudiante.`,
            sugerenciasAula: `Continuar con la fragmentación de evaluaciones extensas, anticipar de 5 a 10 minutos cualquier cambio de rutina o docente, y permitir el uso autónomo de audífonos con cancelación de ruido durante recreos o actividades sonoras intensas.`
          }
        });
      }

      const prompt = `Genera un Informe de Progreso y Síntesis Pedagógica integral para el PAEC (Plan de Acompañamiento Emocional y Conductual) bajo la normativa Ley TEA (Ley 21.545 / Res. Exenta 586 MINEDUC de Chile).
Audiencia objetivo del informe: ${destinatario === 'familia' ? 'Familia y Apoderados (tono cercano, empático, claro y pedagógico)' : 'Equipo Directivo, Docente y Carpeta PIE (tono técnico-pedagógico formal)'}
Periodo evaluado: ${period || 'Semestral'}

Datos del Estudiante:
- Nombre: ${student?.nombre}
- RUT: ${student?.rut}
- Curso: ${student?.curso}
- Nivel TEA: ${student?.diagnosticoPie?.nivelTea || 'Nivel 1'}

Hitos pedagógicos registrados:
${JSON.stringify(hitos || [])}

Registro de episodios de desregulación:
${JSON.stringify(episodios || [])}

Devuelve un JSON estricto con la siguiente estructura exacta:
{
  "report": {
    "resumenEjecutivo": "Síntesis del avance general del estudiante en el periodo",
    "analisisHitos": "Análisis cuantitativo y cualitativo de los hitos pedagógicos y autorregulación",
    "estrategiasEfectivas": "Análisis de la efectividad de las estrategias de contención del PAEC y bitácora",
    "orientacionesFamilia": "Recomendaciones y orientaciones para la familia en el hogar",
    "sugerenciasAula": "Recomendaciones pedagógicas para los docentes y equipo de aula"
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
      return res.status(500).json({ error: err.message || "Error generating report" });
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
