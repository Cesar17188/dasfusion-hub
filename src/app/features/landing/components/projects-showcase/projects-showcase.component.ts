import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Project } from '../../../../core/models/database.types';

export interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
}

export interface ProjectDisplay {
  id: string;
  title: string;
  description: string;
  category: string;
  queryIntent: string;
  tripleLabel: string;
  semanticTriple: SemanticTriple;
  tech_stack: string[];
  live_url?: string;
  metrics: string;
  metricsLabel: string;
}

@Component({
  selector: 'app-projects-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-showcase.component.html'
})
export class ProjectsShowcaseComponent implements OnInit {
  private supabase = inject(SupabaseService);

  projects = signal<ProjectDisplay[]>([
    {
      id: '1',
      title: 'DASFusion Agent Hub',
      category: 'Enterprise AI & Automation',
      queryIntent: '¿Cómo orquestar múltiples agentes de IA y automatizar flujos de trabajo empresariales complejos?',
      tripleLabel: 'Orquestación de Agentes IA',
      semanticTriple: {
        subject: 'DASFusion Agent Hub',
        predicate: 'orquesta e integra',
        object: 'Flujos Autónomos de IA Empresarial'
      },
      description: 'Plataforma multi-agente para orquestación de flujos empresariales, integración de LLMs y automatización de análisis de datos.',
      tech_stack: ['Angular', 'TypeScript', 'Supabase', 'Python', 'FastAPI'],
      metricsLabel: 'Eficiencia Operativa',
      metrics: '70% Ahorro Operativo'
    },
    {
      id: '2',
      title: 'Vida Pequeña',
      category: 'Real-Time Data Collection & Processing',
      queryIntent: '¿Cómo recopilar y procesar telemetría y datos de mercado en tiempo real con control de tiempo?',
      tripleLabel: 'Ingesta & Procesamiento de Datos',
      semanticTriple: {
        subject: 'Plataforma Vida Pequeña',
        predicate: 'recopila y procesa',
        object: 'Telemetría y Análisis en Tiempo Real'
      },
      description: 'App de recopilación y análisis de datos en tiempo real con control de tiempo.',
      tech_stack: ['Node.js', 'PostgreSQL', 'Angular', 'Tailwind', 'FastAPI'],
      metricsLabel: 'Rendimiento Comercial',
      metrics: '+150% Ingresos Exitosos & Análisis en Tiempo Real'
    },
    {
      id: '3',
      title: 'OmniLogistics Fleet Brain',
      category: 'Smart Logistics & IoT',
      queryIntent: '¿Cómo optimizar rutas de distribución y telemetría de flotas con predicción inteligente?',
      tripleLabel: 'Telemetría & Optimización Logística',
      semanticTriple: {
        subject: 'OmniLogistics Fleet Brain',
        predicate: 'monitorea y optimiza',
        object: 'Rutas y Telemetría de Flotas'
      },
      description: 'Sistema centralizado de telemetría, asignación inteligente de cargas y optimización predictiva de rutas de distribución.',
      tech_stack: ['Angular SSR', 'PostgreSQL', 'Python', 'WebSockets'],
      metricsLabel: 'Ahorro de Flota',
      metrics: '-28% Consumo Combustible'
    }
  ]);

  async ngOnInit() {
    try {
      const data = await this.supabase.getProjects();
      if (data && data.length > 0) {
        // Keep baseline curated high-performance showcases
      }
    } catch {
      // Keep default projects
    }
  }
}
