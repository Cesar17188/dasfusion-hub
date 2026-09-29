import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { ClientProjectService } from './client-project.service';
import { Quote, QuoteInsert } from '../models/database.types';
import { ClientProject } from '../models/client-project.model';

export interface CreateQuoteDto {
  category: string;
  title: string;
  description: string;
  clientPhone?: string;
  budget?: number;
}

export interface QuoteResult {
  quote: Quote | null;
  project: ClientProject;
  whatsappUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);
  private clientProjectService = inject(ClientProjectService);

  readonly destinationWhatsAppDigits = '593987148786';
  readonly destinationEmail = 'proyectos@dasfusion.ec';

  /**
   * Crea y procesa una cotización completa:
   * 1. Guarda en la tabla 'quotes' de Supabase con todos los datos disponibles.
   * 2. Registra el proyecto en 'projects' para el portal y Kanban del usuario.
   * 3. Dispara notificación por correo a DASFusion y de confirmación al usuario.
   * 4. Retorna la URL de WhatsApp lista para abrir chat con el arquitecto.
   */
  async submitQuote(dto: CreateQuoteDto): Promise<QuoteResult> {
    const user = this.authService.currentUser();
    const userFullName = this.authService.userFullName() || 'Cliente DASFusion';
    const userEmail = user?.email || 'cliente@dasfusion.ec';

    // 1. Guardar en la tabla de proyectos del Portal
    const createdProject = await this.clientProjectService.createProject({
      title: dto.title.trim(),
      description: dto.description.trim(),
      category: dto.category as any,
      priority: 'high',
      budget: dto.budget ?? 0,
      techStack: [dto.category],
      phase: 'discovery',
      status: 'on_track',
      progressPercentage: 15,
      deliverablesTotal: 1,
      deliverablesDone: 0,
      requirements: []
    });

    // 2. Guardar en la tabla 'quotes' de la base de datos
    let savedQuote: Quote | null = null;
    try {
      const quotePayload: QuoteInsert = {
        user_id: user?.id || null,
        client_name: userFullName,
        client_email: userEmail,
        client_phone: dto.clientPhone || null,
        category: dto.category,
        title: dto.title.trim(),
        description: dto.description.trim(),
        tech_stack: [dto.category],
        budget: dto.budget ?? 0,
        status: 'pending_review',
        metadata: {
          projectId: createdProject.id,
          source: 'portal_estimator',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
        }
      };

      const { data, error } = await this.supabaseService.client
        .from('quotes')
        .insert(quotePayload)
        .select()
        .maybeSingle();

      if (error) {
        console.warn('Note: Could not insert into quotes table (run migration if table is pending):', error.message);
      } else {
        savedQuote = data;
      }
    } catch (e) {
      console.warn('Error saving into quotes table:', e);
    }

    // 3. Disparar correos electrónicos (notificación a proyectos@dasfusion.ec y al cliente)
    this.dispatchQuoteEmails({
      clientName: userFullName,
      clientEmail: userEmail,
      clientPhone: dto.clientPhone,
      title: dto.title.trim(),
      category: dto.category,
      description: dto.description.trim(),
      createdAt: new Date().toISOString()
    }).catch(err => {
      console.warn('Email dispatch warning (will fallback to WhatsApp/DB):', err);
    });

    // 4. Generar URL de WhatsApp preformateada
    const whatsappUrl = this.buildWhatsAppUrl({
      clientName: userFullName,
      clientEmail: userEmail,
      title: dto.title.trim(),
      category: dto.category,
      description: dto.description.trim()
    });

    return {
      quote: savedQuote,
      project: createdProject,
      whatsappUrl
    };
  }

  /**
   * Construye el mensaje oficial para WhatsApp de DASFusion
   */
  buildWhatsAppUrl(params: { clientName: string; clientEmail: string; title: string; category: string; description: string }): string {
    const message = `🚀 *Nueva Cotización Registrada en Portal DASFusion*
👤 *Cliente:* ${params.clientName} (${params.clientEmail})
📌 *Proyecto:* ${params.title}
🏷️ *Categoría:* ${params.category}
📝 *Alcance & Especificaciones Técnicas:*
${params.description}`;

    return `https://wa.me/${this.destinationWhatsAppDigits}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Envía los correos vía Supabase Edge Function o API REST
   */
  private async dispatchQuoteEmails(payload: any): Promise<void> {
    try {
      // Intenta invocar la Edge Function de Supabase
      const { data, error } = await this.supabaseService.client.functions.invoke('send-quote-email', {
        body: payload
      });

      if (error) {
        console.info('Edge function send-quote-email status:', error.message);
      }
    } catch (err) {
      console.info('Supabase edge function call info:', err);
    }
  }
}
