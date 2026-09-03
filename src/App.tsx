import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Layers, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  Upload, 
  FileText, 
  SlidersHorizontal,
  GraduationCap,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Table,
  LayoutGrid,
  ChevronRight,
  Settings,
  BookOpen,
  Calendar,
  Clock,
  Printer,
  MoreVertical,
  X,
  Menu,
  ShieldAlert
} from 'lucide-react';
import { Header } from './components/Header';
import { StudentCard } from './components/StudentCard';
import { PaecEditor } from './components/PaecEditor';
import { TemplateCatalog } from './components/TemplateCatalog';
import { TemplateSelectorModal } from './components/TemplateSelectorModal';
import { MilestoneTracker } from './components/MilestoneTracker';
import { IncidentLog } from './components/IncidentLog';
import { ProgressReports } from './components/ProgressReports';
import { OfficialDocumentView } from './components/OfficialDocumentView';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { CloudDatabaseModal } from './components/CloudDatabaseModal';
import { cloudStorage, SyncStatus, PaecAppData } from './services/cloudStorage';
import { 
  EstudiantePAEC, 
  HitoPedagogico, 
  EpisodioDesregulacion, 
  EscuelaConfig, 
  PlantillaPAEC,
  TabType 
} from './types';
import { 
  ESTUDIANTES_INICIALES, 
  HITOS_INICIALES, 
  EPISODIOS_INICIALES, 
  ESCUELA_DEFAULT 
} from './data/defaultData';
import { PLANTILLAS_PREDEFINIDAS } from './data/templates';
import { CURSOS_CHILE } from './utils/helpers';

export const App: React.FC = () => {
  // Persistence state
  const [estudiantes, setEstudiantes] = useState<EstudiantePAEC[]>(() => {
    const saved = localStorage.getItem('paec_estudiantes_v1');
    return saved ? JSON.parse(saved) : ESTUDIANTES_INICIALES;
  });

  const [hitos, setHitos] = useState<HitoPedagogico[]>(() => {
    const saved = localStorage.getItem('paec_hitos_v1');
    return saved ? JSON.parse(saved) : HITOS_INICIALES;
  });

  const [episodios, setEpisodios] = useState<EpisodioDesregulacion[]>(() => {
    const saved = localStorage.getItem('paec_episodios_v1');
    return saved ? JSON.parse(saved) : EPISODIOS_INICIALES;
  });

  const [escuela, setEscuela] = useState<EscuelaConfig>(() => {
    const saved = localStorage.getItem('paec_escuela_v1');
    return saved ? JSON.parse(saved) : ESCUELA_DEFAULT;
  });

  // Cloud Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(cloudStorage.getStatus());
  const [syncDetails, setSyncDetails] = useState<string>('');
  const [showCloudModal, setShowCloudModal] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Navigation & selection
  const [activeTab, setActiveTab] = useState<TabType>('estudiantes');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(estudiantes[0]?.id || '');
  const [showSchoolModal, setShowSchoolModal] = useState<boolean>(false);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [viewingOfficialDoc, setViewingOfficialDoc] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filters for student list
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [teaLevelFilter, setTeaLevelFilter] = useState<string>('todos');

  // Listen to cloud status
  useEffect(() => {
    const unsubscribe = cloudStorage.onStatusChange((status, details) => {
      setSyncStatus(status);
      if (details) setSyncDetails(details);
    });
    return unsubscribe;
  }, []);

  // Load initial data from cloud database
  useEffect(() => {
    async function loadData() {
      try {
        const data = await cloudStorage.loadInitialData();
        if (data) {
          if (data.estudiantes?.length) setEstudiantes(data.estudiantes);
          if (data.hitos?.length) setHitos(data.hitos);
          if (data.episodios?.length) setEpisodios(data.episodios);
          if (data.escuela) setEscuela(data.escuela);
          if (data.estudiantes?.[0]?.id) setSelectedStudentId(data.estudiantes[0].id);
        }
      } catch (err) {
        console.error('Error loading cloud data:', err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto-save changes to cloud & local storage
  useEffect(() => {
    if (isInitialLoading) return;
    cloudStorage.saveAll({
      escuela,
      estudiantes,
      hitos,
      episodios
    });
  }, [estudiantes, hitos, episodios, escuela, isInitialLoading]);

  const handleForceCloudSync = async () => {
    await cloudStorage.saveAll({
      escuela,
      estudiantes,
      hitos,
      episodios
    }, true);
  };

  const currentStudent = estudiantes.find(s => s.id === selectedStudentId) || estudiantes[0];

  // Global calculations
  const totalHitos = hitos.length;
  const hitosLogrados = hitos.filter(h => h.estado === 'logrado' || h.estado === 'consolidado').length;
  const porcentajeCumplimiento = totalHitos > 0 ? Math.round((hitosLogrados / totalHitos) * 100) : 0;
  const planesActivos = estudiantes.filter(s => s.estado === 'Activo').length;
  const hitosPendientes = totalHitos - hitosLogrados;

  // Actions
  const handleSelectStudentForEdit = (student: EstudiantePAEC) => {
    setSelectedStudentId(student.id);
    setActiveTab('editor');
    setViewingOfficialDoc(false);
  };

  const handleViewOfficialDocument = (student: EstudiantePAEC) => {
    setSelectedStudentId(student.id);
    setViewingOfficialDoc(true);
  };

  const handleSaveStudent = (updatedStudent: EstudiantePAEC) => {
    const exists = estudiantes.some(s => s.id === updatedStudent.id);
    if (exists) {
      setEstudiantes(estudiantes.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    } else {
      setEstudiantes([updatedStudent, ...estudiantes]);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('¿Está seguro de eliminar este estudiante y su expediente PAEC?')) {
      const filtered = estudiantes.filter(s => s.id !== studentId);
      setEstudiantes(filtered);
      setHitos(hitos.filter(h => h.estudianteId !== studentId));
      setEpisodios(episodios.filter(e => e.estudianteId !== studentId));
      if (selectedStudentId === studentId && filtered.length > 0) {
        setSelectedStudentId(filtered[0].id);
      }
    }
  };

  const handleDuplicateStudent = (student: EstudiantePAEC) => {
    const duplicated: EstudiantePAEC = {
      ...student,
      id: `est-${Date.now()}`,
      nombre: `${student.nombre} (Copia)`,
      rut: '',
      creadoEl: new Date().toISOString().split('T')[0],
      actualizadoEl: new Date().toISOString().split('T')[0],
      estado: 'Borrador'
    };
    setEstudiantes([duplicated, ...estudiantes]);
    setSelectedStudentId(duplicated.id);
    setActiveTab('editor');
  };

  const handleCreateNewStudent = () => {
    const newStudent: EstudiantePAEC = {
      id: `est-${Date.now()}`,
      nombre: 'Nuevo Estudiante',
      rut: '',
      curso: '1° Básico A',
      fechaNacimiento: '',
      edad: '',
      nombreApoderado: '',
      numeroContactoApoderado: '',
      nombreProfesoraJefe: '',
      nombreEducadoraDiferencial: 'Educadora PIE',
      profesionalesApoyo: {
        terapeutaOcupacional: '',
        fonoaudiologo: '',
        psicologo: ''
      },
      contactosEmergencia: [
        { prioridad: 1, nombre: '', telefono: '', vinculo: 'Madre' },
        { prioridad: 2, nombre: '', telefono: '', vinculo: 'Padre' },
        { prioridad: 3, nombre: '', telefono: '', vinculo: 'Tía(o)' }
      ],
      diagnosticoPie: {
        trastornoEspectroAutista: true,
        nivelTea: 'Nivel 1. Requiere apoyo.',
        comorbilidades: []
      },
      tratamientoMedico: {
        tieneTratamiento: false,
        medicamentos: [],
        descripcion: '',
        cambios: []
      },
      antecedentesSocioemocionales: '',
      descripcionEpisodiosPrevios: '',
      desarrolloPaec: {
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaDesarrollo: new Date().toISOString().split('T')[0],
        fechaCierre: '',
        fechaEntrevistaInicial: new Date().toISOString().split('T')[0],
        fechaEntrevistaCierre: '',
        periodoAplicacion: 'Primer y Segundo Semestre 2026',
        propuestaFlexible: true,
        fechasModificacion: []
      },
      planApoyoContextual: [],
      planApoyoSensorial: [],
      planApoyoRelacional: [],
      tomaConocimiento: [
        { id: '1', nombre: '', rol: 'Profesor(a) Jefe', firmado: false, fechaFirma: new Date().toISOString().split('T')[0] },
        { id: '2', nombre: '', rol: 'Educadora Diferencial PIE', firmado: false, fechaFirma: new Date().toISOString().split('T')[0] },
        { id: '3', nombre: '', rol: 'Apoderado(a)', firmado: false, fechaFirma: new Date().toISOString().split('T')[0] }
      ],
      estado: 'Borrador',
      creadoEl: new Date().toISOString().split('T')[0],
      actualizadoEl: new Date().toISOString().split('T')[0]
    };

    setEstudiantes([newStudent, ...estudiantes]);
    setSelectedStudentId(newStudent.id);
    setActiveTab('editor');
    setViewingOfficialDoc(false);
  };

  // Template handling
  const handleApplyTemplateToNew = (template: PlantillaPAEC) => {
    const newStudent: EstudiantePAEC = {
      id: `est-${Date.now()}`,
      nombre: `Estudiante - ${template.nombre}`,
      rut: '',
      curso: template.etapaEducativa.includes('Parvularia') ? 'Kínder A' : template.etapaEducativa.includes('Media') ? 'I° Medio A' : '3° Básico A',
      fechaNacimiento: '',
      edad: '',
      nombreApoderado: '',
      numeroContactoApoderado: '',
      nombreProfesoraJefe: '',
      nombreEducadoraDiferencial: 'Educadora PIE',
      contactosEmergencia: [
        { prioridad: 1, nombre: '', telefono: '', vinculo: 'Madre' },
        { prioridad: 2, nombre: '', telefono: '', vinculo: 'Padre' },
        { prioridad: 3, nombre: '', telefono: '', vinculo: 'Abuela(o)' }
      ],
      diagnosticoPie: {
        trastornoEspectroAutista: true,
        nivelTea: template.nivelTea,
        comorbilidades: template.diagnosticoSugerido?.comorbilidades || []
      },
      tratamientoMedico: {
        tieneTratamiento: false,
        medicamentos: [],
        descripcion: '',
        cambios: []
      },
      antecedentesSocioemocionales: template.antecedentesSocioemocionalesEjemplo || '',
      descripcionEpisodiosPrevios: template.descripcionEpisodiosEjemplo || '',
      desarrolloPaec: {
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaDesarrollo: new Date().toISOString().split('T')[0],
        fechaCierre: '',
        fechaEntrevistaInicial: new Date().toISOString().split('T')[0],
        fechaEntrevistaCierre: '',
        periodoAplicacion: 'Primer y Segundo Semestre 2026',
        propuestaFlexible: true,
        fechasModificacion: []
      },
      planApoyoContextual: template.planContextual.map((p, idx) => ({ ...p, id: `ctx-${Date.now()}-${idx}` })),
      planApoyoSensorial: template.planSensorial.map((p, idx) => ({ ...p, id: `sen-${Date.now()}-${idx}` })),
      planApoyoRelacional: template.planRelacional.map((p, idx) => ({ ...p, id: `rel-${Date.now()}-${idx}` })),
      tomaConocimiento: [
        { id: '1', nombre: '', rol: 'Profesor(a) Jefe', firmado: false, fechaFirma: new Date().toISOString().split('T')[0] },
        { id: '2', nombre: '', rol: 'Educadora Diferencial PIE', firmado: false, fechaFirma: new Date().toISOString().split('T')[0] },
        { id: '3', nombre: '', rol: 'Apoderado(a)', firmado: false, fechaFirma: new Date().toISOString().split('T')[0] }
      ],
      estado: 'Borrador',
      creadoEl: new Date().toISOString().split('T')[0],
      actualizadoEl: new Date().toISOString().split('T')[0]
    };

    if (template.hitosSugeridos && template.hitosSugeridos.length > 0) {
      const newHitosList: HitoPedagogico[] = template.hitosSugeridos.map((h, i) => ({
        id: `hito-${Date.now()}-${i}`,
        estudianteId: newStudent.id,
        titulo: h.titulo,
        descripcion: h.descripcion,
        dimension: h.dimension,
        estado: 'en_proceso',
        porcentajeLogro: 40,
        metaEsperada: 'Criterio semestral',
        fechaEvaluacion: new Date().toISOString().split('T')[0],
        responsable: 'Educadora PIE',
        observaciones: 'Importado de plantilla normativa'
      }));
      setHitos(prev => [...prev, ...newHitosList]);
    }

    setEstudiantes([newStudent, ...estudiantes]);
    setSelectedStudentId(newStudent.id);
    setActiveTab('editor');
  };

  const handleApplyTemplateToExisting = (template: PlantillaPAEC, targetStudentId: string) => {
    const target = estudiantes.find(s => s.id === targetStudentId);
    if (!target) return;

    const updated: EstudiantePAEC = {
      ...target,
      planApoyoContextual: [
        ...target.planApoyoContextual,
        ...template.planContextual.map((p, idx) => ({ ...p, id: `ctx-${Date.now()}-${idx}` }))
      ],
      planApoyoSensorial: [
        ...target.planApoyoSensorial,
        ...template.planSensorial.map((p, idx) => ({ ...p, id: `sen-${Date.now()}-${idx}` }))
      ],
      planApoyoRelacional: [
        ...target.planApoyoRelacional,
        ...template.planRelacional.map((p, idx) => ({ ...p, id: `rel-${Date.now()}-${idx}` }))
      ],
      actualizadoEl: new Date().toISOString().split('T')[0]
    };

    setEstudiantes(estudiantes.map(s => s.id === targetStudentId ? updated : s));
    setSelectedStudentId(targetStudentId);
    setActiveTab('editor');
  };

  const handleImportTemplateIntoCurrentEditor = (
    template: PlantillaPAEC, 
    options: { replaceStrategies: boolean; replaceDiagnosis: boolean; replaceHistory: boolean }
  ) => {
    if (!currentStudent) return;

    const updated: EstudiantePAEC = {
      ...currentStudent,
      ...(options.replaceStrategies ? {
        planApoyoContextual: template.planContextual.map((p, idx) => ({ ...p, id: `ctx-${Date.now()}-${idx}` })),
        planApoyoSensorial: template.planSensorial.map((p, idx) => ({ ...p, id: `sen-${Date.now()}-${idx}` })),
        planApoyoRelacional: template.planRelacional.map((p, idx) => ({ ...p, id: `rel-${Date.now()}-${idx}` }))
      } : {}),
      ...(options.replaceDiagnosis ? {
        diagnosticoPie: {
          trastornoEspectroAutista: true,
          nivelTea: template.nivelTea,
          comorbilidades: template.diagnosticoSugerido?.comorbilidades || currentStudent.diagnosticoPie?.comorbilidades || []
        }
      } : {}),
      ...(options.replaceHistory ? {
        antecedentesSocioemocionales: template.antecedentesSocioemocionalesEjemplo || currentStudent.antecedentesSocioemocionales,
        descripcionEpisodiosPrevios: template.descripcionEpisodiosEjemplo || currentStudent.descripcionEpisodiosPrevios
      } : {}),
      actualizadoEl: new Date().toISOString().split('T')[0]
    };

    handleSaveStudent(updated);
  };

  // Export / Backup data
  const handleExportData = () => {
    const fullBackup = {
      version: '1.0',
      fechaExportacion: new Date().toISOString(),
      escuela,
      estudiantes,
      hitos,
      episodios
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Respaldo_PAEC_${escuela.rbd}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered student list
  const filteredEstudiantes = estudiantes.filter(st => {
    if (courseFilter !== 'todos' && st.curso !== courseFilter) return false;
    if (statusFilter !== 'todos' && st.estado !== statusFilter) return false;
    if (teaLevelFilter !== 'todos' && !st.diagnosticoPie?.nivelTea?.includes(teaLevelFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return st.nombre.toLowerCase().includes(q) || st.rut.toLowerCase().includes(q) || (st.nombreApoderado || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Get initials for school avatar
  const schoolInitials = escuela.nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'EP';

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#334155] font-sans flex overflow-x-hidden">
      {/* SIDEBAR NAVIGATION - HIGH DENSITY THEME */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0F172A] text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto shrink-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>PAEC</span>
              <span className="text-emerald-400">TEA</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-medium">
              Gestión Educativa Chile
            </p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          <div>
            <div className="px-3 mb-2 text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Panel Principal
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('estudiantes'); setViewingOfficialDoc(false); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'estudiantes' && !viewingOfficialDoc
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-2.5 text-sm">📊</span>
                <span className="flex-1 text-left">Dashboard Estudiantes</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {estudiantes.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('editor'); setViewingOfficialDoc(false); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'editor' && !viewingOfficialDoc
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-2.5 text-sm">📄</span>
                <span className="flex-1 text-left">Editor PAEC (Res. 586)</span>
              </button>

              <button
                onClick={() => { setActiveTab('plantillas'); setViewingOfficialDoc(false); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'plantillas' && !viewingOfficialDoc
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-2.5 text-sm">📑</span>
                <span className="flex-1 text-left">Plantillas Normativas</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                  5
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('hitos'); setViewingOfficialDoc(false); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'hitos' && !viewingOfficialDoc
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-2.5 text-sm">📅</span>
                <span className="flex-1 text-left">Hitos Pedagógicos</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {porcentajeCumplimiento}%
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('bitacora'); setViewingOfficialDoc(false); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'bitacora' && !viewingOfficialDoc
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-2.5 text-sm">⚠️</span>
                <span className="flex-1 text-left">Bitácora Desregulación</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {episodios.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('reportes'); setViewingOfficialDoc(false); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'reportes' && !viewingOfficialDoc
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-2.5 text-sm">📈</span>
                <span className="flex-1 text-left">Reportes de Progreso</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 font-extrabold">
                  IA
                </span>
              </button>
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Configuración
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { setShowSchoolModal(true); setIsSidebarOpen(false); }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <span className="mr-2.5 text-sm">⚙️</span>
                <span className="flex-1 text-left">Ley 21.545 & Escuela</span>
              </button>

              <button
                onClick={() => { setShowCloudModal(true); setIsSidebarOpen(false); }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
              >
                <span className="mr-2.5 text-sm">☁️</span>
                <span className="flex-1 text-left">Base de Datos & Nube</span>
              </button>

              <button
                onClick={handleExportData}
                className="w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <span className="mr-2.5 text-sm">💾</span>
                <span className="flex-1 text-left">Respaldar Datos JSON</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Bottom User/School profile in Sidebar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {schoolInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{escuela.nombre}</p>
              <p className="text-[10px] text-slate-400 truncate">RBD: {escuela.rbd} • Admin PIE</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* MAIN APPLICATION CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setViewingOfficialDoc(false);
          }}
          escuela={escuela}
          onOpenSchoolSettings={() => setShowSchoolModal(true)}
          totalStudents={estudiantes.length}
          activeStudents={planesActivos}
          onNewStudent={handleCreateNewStudent}
          onExportBackup={handleExportData}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          syncStatus={syncStatus}
          syncStatusDetails={syncDetails}
          onManualSync={() => setShowCloudModal(true)}
          onOpenCloudSettings={() => setShowCloudModal(true)}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-x-hidden">
          {/* VIEW: OFFICIAL PRINTABLE DOCUMENT */}
          {viewingOfficialDoc && currentStudent ? (
            <OfficialDocumentView
              student={currentStudent}
              escuela={escuela}
              onBack={() => setViewingOfficialDoc(false)}
              onEdit={() => {
                setViewingOfficialDoc(false);
                setActiveTab('editor');
              }}
            />
          ) : (
            <>
              {/* VIEW: DASHBOARD ESTUDIANTES (HIGH DENSITY 12-COL GRID) */}
              {activeTab === 'estudiantes' && (
                <div className="space-y-6">
                  {/* Top 3 High-Density Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Estudiantes</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{estudiantes.length}</p>
                      <div className="text-[10px] text-emerald-600 mt-1 font-semibold">
                        +{estudiantes.filter(s => s.diagnosticoPie?.nivelTea?.includes('Nivel 1')).length} TEA Nivel 1 • +{estudiantes.filter(s => s.diagnosticoPie?.nivelTea?.includes('Nivel 2')).length} TEA Nivel 2
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Cumplimiento Hitos</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{porcentajeCumplimiento}%</p>
                      <div className="text-[10px] text-amber-600 mt-1 font-semibold">
                        {hitosPendientes} hitos pendientes de consolidación
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Planes Vigentes</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{planesActivos}</p>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium">
                        Normativa Ley 21.545 & Res. 586
                      </div>
                    </div>
                  </div>

                  {/* 12-Column High-Density Grid (8 Cols Table/Directory + 4 Cols Side Insight Panels) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: ESTUDIANTES TABLE / LIST (8 COLS) */}
                    <section className="lg:col-span-8 flex flex-col space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
                        {/* High-density Filter Bar */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">Listado de Estudiantes y Estados PAEC</h3>
                            <span className="px-2 py-0.5 rounded-full text-2xs bg-slate-200 text-slate-700 font-bold font-mono">
                              {filteredEstudiantes.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Toggle Table/Cards */}
                            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                              <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md text-xs transition-colors ${
                                  viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Vista Tabla Alta Densidad"
                              >
                                <Table className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setViewMode('cards')}
                                className={`p-1.5 rounded-md text-xs transition-colors ${
                                  viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Vista Tarjetas"
                              >
                                <LayoutGrid className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                              <input
                                type="text"
                                placeholder="Buscar estudiante..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-44 sm:w-52 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quick filter badges bar */}
                        <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-1 text-slate-500 text-[11px] font-semibold">
                            <Filter className="w-3 h-3" />
                            <span>Filtros:</span>
                          </div>

                          <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="text-2xs py-1 px-2 rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium"
                          >
                            <option value="todos">Todos los Cursos</option>
                            {CURSOS_CHILE.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>

                          <select
                            value={teaLevelFilter}
                            onChange={(e) => setTeaLevelFilter(e.target.value)}
                            className="text-2xs py-1 px-2 rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium"
                          >
                            <option value="todos">Todos los Niveles TEA</option>
                            <option value="Nivel 1">Nivel 1 (Apoyo)</option>
                            <option value="Nivel 2">Nivel 2 (Sustancial)</option>
                            <option value="Nivel 3">Nivel 3 (Muy Sustancial)</option>
                          </select>

                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-2xs py-1 px-2 rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium"
                          >
                            <option value="todos">Todos los Estados</option>
                            <option value="Activo">Activo</option>
                            <option value="Borrador">Borrador</option>
                            <option value="En Revisión">En Revisión</option>
                          </select>

                          {(courseFilter !== 'todos' || teaLevelFilter !== 'todos' || statusFilter !== 'todos' || searchQuery) && (
                            <button
                              onClick={() => {
                                setCourseFilter('todos');
                                setTeaLevelFilter('todos');
                                setStatusFilter('todos');
                                setSearchQuery('');
                              }}
                              className="text-2xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-0.5 rounded hover:bg-rose-50"
                            >
                              Limpiar
                            </button>
                          )}
                        </div>

                        {/* High-density Table View */}
                        {viewMode === 'table' ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
                                <tr>
                                  <th className="px-5 py-3">Estudiante</th>
                                  <th className="px-4 py-3">Nivel Apoyo</th>
                                  <th className="px-4 py-3">Curso & Diagnóstico</th>
                                  <th className="px-4 py-3">Progreso Hitos</th>
                                  <th className="px-5 py-3 text-right">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="text-xs divide-y divide-slate-100">
                                {filteredEstudiantes.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                      No se encontraron estudiantes con los filtros seleccionados.
                                    </td>
                                  </tr>
                                ) : (
                                  filteredEstudiantes.map(st => {
                                    const stHitos = hitos.filter(h => h.estudianteId === st.id);
                                    const stLogrados = stHitos.filter(h => h.estado === 'logrado' || h.estado === 'consolidado').length;
                                    const stPct = stHitos.length > 0 ? Math.round((stLogrados / stHitos.length) * 100) : 0;
                                    
                                    const nivelBadge = st.diagnosticoPie?.nivelTea?.includes('Nivel 1')
                                      ? 'bg-blue-100 text-blue-700'
                                      : st.diagnosticoPie?.nivelTea?.includes('Nivel 2')
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-amber-100 text-amber-800';

                                    const nivelLabel = st.diagnosticoPie?.nivelTea?.includes('Nivel 1')
                                      ? 'Nivel 1'
                                      : st.diagnosticoPie?.nivelTea?.includes('Nivel 2')
                                      ? 'Nivel 2'
                                      : 'Nivel 3';

                                    return (
                                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-3">
                                          <div className="font-semibold text-slate-900">{st.nombre}</div>
                                          <div className="text-[10px] text-slate-400 font-mono">
                                            RUT: {st.rut || 'Pendiente'}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${nivelBadge}`}>
                                            {nivelLabel}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="font-medium text-slate-700">{st.curso}</div>
                                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                            {st.diagnosticoPie?.comorbilidades?.join(', ') || 'TEA Puro'}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                              <div 
                                                className={`h-full ${stPct >= 75 ? 'bg-emerald-500' : stPct >= 40 ? 'bg-blue-500' : 'bg-amber-400'}`}
                                                style={{ width: `${stPct}%` }}
                                              ></div>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-500 font-semibold">{stPct}%</span>
                                          </div>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <button
                                              onClick={() => handleViewOfficialDocument(st)}
                                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                                              title="Ver PDF Oficial"
                                            >
                                              <Printer className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => handleSelectStudentForEdit(st)}
                                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                                            >
                                              Gestionar
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          /* High-density Cards View */
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredEstudiantes.map(student => (
                              <StudentCard
                                key={student.id}
                                student={student}
                                hitos={hitos}
                                episodios={episodios}
                                onEditPaec={handleSelectStudentForEdit}
                                onViewDocument={handleViewOfficialDocument}
                                onViewHitos={(st) => {
                                  setSelectedStudentId(st.id);
                                  setActiveTab('hitos');
                                }}
                                onAddIncident={(st) => {
                                  setSelectedStudentId(st.id);
                                  setActiveTab('bitacora');
                                }}
                                onGenerateReport={(st) => {
                                  setSelectedStudentId(st.id);
                                  setActiveTab('reportes');
                                }}
                                onDeleteStudent={handleDeleteStudent}
                                onDuplicateStudent={handleDuplicateStudent}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </section>

                    {/* RIGHT COLUMN: HIGH-DENSITY SIDE INSIGHT PANELS (4 COLS) */}
                    <section className="lg:col-span-4 flex flex-col space-y-6">
                      {/* Dark Insight Card */}
                      <div className="bg-[#1E293B] text-white p-5 rounded-xl shadow-md border border-slate-700/80">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detalle Hito Actual</h3>
                        <div className="mt-3 flex justify-between items-end">
                          <div>
                            <p className="text-xl font-light text-slate-100">
                              Adecuación <span className="font-bold text-white">Evaluativa</span>
                            </p>
                            <p className="text-xs text-emerald-400 mt-0.5 font-medium flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Fase de Implementación Activa
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Ley 21.545</p>
                            <p className="text-base font-mono font-bold text-slate-200">Art. 18</p>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-slate-700/80 pt-3 space-y-2.5">
                          <div className="flex items-center text-xs">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2.5"></div>
                            <span className="flex-1 text-slate-300">Detección y caracterización sensorial</span>
                            <span className="text-emerald-400 font-bold text-2xs uppercase">Ok</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2.5"></div>
                            <span className="flex-1 text-slate-300">Propuesta pedagógica inicial Res. 586</span>
                            <span className="text-emerald-400 font-bold text-2xs uppercase">Ok</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <div className="w-2 h-2 rounded-full bg-blue-400 mr-2.5"></div>
                            <span className="flex-1 text-slate-300">Validación y firma con la familia</span>
                            <span className="text-blue-300 font-bold text-2xs uppercase">En Proceso</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('hitos')}
                          className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-1"
                        >
                          <span>Ver Matriz Completa de Hitos</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Light Radial Achievement Card */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Reporte de Avance Institucional</h3>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            PIE {escuela.anoEscolar}
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center my-2">
                          <div className="w-28 h-28 rounded-full border-6 border-slate-100 border-t-emerald-500 border-r-emerald-500 flex items-center justify-center relative shadow-inner">
                            <div className="text-center">
                              <span className="text-2xl font-black text-slate-900 font-mono">{porcentajeCumplimiento}%</span>
                              <p className="text-[9px] text-slate-400 uppercase font-bold">Consolidado</p>
                            </div>
                            <span className="absolute -bottom-2 bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase font-bold shadow-xs">
                              Logro Promedio
                            </span>
                          </div>
                        </div>

                        <div className="w-full space-y-3 mt-4">
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                              <span>Socio-Emocional</span>
                              <span className="font-mono text-emerald-700 font-bold">92%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
                              <div className="bg-emerald-500 w-[92%] h-full"></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                              <span>Integración Sensorial</span>
                              <span className="font-mono text-amber-700 font-bold">58%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
                              <div className="bg-amber-500 w-[58%] h-full"></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                              <span>Currículum Adaptado (DUA)</span>
                              <span className="font-mono text-blue-700 font-bold">64%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
                              <div className="bg-blue-500 w-[64%] h-full"></div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('reportes')}
                          className="w-full mt-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                        >
                          Generar Reporte PDF con IA
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* VIEW: EDITOR PAEC */}
              {activeTab === 'editor' && currentStudent && (
                <PaecEditor
                  student={currentStudent}
                  onSaveStudent={handleSaveStudent}
                  onOpenTemplateSelector={() => setShowTemplateModal(true)}
                  onViewDocument={handleViewOfficialDocument}
                />
              )}

              {/* VIEW: PLANTILLAS AUTOMÁTICAS */}
              {activeTab === 'plantillas' && (
                <TemplateCatalog
                  onApplyTemplateToNew={handleApplyTemplateToNew}
                  onApplyTemplateToExisting={handleApplyTemplateToExisting}
                  estudiantes={estudiantes}
                />
              )}

              {/* VIEW: SEGUIMIENTO DE HITOS */}
              {activeTab === 'hitos' && (
                <MilestoneTracker
                  hitos={hitos}
                  estudiantes={estudiantes}
                  onSaveHitos={setHitos}
                  selectedStudentId={selectedStudentId}
                  onSelectStudentId={setSelectedStudentId}
                />
              )}

              {/* VIEW: BITÁCORA DE DESREGULACIÓN */}
              {activeTab === 'bitacora' && (
                <IncidentLog
                  episodios={episodios}
                  estudiantes={estudiantes}
                  onSaveEpisodios={setEpisodios}
                  selectedStudentId={selectedStudentId}
                />
              )}

              {/* VIEW: REPORTES DE PROGRESO */}
              {activeTab === 'reportes' && (
                <ProgressReports
                  estudiantes={estudiantes}
                  hitos={hitos}
                  episodios={episodios}
                  escuela={escuela}
                  selectedStudentId={selectedStudentId}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <SchoolSettingsModal
        isOpen={showSchoolModal}
        onClose={() => setShowSchoolModal(false)}
        escuela={escuela}
        onSaveEscuela={setEscuela}
      />

      <TemplateSelectorModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleImportTemplateIntoCurrentEditor}
      />

      <CloudDatabaseModal
        isOpen={showCloudModal}
        onClose={() => setShowCloudModal(false)}
        syncStatus={syncStatus}
        syncDetails={syncDetails}
        appData={{ escuela, estudiantes, hitos, episodios }}
        onForceSync={handleForceCloudSync}
      />
    </div>
  );
};

export default App;
