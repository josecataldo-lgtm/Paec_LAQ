-- ================================================================
-- GESTOR PAEC - LEY TEA N° 21.545 / RES. EXENTA N° 586 CHILE
-- Esquema de Base de Datos PostgreSQL / Supabase
-- ================================================================

-- 1. Tabla de Configuración del Establecimiento Educacional
CREATE TABLE IF NOT EXISTS escuelas (
  id TEXT PRIMARY KEY DEFAULT 'default',
  nombre TEXT NOT NULL,
  nombre_establecimiento TEXT,
  rbd TEXT NOT NULL,
  dependencia TEXT NOT NULL,
  direccion TEXT,
  comuna TEXT NOT NULL,
  region TEXT NOT NULL,
  director TEXT NOT NULL,
  coordinador_pie TEXT NOT NULL,
  encargado_convivencia TEXT NOT NULL,
  ano_escolar TEXT NOT NULL,
  logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Expedientes PAEC de Estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  rut TEXT NOT NULL,
  curso TEXT NOT NULL,
  fecha_nacimiento TEXT,
  edad TEXT,
  nombre_apoderado TEXT,
  numero_contacto_apoderado TEXT,
  nombre_profesora_jefe TEXT,
  nombre_educadora_diferencial TEXT,
  profesionales_apoyo JSONB DEFAULT '{}'::jsonb,
  contactos_emergencia JSONB DEFAULT '[]'::jsonb,
  diagnostico_pie JSONB DEFAULT '{}'::jsonb,
  tratamiento_medico JSONB DEFAULT '{}'::jsonb,
  antecedentes_socioemocionales TEXT,
  descripcion_episodios_previos TEXT,
  desarrollo_paec JSONB DEFAULT '{}'::jsonb,
  plan_apoyo_contextual JSONB DEFAULT '[]'::jsonb,
  plan_apoyo_sensorial JSONB DEFAULT '[]'::jsonb,
  plan_apoyo_relacional JSONB DEFAULT '[]'::jsonb,
  toma_conocimiento JSONB DEFAULT '[]'::jsonb,
  estado TEXT NOT NULL DEFAULT 'Borrador',
  creado_el TEXT,
  actualizado_el TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Hitos Pedagógicos y Metas del PAEC
CREATE TABLE IF NOT EXISTS hitos_pedagogicos (
  id TEXT PRIMARY KEY,
  estudiante_id TEXT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  dimension TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'en_proceso',
  porcentaje_logro INTEGER DEFAULT 0,
  meta_esperada TEXT,
  fecha_evaluacion TEXT,
  responsable TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Bitácora de Desregulación Emocional y Conductual
CREATE TABLE IF NOT EXISTS episodios_desregulacion (
  id TEXT PRIMARY KEY,
  estudiante_id TEXT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  responsable_registro TEXT,
  funcion_responsable TEXT,
  lugar TEXT,
  actividad TEXT,
  personas_involucradas TEXT,
  relato_ocurrido TEXT,
  intensidad TEXT,
  gatillante TEXT,
  conducta_observada TEXT,
  estrategia_aplicada TEXT,
  tiempo_retorno_calma_minutos INTEGER,
  adultos_intervinientes TEXT,
  se_contacta_apoderado BOOLEAN DEFAULT false,
  observaciones_posteriores TEXT,
  fases_observadas JSONB DEFAULT '{}'::jsonb,
  acciones_por_fase JSONB DEFAULT '[]'::jsonb,
  contacto_apoderado BOOLEAN DEFAULT false,
  hora_contacto_apoderado TEXT,
  solicitud_acudir_establecimiento BOOLEAN DEFAULT false,
  activacion_protocolo_accidente BOOLEAN DEFAULT false,
  derivacion_sala_calma BOOLEAN DEFAULT false,
  seguimiento JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Estado y Sincronización Global del Establecimiento (Consolidado rápido)
CREATE TABLE IF NOT EXISTS sincronizacion_global (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  version TEXT DEFAULT '1.0',
  client_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Políticas de Seguridad de Fila (RLS) permisivas para lectura y escritura escolar
ALTER TABLE escuelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitos_pedagogicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodios_desregulacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE sincronizacion_global ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso Publico Escuelas" ON escuelas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso Publico Estudiantes" ON estudiantes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso Publico Hitos" ON hitos_pedagogicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso Publico Episodios" ON episodios_desregulacion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso Publico Sincronizacion" ON sincronizacion_global FOR ALL USING (true) WITH CHECK (true);

-- Habilitar publicación Realtime en Supabase para sincronización multiusuario sin refrescar
ALTER TABLE sincronizacion_global REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE sincronizacion_global;
