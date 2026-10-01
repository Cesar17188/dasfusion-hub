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
      title: 'Estimación Clara y Transparente',
      description: 'Calcula alcances, requerimientos y obtén un presupuesto preliminar estructurado para tu proyecto.',
      tag: 'Tiempo Real'
    },
    {
      icon: 'shield',
      title: 'Confidencialidad Garantizada (NDA)',
      description: 'Tu idea de negocio, especificaciones e información quedan 100% protegidas bajo contrato de confidencialidad.',
      tag: 'Seguridad'
    },
    {
      icon: 'kanban',
      title: 'Seguimiento Paso a Paso',
      description: 'Monitorea en vivo cada avance de tu proyecto: Planificación, Diseño visual, Construcción y Pruebas finales.',
      tag: 'Transparencia'
    },
    {
      icon: 'team',
      title: 'Especialistas Asignados a tu Proyecto',
      description: 'Asesoría y revisión directa por ingenieros especializados para guiarte en cada etapa de tu solución digital.',
      tag: 'Respuesta < 24h'
    }
  ];

  onboardingSteps = [
    {
      number: '01',
      title: 'Crea tu Cuenta de Cliente',
      desc: 'Regístrate en menos de 30 segundos con Google o tu correo electrónico sin costo alguno.'
    },
    {
      number: '02',
      title: 'Cuéntanos qué necesitas',
      desc: 'Selecciona si buscas una página web, app móvil, sistema de gestión o automatización y cuéntanos tu idea.'
    },
    {
      number: '03',
      title: 'Recibe tu Plan e Inicia',
      desc: 'Revisamos tu solicitud, te entregamos los tiempos de entrega y damos inicio directo a tu proyecto.'
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
