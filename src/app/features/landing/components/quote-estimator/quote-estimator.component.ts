import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

export interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
}

export interface EstimatorFeature {
  icon: string;
  title: string;
  description: string;
  tag: string;
}

@Component({
  selector: 'app-quote-estimator',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quote-estimator.component.html'
})
export class QuoteEstimatorComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isGoogleLoading = signal(false);
  errorMessage = signal<string | null>(null);

  readonly destinationEmail = 'proyectos@dasfusion.ec';
  readonly destinationWhatsAppDigits = '593987148786';

  semanticTriples: SemanticTriple[] = [
    {
      subject: 'Portal de Clientes DASFusion',
      predicate: 'integra y procesa',
      object: 'Cotizador Inteligente con Arquitectura de Software y Presupuesto en Vivo'
    },
    {
      subject: 'DASFusion Technologies',
      predicate: 'garantiza a usuarios registrados',
      object: 'Acuerdo de Confidencialidad NDA y Seguimiento de Sprints'
    },
    {
      subject: 'Estimador de Ingeniería',
      predicate: 'calcula en tiempo real',
      object: 'Tiempos de Entrega, Stacks y Costos de Desarrollo'
    }
  ];

  portalBenefits: EstimatorFeature[] = [
    {
      icon: 'calculator',
      title: 'Estimación Inteligente con IA',
      description: 'Calcula alcances técnicos, requerimientos por módulos y presupuesto preliminar en tiempo real según el stack elegido.',
      tag: 'Tiempo Real'
    },
    {
      icon: 'shield',
      title: 'Protección NDA Automática',
      description: 'Tu propiedad intelectual, especificaciones y modelos de negocio quedan 100% blindados bajo contrato de confidencialidad.',
      tag: 'Legal & RLS'
    },
    {
      icon: 'kanban',
      title: 'Tablero Kanban & Sprints',
      description: 'Monitorea cada fase de tu proyecto: Descubrimiento, Diseño UI/UX, Desarrollo de Software y Control de Calidad QA.',
      tag: 'Transparencia'
    },
    {
      icon: 'team',
      title: 'Arquitectos de Software Asignados',
      description: 'Revisión directa de tus especificaciones técnicas por ingenieros senior para afinar el roadmap de tu solución.',
      tag: 'SLA < 24h'
    }
  ];

  onboardingSteps = [
    {
      number: '01',
      title: 'Crea tu Cuenta de Cliente',
      desc: 'Regístrate en menos de 30 segundos con Google o correo electrónico corporativo/personal sin costo alguno.'
    },
    {
      number: '02',
      title: 'Accede al Estimador Interactivo',
      desc: 'Selecciona tipo de proyecto (Web, Mobile, IA, SaaS, Cloud), tecnologías deseadas y describe tus requerimientos.'
    },
    {
      number: '03',
      title: 'Obtén tu Propuesta & Inicia',
      desc: 'Recibe estimación de sprints, desglose presupuestal y activa tu proyecto directamente en el tablero Kanban.'
    }
  ];

  async onGoogleSignup() {
    this.isGoogleLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign In Error from Landing:', err);
      this.errorMessage.set('No se pudo conectar con Google. Por favor intenta registrarte con tu correo.');
    } finally {
      this.isGoogleLoading.set(false);
    }
  }

  getWhatsAppSupportUrl(): string {
    const text = encodeURIComponent('Hola equipo DASFusion, deseo recibir asesoría previa para registrarme y cotizar mi proyecto de desarrollo.');
    return `https://wa.me/${this.destinationWhatsAppDigits}?text=${text}`;
  }
}
