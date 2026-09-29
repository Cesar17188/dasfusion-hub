import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { QuoteService } from '../../../core/services/quote.service';
import { ClientProject, ProjectCategory } from '../../../core/models/client-project.model';

@Component({
  selector: 'app-portal-estimator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './portal-estimator.component.html'
})
export class PortalEstimatorComponent {
  authService = inject(AuthService);
  private quoteService = inject(QuoteService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  createdProject = signal<ClientProject | null>(null);
  whatsappUrl = signal<string>('');

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

  estimatorForm: FormGroup = this.fb.group({
    category: ['AI & Machine Learning', Validators.required],
    title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(3000)]]
  });

  async onSubmit() {
    if (this.estimatorForm.invalid || this.isSubmitting()) {
      this.estimatorForm.markAllAsTouched();
      this.errorMessage.set('Por favor completa los campos requeridos con información válida.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const val = this.estimatorForm.value;

    try {
      const result = await this.quoteService.submitQuote({
        category: val.category,
        title: val.title,
        description: val.description
      });

      this.createdProject.set(result.project);
      this.whatsappUrl.set(result.whatsappUrl);
      this.isSuccess.set(true);

      // Abrir automáticamente el chat de WhatsApp con el mensaje estructurado
      if (typeof window !== 'undefined' && result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Error creating estimated project:', err);
      this.errorMessage.set('Ocurrió un error al guardar la cotización. Intenta nuevamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  getWhatsAppSummaryUrl(): string {
    return this.whatsappUrl() || `https://wa.me/${this.destinationWhatsAppDigits}`;
  }

  resetEstimator() {
    this.isSuccess.set(false);
    this.createdProject.set(null);
    this.whatsappUrl.set('');
    this.estimatorForm.reset({
      category: 'AI & Machine Learning',
      title: '',
      description: ''
    });
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}

