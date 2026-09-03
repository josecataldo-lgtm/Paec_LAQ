# 🚀 Guía de Publicación en la Nube y Base de Datos - Gestor PAEC (Ley TEA N° 21.545)

Esta guía explica paso a paso cómo publicar el **Gestor PAEC** en internet de forma **100% gratuita**, asegurando que todos los expedientes, hitos y bitácoras se guarden en una **base de datos en la nube** permanente y accesible desde cualquier computador o dispositivo por el equipo PIE y directivos.

---

## 📋 Resumen del Proceso (5 Minutos)

1. **Paso 1**: Crear la Base de Datos gratuita en **Supabase** (PostgreSQL en la nube).
2. **Paso 2**: Ejecutar el script SQL de tablas.
3. **Paso 3**: Publicar la aplicación web en **Vercel** o **Render** con 1 clic.
4. **Paso 4**: Configurar las variables de conexión.

---

## 🗄️ Paso 1: Crear la Base de Datos en Supabase (Gratis)

1. Ingresa a [https://supabase.com](https://supabase.com) y haz clic en **"Start your project"** (puedes registrarte con Google o GitHub).
2. Haz clic en **"New Project"**.
3. Completa los datos:
   - **Name**: `Gestor PAEC Escuela`
   - **Database Password**: Elige una contraseña segura y anótala.
   - **Region**: Selecciona `South America (São Paulo)` para máxima velocidad en Chile.
   - **Pricing Plan**: `Free Plan ($0/month)`.
4. Haz clic en **"Create new project"** y espera 1 minuto a que se inicialice.

---

## 📜 Paso 2: Crear las Tablas en Supabase

1. En el menú lateral izquierdo de Supabase, entra a **"SQL Editor"**.
2. Haz clic en **"New Query"**.
3. Copia y pega el contenido del archivo `schema.sql` (o la versión rápida simplificada):

```sql
CREATE TABLE IF NOT EXISTS sincronizacion_global (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  version TEXT DEFAULT '1.0',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sincronizacion_global ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso Publico" ON sincronizacion_global FOR ALL USING (true) WITH CHECK (true);
```

4. Haz clic en el botón verde **"Run"** (o presiona `Ctrl + Enter`).
5. Aparecerá el mensaje *"Success. No rows returned"*. ¡Tu base de datos está lista!

---

## 🔑 Paso 3: Obtener las Credenciales de Conexión

1. En Supabase, ve a **Project Settings** (el icono de engranaje ⚙️ abajo a la izquierda) > **API**.
2. Copia los siguientes dos valores:
   - **Project URL**: Ejemplo `https://abcdefghijkl.supabase.co`
   - **anon public key**: Una clave larga de texto que comienza con `eyJ...`

---

## 🌐 Paso 4: Publicar la Aplicación en Vercel (Gratis)

**Opción A: Publicar mediante GitHub (Recomendado):**
1. Sube tu carpeta del proyecto a un repositorio de **GitHub** (público o privado).
2. Entra a [https://vercel.com](https://vercel.com) y crea tu cuenta gratuita.
3. Haz clic en **"Add New..."** > **"Project"**.
4. Selecciona tu repositorio de GitHub `PAEC`.
5. En la sección **"Environment Variables"** agrega las siguientes 3 variables:
   - `VITE_SUPABASE_URL` = (Tu Project URL de Supabase)
   - `VITE_SUPABASE_ANON_KEY` = (Tu clave anon public de Supabase)
   - `GEMINI_API_KEY` = (Tu API Key de Google AI Gemini para sugerencias con IA)
6. Haz clic en **"Deploy"**.
7. En menos de 60 segundos tendrás tu enlace público oficial:
   👉 **`https://gestor-paec-escuela.vercel.app`**

---

## 💻 Para Probar en tu Computador Local con la Nube

Para conectar tu entorno local inmediatamente a la base de datos en la nube:

1. Abre el archivo `.env` en la carpeta del proyecto.
2. Agrega tus credenciales:
```env
GEMINI_API_KEY=tu_api_key_gemini
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_supabase
```
3. Guarda el archivo y reinicia el servidor con `npm run dev`.
4. En la parte superior de la aplicación verás el indicador:
   **`🟢 Nube Conectada`**

---

## 🛡️ Seguridad y Respaldo Conforme a la Ley N° 21.545

- **Persistencia en la Nube**: Toda modificación en expedientes PAEC, cambios farmacológicos, hitos o bitácora de desregulación se guarda inmediatamente en la base de datos remota.
- **Tolerancia a Cortes de Internet**: Si se cae la conexión a internet, la aplicación sigue funcionando con el almacenamiento local y se sincroniza automáticamente al restablecerse la red.
- **Exportación de Respaldo**: Siempre puedes usar el botón **"Exportar Respaldo"** para descargar una copia de seguridad institucional en formato JSON.
