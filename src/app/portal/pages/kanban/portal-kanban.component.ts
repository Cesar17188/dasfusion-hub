import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClientProjectService } from '../../../core/services/client-project.service';
import { ClientProject, KanbanColumn, ProjectPhase } from '../../../core/models/client-project.model';
import { CreateProjectModalComponent } from '../../components/create-project-modal/create-project-modal.component';

@Component({
  selector: 'app-portal-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CreateProjectModalComponent],
  templateUrl: './portal-kanban.component.html'
})
export class PortalKanbanComponent {
  authService = inject(AuthService);
  projectService = inject(ClientProjectService);
  private router = inject(Router);

  isCreateModalOpen = signal(false);
  selectedProject = signal<ClientProject | null>(null);

  columns: KanbanColumn[] = [
    {
      id: 'discovery',
      title: '1. Descubrimiento & Specs',
      description: 'Levantamiento de arquitectura y requerimientos',
      badge: 'Fase 1',
      icon: 'search',
      colorClass: 'border-amber-500/40 text-amber-400 bg-amber-500/10'
    },
    {
      id: 'design',
      title: '2. Diseño UX/UI & Prototipos',
      description: 'Prototipado interactivo y flujos de usuario',
      badge: 'Fase 2',
      icon: 'palette',
      colorClass: 'border-purple-500/40 text-purple-400 bg-purple-500/10'
    },
    {
      id: 'development',
      title: '3. Desarrollo Activo',
      description: 'Codificación frontend, backend y base de datos',
      badge: 'Fase 3',
      icon: 'code',
      colorClass: 'border-primary/50 text-primary bg-primary/10'
    },
    {
      id: 'qa_testing',
      title: '4. Pruebas & QA',
      description: 'Testing de estrés, seguridad y validación',
      badge: 'Fase 4',
      icon: 'shield-check',
      colorClass: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
    },
    {
      id: 'delivered',
      title: '5. Despliegue & Entrega',
      description: 'Puesta en producción y entrega al cliente',
      badge: 'Fase 5',
      icon: 'check-circle',
      colorClass: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
    }
  ];

  phaseOrder: ProjectPhase[] = ['discovery', 'design', 'development', 'qa_testing', 'delivered'];

  getProjectsInPhase(phase: ProjectPhase): ClientProject[] {
    return this.projectService.filteredProjects().filter(p => p.phase === phase);
  }

  async movePhase(project: ClientProject, direction: 'prev' | 'next') {
    const currentIdx = this.phaseOrder.indexOf(project.phase);
    const targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;

    if (targetIdx >= 0 && targetIdx < this.phaseOrder.length) {
      const nextPhase = this.phaseOrder[targetIdx];
      await this.projectService.updateProjectPhase(project.id, nextPhase);
    }
  }

  canMovePrev(phase: ProjectPhase): boolean {
    return this.phaseOrder.indexOf(phase) > 0;
  }

  canMoveNext(phase: ProjectPhase): boolean {
    return this.phaseOrder.indexOf(phase) < this.phaseOrder.length - 1;
  }

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  selectProject(p: ClientProject) {
    this.selectedProject.set(p);
  }

  closeDetails() {
    this.selectedProject.set(null);
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
