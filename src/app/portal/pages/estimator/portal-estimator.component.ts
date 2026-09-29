import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClientProjectService } from '../../../core/services/client-project.service';
import { ClientProject, ProjectCategory, ProjectPriority } from '../../../core/models/client-project.model';

export interface TechOption {
  name: string;
  category: 'frontend' | 'backend' | 'ai' | 'cloud' | 'mobile' | 'database';
}

@Component({
  selector: 'app-portal-estimator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './portal-estimator.component.html'
})
export class PortalEstimatorComponent {
  authService = inject(AuthService);
  projectService = inject(ClientProjectService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  createdProject = signal<ClientProject | null>(null);

  readonly destinationWhatsAppDigits = '593987148786';
  readonly destinationEmail = 'proyectos@dasfusion.ec';

  categories: { value: ProjectCategory; label: string; icon: string; desc: string }[] = [
    { value: 'AI & Machine Learning', label: 'AI & Machine Learning', icon: 'sparkles', desc: 'Agentes inteligentes, RAG, LLMs y modelos predictivos' },
    { value: 'Fullstack Web', label: 'Fullstack Web & Apps', icon: 'globe', desc: 'Plataformas web reactivas, portales y aplicaciones de alta escala' },
    { value: 'SaaS & Enterprise', label: 'SaaS & Software Enterprise', icon: 'building', desc: 'Sistemas multi-tenant, paneles de control y facturación' },
    { value: 'Mobile App', label: 'Mobile App (iOS / Android)', icon: 'mobile', desc: 'Aplicaciones nativas e híbridas de alto rendimiento' },
    { value: 'Cloud & DevOps', label: 'Cloud & Infraestructura', icon: 'cloud', desc: 'Arquitecturas serverless, microservicios y pipelines CI/CD' },
    { value: 'Automation & Bots', label: 'Automatización & BPM', icon: 'cpu', desc: 'Flujos automatizados, scraping y bots transaccionales' }
  ];

  priorities: { value: ProjectPriority; label: string; badgeClass: string }[] = [
    { value: 'low', label: 'Planificada (Baja)', badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
    { value: 'medium', label: 'Estándar (Media)', badgeClass: 'bg-tertiary/15 text-tertiary border-tertiary/30' },
    { value: 'high', label: 'Prioritaria (Alta)', badgeClass: 'bg-primary/15 text-primary border-primary/30' },
    { value: 'critical', label: 'Urgente (Crítica)', badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30' }
  ];

  popularTechs: TechOption[] = [
    { name: 'Angular 21', category: 'frontend' },
    { name: 'React / Next.js', category: 'frontend' },
    { name: 'TypeScript', category: 'frontend' },
    { name: 'Supabase PostgreSQL', category: 'database' },
    { name: 'Python / Gemini / LLMs', category: 'ai' },
    { name: 'Node.js / Express', category: 'backend' },
    { name: 'Flutter / Dart', category: 'mobile' },
    { name: 'Docker & Kubernetes', category: 'cloud' },
    { name: 'Tailwind CSS', category: 'frontend' },
    { name: 'OpenAI API', category: 'ai' },
    { name: 'GCP / Cloud Run', category: 'cloud' }
  ];

  selectedTechs = signal<string[]>(['Angular 21', 'TypeScript', 'Supabase PostgreSQL', 'Python / Gemini / LLMs']);
  customTechInput = signal<string>('');

  estimatorForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
    category: ['AI & Machine Learning', Validators.required],
    priority: ['high', Validators.required],
    budget: [2500, [Validators.required, Validators.min(500), Validators.max(50000)]],
    estimatedTimeline: ['1 a 2 Meses', Validators.required],
    targetDeliveryDate: [this.getDefaultTargetDate(45), Validators.required],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    requirements: this.fb.array([
      this.fb.control('Definición de arquitectura y diseño de base de datos relacional', Validators.required),
      this.fb.control('Implementación de autenticación segura y políticas de seguridad RLS', Validators.required),
      this.fb.control('Desarrollo de módulos funcionales y lógica de negocio', Validators.required),
      this.fb.control('Pruebas de calidad QA y despliegue continuo en producción', Validators.required)
    ])
  });

  get requirementsArray(): FormArray {
    return this.estimatorForm.get('requirements') as FormArray;
  }

  // Calculated estimates in real-time
  calculatedSprints = computed(() => {
    const budget = Number(this.estimatorForm.get('budget')?.value) || 2500;
    const reqCount = this.requirementsArray.length;
    if (budget < 1200) return 2;
    if (budget < 3500) return Math.max(2, Math.min(4, Math.ceil(reqCount / 2)));
    if (budget < 8000) return Math.max(4, Math.min(6, Math.ceil(reqCount / 1.5)));
    return Math.max(6, Math.ceil(reqCount / 1.2));
  });

  recommendedTeam = computed(() => {
    const category = this.estimatorForm.get('category')?.value;
    switch (category) {
      case 'AI & Machine Learning':
        return '1 Tech Lead + 1 AI Engineer + 1 Fullstack Dev + 1 QA';
      case 'Mobile App':
        return '1 Mobile Specialist (Flutter) + 1 Backend Dev + 1 UI/UX Designer';
      case 'SaaS & Enterprise':
        return '1 Solutions Architect + 2 Fullstack Devs + 1 QA Automation';
      default:
        return '1 Senior Fullstack Engineer + 1 Cloud Architect + 1 QA';
    }
  });

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

  private getDefaultTargetDate(daysAhead: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  }

  onTimelinePresetChange(preset: string) {
    this.estimatorForm.get('estimatedTimeline')?.setValue(preset);
    if (preset === '1 Mes') {
      this.estimatorForm.get('targetDeliveryDate')?.setValue(this.getDefaultTargetDate(30));
    } else if (preset === '1 a 2 Meses') {
      this.estimatorForm.get('targetDeliveryDate')?.setValue(this.getDefaultTargetDate(45));
    } else if (preset === '2 a 3 Meses') {
      this.estimatorForm.get('targetDeliveryDate')?.setValue(this.getDefaultTargetDate(75));
    } else {
      this.estimatorForm.get('targetDeliveryDate')?.setValue(this.getDefaultTargetDate(120));
    }
  }

  async onSubmit() {
    if (this.estimatorForm.invalid || this.isSubmitting()) {
      this.estimatorForm.markAllAsTouched();
      this.errorMessage.set('Por favor completa los campos requeridos con información válida.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const val = this.estimatorForm.value;

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
        title: val.title.trim(),
        description: val.description.trim(),
        category: val.category,
        priority: val.priority,
        budget: Number(val.budget),
        targetDeliveryDate: val.targetDeliveryDate,
        techStack: this.selectedTechs(),
        phase: 'discovery',
        status: 'on_track',
        progressPercentage: 15,
        deliverablesTotal: formattedReqs.length || 4,
        deliverablesDone: 0,
        requirements: formattedReqs
      });

      this.createdProject.set(newProj);
      this.isSuccess.set(true);
    } catch (err: any) {
      console.error('Error creating estimated project:', err);
      this.errorMessage.set('Ocurrió un error al guardar la cotización. Intenta nuevamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  getWhatsAppSummaryUrl(): string {
    const p = this.createdProject();
    if (!p) {
      return `https://wa.me/${this.destinationWhatsAppDigits}?text=${encodeURIComponent('Hola DASFusion, acabo de registrar una cotización en el portal.')}`;
    }

    const message = `🚀 *Nueva Cotización Registrada en Portal DASFusion*
👤 *Cliente:* ${this.authService.userFullName()} (${this.authService.currentUser()?.email})
📌 *Proyecto:* ${p.title}
🏷️ *Categoría:* ${p.category}
💰 *Presupuesto Estimado:* $${(p.budget || 0).toLocaleString()} USD
⏱️ *Fecha Objetivo:* ${p.targetDeliveryDate}
🛠️ *Stack Tecnológico:* ${p.techStack.join(', ')}
📝 *Requerimientos Clave (${p.requirements?.length || 0}):*
${p.requirements?.map((r, i) => ` ${i + 1}. ${r.title}`).join('\n') || 'Especificaciones en portal'}`;

    return `https://wa.me/${this.destinationWhatsAppDigits}?text=${encodeURIComponent(message)}`;
  }

  resetEstimator() {
    this.isSuccess.set(false);
    this.createdProject.set(null);
    this.estimatorForm.reset({
      title: '',
      category: 'AI & Machine Learning',
      priority: 'high',
      budget: 2500,
      estimatedTimeline: '1 a 2 Meses',
      targetDeliveryDate: this.getDefaultTargetDate(45),
      description: ''
    });
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
