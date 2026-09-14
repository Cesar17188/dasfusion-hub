import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClientProjectService } from '../../../core/services/client-project.service';
import { ClientProject, ProjectCategory, ProjectPhase, ProjectStatus } from '../../../core/models/client-project.model';
import { CreateProjectModalComponent } from '../../components/create-project-modal/create-project-modal.component';

@Component({
  selector: 'app-portal-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CreateProjectModalComponent],
  templateUrl: './portal-projects.component.html'
})
export class PortalProjectsComponent {
  authService = inject(AuthService);
  projectService = inject(ClientProjectService);
  private router = inject(Router);

  isCreateModalOpen = signal(false);
  selectedProject = signal<ClientProject | null>(null);

  categories: { value: string; label: string }[] = [
    { value: 'all', label: 'Todas las Categorías' },
    { value: 'Fullstack Web', label: 'Fullstack Web' },
    { value: 'Mobile App', label: 'Mobile App' },
    { value: 'AI & Machine Learning', label: 'AI & ML' },
    { value: 'Cloud & DevOps', label: 'Cloud & DevOps' },
    { value: 'SaaS & Enterprise', label: 'SaaS & Enterprise' },
    { value: 'Automation & Bots', label: 'Automation & Bots' }
  ];

  phases: { value: string; label: string }[] = [
    { value: 'all', label: 'Todas las Fases' },
    { value: 'discovery', label: 'Descubrimiento' },
    { value: 'design', label: 'Diseño' },
    { value: 'development', label: 'Desarrollo' },
    { value: 'qa_testing', label: 'Pruebas QA' },
    { value: 'delivered', label: 'Entregado' }
  ];

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  selectProject(project: ClientProject) {
    this.selectedProject.set(project);
  }

  closeDetails() {
    this.selectedProject.set(null);
  }

  toggleRequirement(projectId: string, reqId: string) {
    this.projectService.toggleRequirement(projectId, reqId);
    // Refresh selected project reference if currently viewed
    const updated = this.projectService.projects().find(p => p.id === projectId);
    if (updated) {
      this.selectedProject.set(updated);
    }
  }

  async deleteProject(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto del portal?')) {
      await this.projectService.deleteProject(id);
      this.closeDetails();
    }
  }

  getPhaseName(phase: ProjectPhase): string {
    switch (phase) {
      case 'discovery': return 'Descubrimiento';
      case 'design': return 'Diseño UI/UX';
      case 'development': return 'En Desarrollo';
      case 'qa_testing': return 'Control QA';
      case 'delivered': return 'Completado';
    }
  }

  getStatusClass(status: ProjectStatus): string {
    switch (status) {
      case 'on_track': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'at_risk': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'delayed': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'completed': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
