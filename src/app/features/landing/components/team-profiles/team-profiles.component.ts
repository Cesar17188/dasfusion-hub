import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Profile } from '../../../../core/models/database.types';

export interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
}

export interface DeveloperDisplay {
  id: string;
  full_name: string;
  professional_title: string;
  titles?: string[];
  roleTag: string;
  queryIntent: string;
  tripleLabel: string;
  semanticTriple: SemanticTriple;
  bio: string;
  specialization: string;
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

  // Initial engineering leadership team members
  developers = signal<DeveloperDisplay[]>([
    {
      id: '1',
      full_name: 'César Armendariz',
      professional_title: 'Desarrollador Full Stack | Data Science | MBA',
      titles: ['Desarrollador Full Stack', 'Data Science', 'MBA'],
      roleTag: 'Lead Tech & AI Engineer',
      queryIntent: '¿Quién lidera la arquitectura Full Stack, ciencia de datos y orquestación con IA en DASFusion?',
      tripleLabel: 'Ingeniería Full Stack & AI Ops',
      semanticTriple: {
        subject: 'César Armendariz',
        predicate: 'diseña y despliega',
        object: 'Arquitecturas Escalables & Pipelines IA'
      },
      bio: 'Desarrollador Full Stack de alta escalabilidad, diseño de microservicios y pipelines de orquestación con IA.',
      specialization: 'Arquitecturas Cloud Escalables, Machine Learning, Microservicios y Dirección Estratégica MBA.',
      skills: ['Full Stack', 'Data Science', 'MBA', 'Microservicios', 'Pipelines IA', 'Angular', 'Node.js', 'PostgreSQL'],
      status: 'Dev, AI Specialist'
    },
    {
      id: '2',
      full_name: 'Omar Santillan',
      professional_title: 'Desarrollador Full Stack | BPM, BPMN Specialist | System Engineer',
      titles: ['Desarrollador Full Stack', 'BPM, BPMN Specialist', 'System Engineer'],
      roleTag: 'BPM & Backend Specialist',
      queryIntent: '¿Quién lidera la reingeniería de procesos BPM, diagramas BPMN y arquitectura backend en DASFusion?',
      tripleLabel: 'Ingeniería de Procesos BPM & Backend',
      semanticTriple: {
        subject: 'Omar Santillan',
        predicate: 'modela y automatiza',
        object: 'Flujos BPMN 2.0 & APIs Backend'
      },
      bio: 'Desarrollador backend , diseño de procesos y diagramas BPMN para automatización.',
      specialization: 'Modelado y Reingeniería BPMN 2.0, Orquestación de Flujos de Negocio, APIs y Automatización.',
      skills: ['Backend', 'BPM / BPMN 2.0', 'System Engineer', 'Automatización', 'APIs', 'Workflows', 'FastAPI', 'PostgreSQL'],
      status: 'BPM Specialist'
    }
  ]);

  async ngOnInit() {
    try {
      const { data } = await this.supabase.client.from('profiles').select('*');
      if (data && data.length > 0) {
        // Retain default verified leadership while permitting db augmentations
      }
    } catch {
      // Keep default team on offline db
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
