import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Project } from '../../../../core/models/database.types';

interface ProjectDisplay {
  id: string;
  title: string;
  description: string;
  category: string;
  tech_stack: string[];
  live_url?: string;
  metrics: string;
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
      description: 'Plataforma multi-agente para orquestación de flujos empresariales, integración de LLMs y automatización de análisis de datos.',
      tech_stack: ['Angular', 'TypeScript', 'Supabase', 'Python', 'FastAPI'],
      metrics: '70% Ahorro Operativo'
    },
    {
      id: '2',
      title: 'FinCore Real-Time Ledger',
      category: 'FinTech Platform',
      description: 'Motor de conciliación bancaria y procesamiento de transacciones financieras masivas con arquitectura distribuida.',
      tech_stack: ['Node.js', 'PostgreSQL', 'Docker', 'Redis', 'Tailwind'],
      metrics: '+2.5M Transacciones/día'
    },
    {
      id: '3',
      title: 'OmniLogistics Fleet Brain',
      category: 'Smart Logistics & IoT',
      description: 'Sistema centralizado de telemetría, asignación inteligente de cargas y optimización predictiva de rutas de distribución.',
      tech_stack: ['Angular SSR', 'PostgreSQL', 'Python', 'WebSockets'],
      metrics: '-28% Consumo Combustible'
    }
  ]);

  async ngOnInit() {
    try {
      const data = await this.supabase.getProjects();
      if (data && data.length > 0) {
        const loaded: ProjectDisplay[] = data.map((p: Project) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          category: 'Software Engineering',
          tech_stack: p.tech_stack || ['TypeScript', 'Cloud'],
          live_url: p.live_url || undefined,
          metrics: 'Alta Disponibilidad'
        }));
        this.projects.set(loaded);
      }
    } catch {
      // Keep default projects
    }
  }
}
