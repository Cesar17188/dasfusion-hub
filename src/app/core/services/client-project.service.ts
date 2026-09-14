import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { 
  ClientProject, 
  ProjectPhase, 
  ProjectStatus, 
  PortalMetrics, 
  ProjectCategory 
} from '../models/client-project.model';

const STORAGE_KEY_PREFIX = 'dasfusion_client_projects_';

@Injectable({
  providedIn: 'root'
})
export class ClientProjectService {
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);

  readonly projects = signal<ClientProject[]>([]);
  readonly selectedProject = signal<ClientProject | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly categoryFilter = signal<string>('all');
  readonly phaseFilter = signal<string>('all');
  readonly statusFilter = signal<string>('all');

  constructor() {
    this.initService();
  }

  private async initService() {
    await this.loadProjects();
  }

  /**
   * Métricas calculadas en tiempo real para el Dashboard
   */
  readonly metrics = computed<PortalMetrics>(() => {
    const list = this.projects();
    const total = list.length;
    if (total === 0) {
      return {
        totalProjects: 0,
        inDevelopment: 0,
        inDiscovery: 0,
        inDesign: 0,
        inQa: 0,
        completed: 0,
        averageProgress: 0,
        totalDeliverables: 0,
        completedDeliverables: 0
      };
    }

    const inDiscovery = list.filter(p => p.phase === 'discovery').length;
    const inDesign = list.filter(p => p.phase === 'design').length;
    const inDevelopment = list.filter(p => p.phase === 'development').length;
    const inQa = list.filter(p => p.phase === 'qa_testing').length;
    const completed = list.filter(p => p.phase === 'delivered' || p.status === 'completed').length;

    const progressSum = list.reduce((sum, p) => sum + (p.progressPercentage || 0), 0);
    const avgProgress = Math.round(progressSum / total);

    const totalDeliverables = list.reduce((sum, p) => sum + (p.deliverablesTotal || 0), 0);
    const completedDeliverables = list.reduce((sum, p) => sum + (p.deliverablesDone || 0), 0);

    return {
      totalProjects: total,
      inDevelopment,
      inDiscovery,
      inDesign,
      inQa,
      completed,
      averageProgress: avgProgress,
      totalDeliverables,
      completedDeliverables
    };
  });

  /**
   * Proyectos filtrados dinámicamente por término de búsqueda, categoría y estado
   */
  readonly filteredProjects = computed<ClientProject[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter();
    const phase = this.phaseFilter();
    const status = this.statusFilter();

    return this.projects().filter(p => {
      const matchQuery = !query || 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.techStack.some(t => t.toLowerCase().includes(query));

      const matchCat = cat === 'all' || p.category === cat;
      const matchPhase = phase === 'all' || p.phase === phase;
      const matchStatus = status === 'all' || p.status === status;

      return matchQuery && matchCat && matchPhase && matchStatus;
    });
  });

  /**
   * Cargar proyectos desde Supabase con caché y datos iniciales inteligentes
   */
  async loadProjects(): Promise<ClientProject[]> {
    this.isLoading.set(true);
    const user = this.authService.currentUser();
    const storageKey = `${STORAGE_KEY_PREFIX}${user?.id || 'guest'}`;

    try {
      // 1. Intentar cargar desde Supabase si hay cliente
      let supabaseProjects: ClientProject[] = [];
      try {
        const { data, error } = await this.supabaseService.client
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          supabaseProjects = data.map(item => this.mapSupabaseToClientProject(item));
        }
      } catch (sbErr) {
        console.warn('Supabase projects fetch fallback to local storage:', sbErr);
      }

      // 2. Intentar leer de localStorage
      let localData: ClientProject[] = [];
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          try {
            localData = JSON.parse(raw);
          } catch (e) {
            console.error('Error parsing local projects:', e);
          }
        }
      }

      // 3. Fusionar datos o proveer proyectos demostrativos iniciales para el cliente
      let finalProjects: ClientProject[] = [];
      if (localData.length > 0) {
        finalProjects = localData;
      } else if (supabaseProjects.length > 0) {
        finalProjects = supabaseProjects;
      } else {
        // Sembrar proyectos de ejemplo para que el cliente experimente la plataforma
        finalProjects = this.getInitialSeedProjects(user?.id);
        this.saveToStorage(storageKey, finalProjects);
      }

      this.projects.set(finalProjects);
      return finalProjects;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Crear un nuevo proyecto
   */
  async createProject(projectData: Partial<ClientProject>): Promise<ClientProject> {
    this.isLoading.set(true);
    const user = this.authService.currentUser();
    const storageKey = `${STORAGE_KEY_PREFIX}${user?.id || 'guest'}`;

    const newProject: ClientProject = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      userId: user?.id || 'guest',
      title: projectData.title || 'Nuevo Proyecto de Ingeniería',
      description: projectData.description || 'Proyecto de software y arquitectura en nube.',
      category: projectData.category || 'Fullstack Web',
      phase: projectData.phase || 'discovery',
      status: projectData.status || 'on_track',
      priority: projectData.priority || 'high',
      progressPercentage: projectData.progressPercentage ?? 10,
      budget: projectData.budget || 2500,
      currency: projectData.currency || 'USD',
      techStack: projectData.techStack && projectData.techStack.length > 0 
        ? projectData.techStack 
        : ['Angular', 'TypeScript', 'Supabase', 'Node.js', 'Tailwind CSS'],
      assignedLead: projectData.assignedLead || 'Ing. César Morán (DASFusion Lead)',
      assignedTeam: [
        { name: 'César M.', role: 'Lead Architect & AI Engineer' },
        { name: 'Alex R.', role: 'Senior Frontend Dev' },
        { name: 'Valeria T.', role: 'QA & Security Lead' }
      ],
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      targetDeliveryDate: projectData.targetDeliveryDate || this.getFutureDate(45),
      deliverablesTotal: projectData.deliverablesTotal || 5,
      deliverablesDone: 1,
      liveUrl: projectData.liveUrl || '',
      repoUrl: projectData.repoUrl || '',
      requirements: projectData.requirements || [
        { id: '1', title: 'Definición de arquitectura y modelo de datos', completed: true, priority: 'must_have' },
        { id: '2', title: 'Diseño UX/UI interactivo en Figma', completed: false, priority: 'must_have' },
        { id: '3', title: 'Implementación del Backend y APIs', completed: false, priority: 'must_have' },
        { id: '4', title: 'Pruebas de estrés y seguridad', completed: false, priority: 'nice_to_have' }
      ],
      createdAt: new Date().toISOString()
    };

    // Guardar en Supabase si es posible
    try {
      if (user?.id) {
        await this.supabaseService.client.from('projects').insert({
          id: newProject.id,
          user_id: user.id,
          title: newProject.title,
          description: newProject.description,
          tech_stack: newProject.techStack,
          live_url: newProject.liveUrl || null,
          created_at: newProject.createdAt
        });
      }
    } catch (e) {
      console.warn('Supabase remote insert fallback to reactive signals:', e);
    }

    // Actualizar estado local reactivo
    const updatedList = [newProject, ...this.projects()];
    this.projects.set(updatedList);
    this.saveToStorage(storageKey, updatedList);
    this.isLoading.set(false);

    return newProject;
  }

  /**
   * Cambiar de fase en el tablero Kanban (con ajuste de progreso y estado)
   */
  async updateProjectPhase(projectId: string, newPhase: ProjectPhase): Promise<void> {
    const list = this.projects();
    const index = list.findIndex(p => p.id === projectId);
    if (index === -1) return;

    const current = list[index];
    let autoProgress = current.progressPercentage;

    switch (newPhase) {
      case 'discovery':
        autoProgress = Math.max(10, Math.min(25, autoProgress));
        break;
      case 'design':
        autoProgress = Math.max(30, Math.min(50, autoProgress));
        break;
      case 'development':
        autoProgress = Math.max(55, Math.min(80, autoProgress));
        break;
      case 'qa_testing':
        autoProgress = Math.max(85, Math.min(95, autoProgress));
        break;
      case 'delivered':
        autoProgress = 100;
        break;
    }

    const updated: ClientProject = {
      ...current,
      phase: newPhase,
      progressPercentage: autoProgress,
      status: newPhase === 'delivered' ? 'completed' : current.status,
      updatedAt: new Date().toISOString()
    };

    const nextList = [...list];
    nextList[index] = updated;

    this.projects.set(nextList);
    this.saveToStorage(this.getStorageKey(), nextList);
  }

  /**
   * Actualizar campos generales de un proyecto
   */
  async updateProject(projectId: string, updates: Partial<ClientProject>): Promise<void> {
    const list = this.projects();
    const index = list.findIndex(p => p.id === projectId);
    if (index === -1) return;

    const updated: ClientProject = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const nextList = [...list];
    nextList[index] = updated;

    this.projects.set(nextList);
    this.saveToStorage(this.getStorageKey(), nextList);

    if (this.selectedProject()?.id === projectId) {
      this.selectedProject.set(updated);
    }
  }

  /**
   * Eliminar un proyecto
   */
  async deleteProject(projectId: string): Promise<void> {
    const nextList = this.projects().filter(p => p.id !== projectId);
    this.projects.set(nextList);
    this.saveToStorage(this.getStorageKey(), nextList);

    if (this.selectedProject()?.id === projectId) {
      this.selectedProject.set(null);
    }

    try {
      await this.supabaseService.client.from('projects').delete().eq('id', projectId);
    } catch (e) {
      console.warn('Remote deletion error:', e);
    }
  }

  /**
   * Alternar estado de cumplimiento de requerimiento
   */
  toggleRequirement(projectId: string, requirementId: string) {
    const project = this.projects().find(p => p.id === projectId);
    if (!project || !project.requirements) return;

    const updatedReqs = project.requirements.map(req => 
      req.id === requirementId ? { ...req, completed: !req.completed } : req
    );

    const completedCount = updatedReqs.filter(r => r.completed).length;
    const progress = Math.round((completedCount / updatedReqs.length) * 100);

    this.updateProject(projectId, {
      requirements: updatedReqs,
      deliverablesDone: completedCount,
      progressPercentage: progress
    });
  }

  // --- Helpers privados ---

  private getStorageKey(): string {
    const user = this.authService.currentUser();
    return `${STORAGE_KEY_PREFIX}${user?.id || 'guest'}`;
  }

  private saveToStorage(key: string, data: ClientProject[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  private getFutureDate(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  }

  private mapSupabaseToClientProject(sbItem: any): ClientProject {
    return {
      id: sbItem.id,
      userId: sbItem.user_id,
      title: sbItem.title || 'Proyecto DASFusion',
      description: sbItem.description || '',
      category: 'Fullstack Web',
      phase: 'development',
      status: 'on_track',
      priority: 'high',
      progressPercentage: 65,
      budget: 3500,
      currency: 'USD',
      techStack: sbItem.tech_stack || ['Angular', 'TypeScript', 'Supabase'],
      assignedLead: 'Ing. César Morán',
      assignedTeam: [
        { name: 'César M.', role: 'AI & Fullstack Lead' },
        { name: 'David G.', role: 'Frontend Engineer' }
      ],
      startDate: new Date().toISOString().split('T')[0],
      targetDeliveryDate: this.getFutureDate(30),
      deliverablesTotal: 6,
      deliverablesDone: 4,
      liveUrl: sbItem.live_url || '',
      createdAt: sbItem.created_at || new Date().toISOString()
    };
  }

  private getInitialSeedProjects(userId?: string): ClientProject[] {
    return [
      {
        id: 'proj_enterprise_erp',
        userId: userId || 'demo_user',
        title: 'Core ERP Cloud & Facturación Electrónica',
        description: 'Plataforma empresarial de gestión de inventarios, facturación electrónica SRI y análisis financiero en tiempo real.',
        category: 'SaaS & Enterprise',
        phase: 'development',
        status: 'on_track',
        priority: 'critical',
        progressPercentage: 72,
        budget: 6800,
        currency: 'USD',
        techStack: ['Angular 21', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        assignedLead: 'Ing. César Morán (Lead Architect)',
        assignedTeam: [
          { name: 'César M.', role: 'Lead Architect' },
          { name: 'Andrés V.', role: 'Backend Specialist' },
          { name: 'Elena R.', role: 'UI/UX Designer' }
        ],
        startDate: '2026-08-01',
        targetDeliveryDate: '2026-10-15',
        liveUrl: 'https://erp-demo.dasfusion.com',
        repoUrl: 'https://github.com/dasfusion/enterprise-erp',
        deliverablesTotal: 8,
        deliverablesDone: 6,
        requirements: [
          { id: '1', title: 'Módulo de Facturación Electrónica y Firma Digital', completed: true, priority: 'must_have' },
          { id: '2', title: 'Dashboard de Finanzas con Gráficos Predictivos', completed: true, priority: 'must_have' },
          { id: '3', title: 'Gestión de Roles y Permisos Granulares (RBAC)', completed: true, priority: 'must_have' },
          { id: '4', title: 'Integración de Webhooks y APIs con Bancos', completed: false, priority: 'must_have' },
          { id: '5', title: 'Generador de Reportes Contables en PDF/Excel', completed: false, priority: 'nice_to_have' }
        ],
        createdAt: '2026-08-01T10:00:00Z'
      },
      {
        id: 'proj_ai_assistant',
        userId: userId || 'demo_user',
        title: 'Sistema de Agentes IA & RAG Multi-Documento',
        description: 'Motor de Inteligencia Artificial Generativa para atención automatizada, lectura de contratos y búsqueda semántica empresarial.',
        category: 'AI & Machine Learning',
        phase: 'qa_testing',
        status: 'on_track',
        priority: 'high',
        progressPercentage: 88,
        budget: 4500,
        currency: 'USD',
        techStack: ['Python', 'LangChain', 'OpenAI', 'Pinecone', 'FastAPI', 'Next.js'],
        assignedLead: 'Ing. César Morán (AI Lead)',
        assignedTeam: [
          { name: 'César M.', role: 'AI Engineer' },
          { name: 'Mateo P.', role: 'MLOps Engineer' }
        ],
        startDate: '2026-08-10',
        targetDeliveryDate: '2026-09-28',
        liveUrl: 'https://ai-agents.dasfusion.com',
        deliverablesTotal: 5,
        deliverablesDone: 4,
        requirements: [
          { id: '1', title: 'Pipeline de Embeddings Vectoriales y Chunking', completed: true, priority: 'must_have' },
          { id: '2', title: 'Interfaz de Chat con Streaming de Tokens', completed: true, priority: 'must_have' },
          { id: '3', title: 'Filtro de Guardrails de Seguridad y Alucinaciones', completed: true, priority: 'must_have' },
          { id: '4', title: 'Auditoría de Respuestas y Logs de Latencia', completed: false, priority: 'must_have' }
        ],
        createdAt: '2026-08-10T14:30:00Z'
      },
      {
        id: 'proj_mobile_delivery',
        userId: userId || 'demo_user',
        title: 'App Móvil de Entregas & Tracking GPS en Vivo',
        description: 'Aplicación nativa para conductores y clientes con seguimiento en tiempo real sobre WebSockets y optimización de rutas.',
        category: 'Mobile App',
        phase: 'design',
        status: 'at_risk',
        priority: 'medium',
        progressPercentage: 40,
        budget: 3200,
        currency: 'USD',
        techStack: ['Flutter', 'Google Maps API', 'Firebase', 'NestJS'],
        assignedLead: 'Ing. César Morán',
        assignedTeam: [
          { name: 'César M.', role: 'Tech Lead' },
          { name: 'Gabriel S.', role: 'Mobile Dev' }
        ],
        startDate: '2026-09-01',
        targetDeliveryDate: '2026-11-10',
        deliverablesTotal: 6,
        deliverablesDone: 2,
        requirements: [
          { id: '1', title: 'Prototipo de UI/UX en Alta Fidelidad (Figma)', completed: true, priority: 'must_have' },
          { id: '2', title: 'Arquitectura de Notificaciones Push Geocercadas', completed: true, priority: 'must_have' },
          { id: '3', title: 'Implementación del SDK de Mapas y Rutas', completed: false, priority: 'must_have' },
          { id: '4', title: 'Pasarela de Pagos Móvil con Tokenización', completed: false, priority: 'must_have' }
        ],
        createdAt: '2026-09-01T09:15:00Z'
      },
      {
        id: 'proj_cloud_migration',
        userId: userId || 'demo_user',
        title: 'Modernización Cloud & Microservicios Kubernetes',
        description: 'Migración de arquitectura monolítica a clusters de Kubernetes autogestionados con pipelines CI/CD automatizados.',
        category: 'Cloud & DevOps',
        phase: 'discovery',
        status: 'on_track',
        priority: 'high',
        progressPercentage: 20,
        budget: 5200,
        currency: 'USD',
        techStack: ['Kubernetes', 'Terraform', 'GitHub Actions', 'Prometheus', 'Grafana'],
        assignedLead: 'Ing. César Morán',
        assignedTeam: [
          { name: 'César M.', role: 'DevOps Architect' }
        ],
        startDate: '2026-09-05',
        targetDeliveryDate: '2026-11-30',
        deliverablesTotal: 5,
        deliverablesDone: 1,
        requirements: [
          { id: '1', title: 'Levantamiento de infraestructura actual y dependencias', completed: true, priority: 'must_have' },
          { id: '2', title: 'Diseño de IaC con Terraform y políticas de seguridad', completed: false, priority: 'must_have' },
          { id: '3', title: 'Configuración de Cluster EKS/GKE con Ingress Controller', completed: false, priority: 'must_have' }
        ],
        createdAt: '2026-09-05T16:00:00Z'
      }
    ];
  }
}
