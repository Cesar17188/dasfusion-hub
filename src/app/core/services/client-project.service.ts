import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { 
  ClientProject, 
  ProjectPhase, 
  ProjectStatus, 
  PortalMetrics, 
  ProjectCategory,
  ProjectPriority
} from '../models/client-project.model';
import { ProjectUpdate, ProjectInsert } from '../models/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

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

  private realtimeChannel: RealtimeChannel | null = null;

  constructor() {
    this.purgeLegacyMockStorage();
    
    // Auto-reload projects when user authentication state changes
    effect(() => {
      const user = this.authService.currentUser();
      this.loadProjects();
    });

    this.setupRealtimeSubscription();
  }

  /**
   * Elimina cualquier almacenamiento local antiguo con datos quemados / mockeados
   */
  private purgeLegacyMockStorage() {
    if (typeof window === 'undefined') return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('dasfusion_client_projects_') || key.startsWith('df_crm_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Could not purge legacy storage:', e);
    }
  }

  /**
   * Configura la suscripción en tiempo real con Supabase
   */
  private setupRealtimeSubscription() {
    try {
      if (this.realtimeChannel) {
        this.supabaseService.client.removeChannel(this.realtimeChannel);
      }

      this.realtimeChannel = this.supabaseService.client
        .channel('public-projects-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'projects' },
          () => {
            this.loadProjects();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription setup warning:', err);
    }
  }

  /**
   * Métricas calculadas en tiempo real para el Dashboard a partir de los datos reales de la BD
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
        (p.techStack && p.techStack.some(t => t.toLowerCase().includes(query)));

      const matchCat = cat === 'all' || p.category === cat;
      const matchPhase = phase === 'all' || p.phase === phase;
      const matchStatus = status === 'all' || p.status === status;

      return matchQuery && matchCat && matchPhase && matchStatus;
    });
  });

  /**
   * Cargar proyectos directamente desde la base de datos Supabase
   */
  async loadProjects(): Promise<ClientProject[]> {
    this.isLoading.set(true);
    const user = this.authService.currentUser();

    try {
      let query = this.supabaseService.client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Si el usuario está autenticado, traer sus proyectos correspondientes
      if (user?.id) {
        query = query.or(`user_id.eq.${user.id},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects from Supabase:', error.message);
        this.projects.set([]);
        return [];
      }

      const mapped = (data || []).map(item => this.mapSupabaseToClientProject(item));
      this.projects.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Unexpected error loading projects from Supabase:', err);
      this.projects.set([]);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Crear un nuevo proyecto en la base de datos Supabase
   */
  async createProject(projectData: Partial<ClientProject>): Promise<ClientProject> {
    this.isLoading.set(true);
    const user = this.authService.currentUser();

    const techStack = projectData.techStack && projectData.techStack.length > 0 
      ? projectData.techStack 
      : ['Angular', 'TypeScript', 'Supabase'];

    const dbPayload = {
      user_id: user?.id || null,
      title: projectData.title || 'Nuevo Proyecto de Ingeniería',
      description: projectData.description || '',
      tech_stack: techStack,
      live_url: projectData.liveUrl || null,
      status: projectData.phase || 'discovery',
      priority: projectData.priority || 'high',
      budget: projectData.budget ?? 0,
      progress_percentage: projectData.progressPercentage ?? 10,
      start_date: projectData.startDate || new Date().toISOString().split('T')[0],
      target_delivery_date: projectData.targetDeliveryDate || this.getFutureDate(45)
    };

    try {
      const { data, error } = await this.supabaseService.client
        .from('projects')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const created = this.mapSupabaseToClientProject(data);
      this.projects.update(current => [created, ...current]);
      return created;
    } catch (err) {
      console.error('Error creating project in Supabase:', err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cambiar de fase en el tablero Kanban y persistir en Supabase
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

    // Actualizar estado local reactivo inmediatamente
    const nextList = [...list];
    nextList[index] = updated;
    this.projects.set(nextList);

    // Persistir en Supabase
    try {
      const { error } = await this.supabaseService.client
        .from('projects')
        .update({
          status: newPhase,
          progress_percentage: autoProgress
        })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating project phase in Supabase:', error.message);
      }
    } catch (e) {
      console.error('Database phase update error:', e);
    }
  }

  /**
   * Actualizar campos generales de un proyecto en Supabase
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

    if (this.selectedProject()?.id === projectId) {
      this.selectedProject.set(updated);
    }

    // Persistir en Supabase
    try {
      const dbUpdates: ProjectUpdate = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.techStack !== undefined) dbUpdates.tech_stack = updates.techStack;
      if (updates.liveUrl !== undefined) dbUpdates.live_url = updates.liveUrl;
      if (updates.phase !== undefined) dbUpdates.status = updates.phase;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
      if (updates.progressPercentage !== undefined) dbUpdates.progress_percentage = updates.progressPercentage;
      if (updates.targetDeliveryDate !== undefined) dbUpdates.target_delivery_date = updates.targetDeliveryDate;

      const { error } = await this.supabaseService.client
        .from('projects')
        .update(dbUpdates)
        .eq('id', projectId);

      if (error) {
        console.error('Error updating project in Supabase:', error.message);
      }
    } catch (e) {
      console.error('Database update error:', e);
    }
  }

  /**
   * Eliminar un proyecto de la base de datos Supabase
   */
  async deleteProject(projectId: string): Promise<void> {
    // Actualizar estado local reactivo
    const nextList = this.projects().filter(p => p.id !== projectId);
    this.projects.set(nextList);

    if (this.selectedProject()?.id === projectId) {
      this.selectedProject.set(null);
    }

    // Eliminar de Supabase
    try {
      const { error } = await this.supabaseService.client
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project from Supabase:', error.message);
      }
    } catch (e) {
      console.error('Remote deletion error:', e);
    }
  }

  /**
   * Alternar estado de cumplimiento de requerimiento e impactar progreso en la base de datos
   */
  async toggleRequirement(projectId: string, requirementId: string) {
    const project = this.projects().find(p => p.id === projectId);
    if (!project || !project.requirements) return;

    const updatedReqs = project.requirements.map(req => 
      req.id === requirementId ? { ...req, completed: !req.completed } : req
    );

    const completedCount = updatedReqs.filter(r => r.completed).length;
    const progress = Math.round((completedCount / updatedReqs.length) * 100);

    await this.updateProject(projectId, {
      requirements: updatedReqs,
      deliverablesDone: completedCount,
      progressPercentage: progress
    });
  }

  // --- Helpers de Mapeo y Formato ---

  private mapSupabaseToClientProject(sbItem: any): ClientProject {
    const phase = this.mapStatusToPhase(sbItem.status);
    const progress = sbItem.progress_percentage ?? this.getDefaultProgressForPhase(phase);
    const category = this.inferCategory(sbItem.title, sbItem.description, sbItem.tech_stack);
    const techStack = Array.isArray(sbItem.tech_stack) 
      ? sbItem.tech_stack 
      : (sbItem.tech_stack ? [sbItem.tech_stack] : ['Angular', 'TypeScript', 'Supabase']);

    const totalDeliverables = 5;
    const deliverablesDone = Math.max(0, Math.min(totalDeliverables, Math.round((progress / 100) * totalDeliverables)));

    return {
      id: sbItem.id,
      userId: sbItem.user_id,
      title: sbItem.title || 'Proyecto DASFusion',
      description: sbItem.description || '',
      category,
      phase,
      status: this.mapStatusHealth(sbItem.status, progress),
      priority: (sbItem.priority as ProjectPriority) || 'high',
      progressPercentage: progress,
      budget: sbItem.budget ?? 0,
      currency: 'USD',
      techStack,
      assignedLead: 'Ing. César Morán (Tech Lead)',
      assignedTeam: [
        { name: 'César M.', role: 'Lead Architect & AI Engineer' },
        { name: 'Equipo DASFusion', role: 'Fullstack & Cloud Engineering' }
      ],
      startDate: sbItem.start_date || (sbItem.created_at ? sbItem.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
      targetDeliveryDate: sbItem.target_delivery_date || this.getFutureDate(30),
      deliverablesTotal: totalDeliverables,
      deliverablesDone,
      requirements: [
        { id: '1', title: 'Definición de arquitectura y modelo de datos', completed: progress >= 25, priority: 'must_have' },
        { id: '2', title: 'Diseño UX/UI interactivo y prototipos', completed: progress >= 50, priority: 'must_have' },
        { id: '3', title: 'Implementación del Backend, Base de Datos y APIs', completed: progress >= 75, priority: 'must_have' },
        { id: '4', title: 'Pruebas de estrés, seguridad y control QA', completed: progress >= 90, priority: 'must_have' },
        { id: '5', title: 'Despliegue final en producción y entrega', completed: progress === 100, priority: 'nice_to_have' }
      ],
      liveUrl: sbItem.live_url || '',
      createdAt: sbItem.created_at || new Date().toISOString()
    };
  }

  private mapStatusToPhase(status?: string | null): ProjectPhase {
    if (!status) return 'discovery';
    const s = status.toLowerCase();
    if (s === 'discovery' || s === 'lead' || s === 'architecture') return 'discovery';
    if (s === 'design') return 'design';
    if (s === 'development') return 'development';
    if (s === 'qa_testing' || s === 'testing') return 'qa_testing';
    if (s === 'delivered' || s === 'completed' || s === 'delivery') return 'delivered';
    return 'development';
  }

  private mapStatusHealth(status?: string | null, progress: number = 0): ProjectStatus {
    if (status === 'completed' || status === 'delivered' || progress === 100) return 'completed';
    if (status === 'at_risk') return 'at_risk';
    if (status === 'delayed') return 'delayed';
    if (status === 'paused') return 'paused';
    return 'on_track';
  }

  private getDefaultProgressForPhase(phase: ProjectPhase): number {
    switch (phase) {
      case 'discovery': return 15;
      case 'design': return 35;
      case 'development': return 65;
      case 'qa_testing': return 85;
      case 'delivered': return 100;
    }
  }

  private inferCategory(title: string, desc: string, techs?: string[]): ProjectCategory {
    const text = `${title} ${desc} ${(techs || []).join(' ')}`.toLowerCase();
    if (text.includes('ai') || text.includes('inteligencia') || text.includes('llm') || text.includes('gpt') || text.includes('python')) {
      return 'AI & Machine Learning';
    }
    if (text.includes('mobile') || text.includes('móvil') || text.includes('flutter') || text.includes('react native') || text.includes('app')) {
      return 'Mobile App';
    }
    if (text.includes('cloud') || text.includes('devops') || text.includes('aws') || text.includes('kubernetes') || text.includes('docker')) {
      return 'Cloud & DevOps';
    }
    if (text.includes('erp') || text.includes('saas') || text.includes('enterprise') || text.includes('facturacion') || text.includes('facturación')) {
      return 'SaaS & Enterprise';
    }
    if (text.includes('bot') || text.includes('scrap') || text.includes('automatiz')) {
      return 'Automation & Bots';
    }
    return 'Fullstack Web';
  }

  private getFutureDate(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  }
}
