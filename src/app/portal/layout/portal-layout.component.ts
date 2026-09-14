import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CreateProjectModalComponent } from '../components/create-project-modal/create-project-modal.component';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CreateProjectModalComponent],
  templateUrl: './portal-layout.component.html'
})
export class PortalLayoutComponent {
  isCreateModalOpen = signal(false);

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }
}
