import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Profile } from '../../../../core/models/database.types';

interface DeveloperDisplay {
  id: string;
  full_name: string;
  professional_title: string;
  bio: string;
  avatar_url?: string;
  skills: string[];
  github_url?: string;
  linkedin_url?: string;
  status: string;
}

@Component({
  selector: 'app-team-profiles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-profiles.component.html'
})
export class TeamProfilesComponent implements OnInit {
  private supabase = inject(SupabaseService);

  // Default initial team members representing DASFusion engineering leaders
  developers = signal<DeveloperDisplay[]>([
    {
      id: '1',
      full_name: 'César Augusto Solano',
      professional_title: 'Lead Software Architect & AI Engineer',
      bio: 'Especialista en desarrollo fullstack de alta escalabilidad, diseño de microservicios con Angular, Node.js y pipelines de orquestación con IA generativa.',
      skills: ['Angular', 'TypeScript', 'Supabase', 'Node.js', 'LLMs', 'PostgreSQL'],
      status: 'Lead Tech'
    },
    {
      id: '2',
      full_name: 'Diego Alejandro Mora',
      professional_title: 'Senior Cloud & Backend Specialist',
      bio: 'Experto en optimización de bases de datos PostgreSQL, APIs resilientes con FastAPI/Node y arquitectura de contenedores distribuida con Docker y Kubernetes.',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Redis'],
      status: 'Senior Dev'
    },
    {
      id: '3',
      full_name: 'Valentina Restrepo',
      professional_title: 'AI Data Scientist & Frontend Engineer',
      bio: 'Desarrolladora enfocada en interfaces interactivas de alta conversión, analítica predictiva y modelos de machine learning integrados en productos SaaS.',
      skills: ['Angular', 'TailwindCSS', 'PyTorch', 'DataViz', 'RxJS', 'UI/UX'],
      status: 'AI Specialist'
    }
  ]);

  async ngOnInit() {
    try {
      const { data } = await this.supabase.client.from('profiles').select('*');
      if (data && data.length > 0) {
        const loaded: DeveloperDisplay[] = data.map((p: Profile, idx: number) => ({
          id: p.id,
          full_name: p.full_name || 'Desarrollador DASFusion',
          professional_title: p.professional_title || 'Software Engineer',
          bio: p.bio || 'Ingeniero de software especializado en arquitecturas modernas.',
          avatar_url: p.avatar_url || undefined,
          skills: idx === 0 
            ? ['Angular', 'TypeScript', 'Supabase', 'PostgreSQL']
            : ['Python', 'Node.js', 'Docker', 'Cloud'],
          status: 'Activo'
        }));
        this.developers.set(loaded);
      }
    } catch {
      // Keep default team on fresh or offline db
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
