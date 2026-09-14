import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ClientProjectService } from '../../../core/services/client-project.service';
import { ClientProject, ProjectCategory, ProjectPriority } from '../../../core/models/client-project.model';

@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-project-modal.component.html'
})
export class CreateProjectModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<ClientProject>();

  private fb = inject(FormBuilder);
  private projectService = inject(ClientProjectService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  availableCategories: ProjectCategory[] = [
    'Fullstack Web',
    'Mobile App',
    'AI & Machine Learning',
    'Cloud & DevOps',
    'SaaS & Enterprise',
    'Automation & Bots'
  ];

  availablePriorities: { value: ProjectPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Baja', color: 'text-outline' },
    { value: 'medium', label: 'Media', color: 'text-tertiary' },
    { value: 'high', label: 'Alta', color: 'text-primary' },
    { value: 'critical', label: 'Crítica / Urgente', color: 'text-error' }
  ];

  popularTechs = [
    'Angular 21', 'React / Next.js', 'TypeScript', 'Supabase', 'Python / AI',
    'Node.js', 'PostgreSQL', 'Flutter', 'Docker & K8s', 'OpenAI / LLMs', 'Tailwind CSS'
  ];

  selectedTechs = signal<string[]>(['Angular 21', 'TypeScript', 'Supabase']);
  customTechInput = signal<string>('');

  projectForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(4)]],
    description: ['', [Validators.required, Validators.minLength(15)]],
    category: ['Fullstack Web', Validators.required],
    priority: ['high', Validators.required],
    budget: [3000, [Validators.required, Validators.min(500)]],
    targetDeliveryDate: [this.getDefaultTargetDate(), Validators.required],
    liveUrl: [''],
    requirements: this.fb.array([
      this.fb.control('Definición de arquitectura y esquema de base de datos', Validators.required),
      this.fb.control('Desarrollo de módulos principales y lógica de negocio', Validators.required),
      this.fb.control('Pruebas de calidad y despliegue en servidor de producción', Validators.required)
    ])
  });

  get requirementsArray(): FormArray {
    return this.projectForm.get('requirements') as FormArray;
  }

  addRequirement() {
    this.requirementsArray.push(this.fb.control('', Validators.required));
  }

  removeRequirement(index: number) {
    if (this.requirementsArray.length > 1) {
      this.requirementsArray.removeAt(index);
    }
  }

  toggleTech(tech: string) {
    this.selectedTechs.update(current => {
      if (current.includes(tech)) {
        return current.filter(t => t !== tech);
      } else {
        return [...current, tech];
      }
    });
  }

  addCustomTech() {
    const val = this.customTechInput().trim();
    if (val && !this.selectedTechs().includes(val)) {
      this.selectedTechs.update(c => [...c, val]);
      this.customTechInput.set('');
    }
  }

  removeCustomTech(tech: string) {
    this.selectedTechs.update(c => c.filter(t => t !== tech));
  }

  private getDefaultTargetDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 40);
    return d.toISOString().split('T')[0];
  }

  async onSubmit() {
    if (this.projectForm.invalid || this.isSubmitting()) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const val = this.projectForm.value;

    const formattedReqs = val.requirements
      .filter((r: string) => !!r && r.trim().length > 0)
      .map((r: string, idx: number) => ({
        id: (idx + 1).toString(),
        title: r.trim(),
        completed: false,
        priority: 'must_have' as const
      }));

    try {
      const newProj = await this.projectService.createProject({
        title: val.title,
        description: val.description,
        category: val.category,
        priority: val.priority,
        budget: Number(val.budget),
        targetDeliveryDate: val.targetDeliveryDate,
        liveUrl: val.liveUrl || undefined,
        techStack: this.selectedTechs(),
        phase: 'discovery',
        status: 'on_track',
        progressPercentage: 15,
        deliverablesTotal: formattedReqs.length || 4,
        deliverablesDone: 0,
        requirements: formattedReqs
      });

      this.created.emit(newProj);
      this.closeModal();
    } catch (err: any) {
      console.error('Error creating project:', err);
      this.errorMessage.set('Ocurrió un error al registrar el proyecto. Intenta nuevamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  closeModal() {
    this.close.emit();
  }
}
