/**
 * Utilidades para el Gestor PAEC
 */

// Formateador y validador de RUT chileno
export function formatRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  
  const dv = clean.slice(-1);
  const cuerpo = clean.slice(0, -1);
  
  let formatted = '';
  let count = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    formatted = cuerpo[i] + (count > 0 && count % 3 === 0 ? '.' : '') + formatted;
    count++;
  }
  return `${formatted}-${dv}`;
}

export function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 8) return false;
  
  const dv = clean.slice(-1);
  const cuerpo = clean.slice(0, -1);
  
  let suma = 0;
  let multiplo = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  
  const resto = suma % 11;
  const dvEsperado = 11 - resto === 11 ? '0' : 11 - resto === 10 ? 'K' : String(11 - resto);
  return dv === dvEsperado;
}

// Formateador de fechas a formato estándar chileno (DD/MM/AAAA)
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

// Cálculo de edad a partir de fecha de nacimiento
export function calculateAge(birthDateString?: string): string {
  if (!birthDateString) return '';
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return '';
  
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }
  
  return years > 0 ? `${years} años` : 'Menos de 1 año';
}

// Constantes de medicamentos comunes en PIE / Neurología TEA
export const MEDICAMENTOS_COMUNES = [
  'Risperidona',
  'Haloperidol (Heparidol)',
  'Carbamazepina',
  'Topiramato',
  'Metilfenidato',
  'Lamotrigina',
  'Diazepam',
  'Lorazepam',
  'Fluoxetina',
  'Sertralina',
  'Aripiprazol',
  'Ácido Valproico',
  'Melatonina',
  'Clonazepam',
  'Atomoxetina'
];

// Constantes de comorbilidades según Decreto 170 / Res. 586
export const COMORBILIDADES_COMUNES = [
  'Déficit Intelectual Leve',
  'Déficit Intelectual Moderado',
  'Trastorno de Integración Sensorial',
  'Alteraciones Motoras',
  'Déficit Atencional',
  'Déficit Atencional - Hiperactividad',
  'Trastorno del sueño',
  'Trastorno de Ansiedad',
  'Selectividad Alimentaria Severa',
  'Trastorno Específico del Lenguaje (TEL)'
];

// Cursos del sistema educacional chileno
export const CURSOS_CHILE = [
  'Pre-Kínder (NT1)',
  'Kínder (NT2)',
  '1° Básico A', '1° Básico B',
  '2° Básico A', '2° Básico B',
  '3° Básico A', '3° Básico B',
  '4° Básico A', '4° Básico B',
  '5° Básico A', '5° Básico B',
  '6° Básico A', '6° Básico B',
  '7° Básico A', '7° Básico B',
  '8° Básico A', '8° Básico B',
  '1° Medio A', '1° Medio B', '1° Medio C',
  '2° Medio A', '2° Medio B', '2° Medio C',
  '3° Medio A (HC)', '3° Medio B (TP)', '3° Medio C (TP)',
  '4° Medio A (HC)', '4° Medio B (TP)', '4° Medio C (TP)'
];
