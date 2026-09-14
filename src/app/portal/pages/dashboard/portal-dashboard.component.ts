import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClientProjectService } from '../../../core/services/client-project.service';
import { ClientProject, ProjectPhase } from '../../../core/models/client-project.model';
import { CreateProjectModalComponent } from '../../components/create-project-modal/create-project-modal.component';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CreateProjectModalComponent],
  templateUrl: './portal-dashboard.component.html'
})
export class PortalDashboardComponent {
  authService = inject(AuthService);
  projectService = inject(ClientProjectService);
  private router = inject(Router);

  isCreateModalOpen = signal(false);
  selectedProjectForDetails = signal<ClientProject | null>(null);

  getPhaseBadge(phase: ProjectPhase): { label: string; bg: string; text: string; border: string } {
    switch (phase) {
      case 'discovery':
        return { label: 'Descubrimiento & Specs', bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' };
      case 'design':
        return { label: 'Diseño UX/UI', bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30' };
      case 'development':
        return { label: 'En Desarrollo Activo', bg: 'bg-primary/15', text: 'text-primary', border: 'border-primary/40' };
      case 'qa_testing':
        return { label: 'Control de Calidad QA', bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30' };
      case 'delivered':
        return { label: 'Completado & En Vivo', bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' };
    }
  }

  getStatusBadge(status: string): { label: string; dot: string; text: string } {
    switch (status) {
      case 'on_track':
        return { label: 'A Tiempo / On Track', dot: 'bg-emerald-400', text: 'text-emerald-400' };
      case 'at_risk':
        return { label: 'En Riesgo de Plazo', dot: 'bg-amber-400', text: 'text-amber-400' };
      case 'delayed':
        return { label: 'Retrasado', dot: 'bg-rose-400', text: 'text-rose-400' };
      case 'completed':
        return { label: 'Finalizado', dot: 'bg-cyan-400', text: 'text-cyan-400' };
      default:
        return { label: 'En Pausa', dot: 'bg-slate-400', text: 'text-slate-400' };
    }
  }

  getDaysRemaining(targetDate: string): string {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Plazo concluido';
    if (diff === 0) return 'Entrega hoy';
    return `${diff} días restantes`;
  }

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  viewDetails(project: ClientProject) {
    this.selectedProjectForDetails.set(project);
  }

  closeDetails() {
    this.selectedProjectForDetails.set(null);
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
