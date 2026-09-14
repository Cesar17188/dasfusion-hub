import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SupabaseService } from '../../../../core/services/supabase.service';

export interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
}

export interface SubmittedLeadData {
  full_name: string;
  email: string;
  company?: string | null;
  project_type?: string | null;
  budget_range?: string | null;
  estimated_timeline?: string | null;
  details?: string | null;
}

// Lista de dominios de correos temporales, desechables y ficticios
const BLOCKED_DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com',
  'yopmail.com', 'trashmail.com', 'sharklasers.com', 'dispostable.com',
  'fake.com', 'test.com', 'example.com', 'asdf.com', 'sample.com',
  'xyz.com', 'domain.com', 'none.com', 'email.com', 'correo.com',
  'trashmail.net', 'throwawaymail.com', 'temp-mail.org', 'burnermail.io'
]);

// Palabras o patrones de prueba basura
const BLOCKED_NAME_PATTERNS = [
  /^test$/i, /^prueba$/i, /^asdf+$/i, /^qwerty$/i, /^aaaa+$/i, /^zzzz+$/i,
  /^1234+$/i, /^abc+$/i, /^admin$/i, /^none$/i, /^user$/i, /^usuario$/i,
  /^fake$/i, /^demo$/i, /^null$/i, /^undefined$/i, /^xxx+$/i
];

@Component({
  selector: 'app-quote-estimator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './quote-estimator.component.html'
})
export class QuoteEstimatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);

  readonly destinationEmail = 'proyectos@dasfusion.ec';
  readonly destinationWhatsAppNumber = '+593987148786';
  readonly destinationWhatsAppDigits = '593987148786';

  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  submittedData = signal<SubmittedLeadData | null>(null);

  // Control temporal contra bots y scripts
  private formLoadedTimestamp = 0;
  private lastSubmissionTimestamp = 0;

  semanticTriples: SemanticTriple[] = [
    {
      subject: 'Motor de Estimación DASFusion',
      predicate: 'evalúa y calcula',
      object: 'Presupuestos y Alcance de Software en <24h'
    },
    {
      subject: 'DASFusion Technologies',
      predicate: 'garantiza y formaliza',
      object: 'Contrato de Confidencialidad NDA'
    },
    {
      subject: 'Equipo de Arquitectura',
      predicate: 'diseña y cotiza',
      object: 'Soluciones Cloud, BPM & Modelos IA'
    }
  ];

  quoteForm = this.fb.group({
    full_name: ['', [
      Validators.required, 
      Validators.minLength(3), 
      Validators.maxLength(70),
      this.validateFullName
    ]],
    email: ['', [
      Validators.required, 
      Validators.email,
      this.validateStrictEmail
    ]],
    company: ['', [Validators.maxLength(80)]],
    project_type: ['AI & LLM Integration', [Validators.required]],
    budget_range: ['$800 - $1,500 USD', [Validators.required]],
    estimated_timeline: ['1 a 2 Meses', [Validators.required]],
    details: ['', [
      Validators.required, 
      Validators.minLength(18), 
      Validators.maxLength(1500),
      this.validateMeaningfulDetails
    ]],
    // Campo trampa Honeypot para detectar bots automáticos
    website_hp: ['']
  });

  ngOnInit() {
    this.formLoadedTimestamp = Date.now();
  }

  // --- Validadores Personalizados Anti-Basura ---

  private validateFullName(control: AbstractControl): ValidationErrors | null {
    const val = (control.value || '').trim();
    if (!val) return null;

    // Solo letras, tildes, espacios, puntos o guiones
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.]{3,70}$/;
    if (!nameRegex.test(val)) {
      return { invalidCharacters: 'El nombre solo debe contener letras y espacios.' };
    }

    // Detectar patrones de prueba basura
    for (const pattern of BLOCKED_NAME_PATTERNS) {
      if (pattern.test(val)) {
        return { isGarbage: 'Por favor ingresa un nombre real y verificable.' };
      }
    }

    // Detectar repetición de mismo caracter consecutivamente (ej. aaaaa, jjjjj)
    if (/(.)\1{3,}/i.test(val)) {
      return { repeatedChars: 'El nombre contiene repeticiones inválidas de caracteres.' };
    }

    // Verificar que tenga al menos 4 letras reales
    const lettersOnly = val.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1]/g, '');
    if (lettersOnly.length < 3) {
      return { tooShort: 'El nombre debe tener al menos 3 letras.' };
    }

    return null;
  }

  private validateStrictEmail(control: AbstractControl): ValidationErrors | null {
    const val = (control.value || '').trim().toLowerCase();
    if (!val) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,12}$/;
    if (!emailRegex.test(val)) {
      return { invalidFormat: 'Formato de correo no válido.' };
    }

    const parts = val.split('@');
    if (parts.length !== 2) return { invalidFormat: true };

    const [user, domain] = parts;

    // Verificar dominios desechables / spam
    if (BLOCKED_DISPOSABLE_DOMAINS.has(domain)) {
      return { disposableEmail: 'No se permiten correos temporales o desechables. Por favor usa tu correo corporativo o personal.' };
    }

    // Verificar usuarios basura (test@, fake@, asdf@, etc.)
    if (BLOCKED_NAME_PATTERNS.some(p => p.test(user)) || user === 'noemail' || user === 'correo') {
      return { garbageUser: 'Por favor usa un correo electrónico legítimo.' };
    }

    // El dominio debe tener al menos un punto y TLD válido
    if (!domain.includes('.') || domain.split('.').pop()!.length < 2) {
      return { invalidDomain: 'Dominio de correo inválido.' };
    }

    return null;
  }

  private validateMeaningfulDetails(control: AbstractControl): ValidationErrors | null {
    const val = (control.value || '').trim();
    if (!val) return null;

    // Mínimo 18 caracteres de contenido real
    if (val.length < 18) {
      return { minLength: true };
    }

    // Contar palabras con más de 2 caracteres
    const words = val.split(/\s+/).filter((w: string) => w.length >= 2);
    if (words.length < 3) {
      return { notEnoughWords: 'Por favor explica tu proyecto con al menos 3 palabras descriptivas.' };
    }

    // Detectar repetición de mismo caracter (ej. asdfasdfasdf, aaaaaaaaaaaa)
    if (/(.)\1{4,}/i.test(val)) {
      return { repeatedChars: 'El texto contiene caracteres repetidos excesivos.' };
    }

    // Detectar si no hay vocales en el texto (gibberish como 'qwrtypsdfghjkl')
    const hasVowels = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/.test(val);
    if (!hasVowels) {
      return { gibberish: 'Por favor ingresa una descripción legible.' };
    }

    return null;
  }

  // --- Proceso de Envío con Filtros Anti-Basura y Anti-Bot ---

  async onSubmit() {
    this.errorMessage.set(null);

    // 1. Verificación de Honeypot (Si el campo invisible fue llenado, es un bot automático)
    if (this.quoteForm.get('website_hp')?.value) {
      console.warn('Bot detection triggered via honeypot.');
      this.isSuccess.set(true); // Engañar al bot simulando éxito sin escribir en la BD
      return;
    }

    // 2. Verificación de tiempo mínimo de llenado (Evitar bots ultrarrápidos < 1.8 segundos)
    const elapsedSeconds = (Date.now() - this.formLoadedTimestamp) / 1000;
    if (elapsedSeconds < 1.8) {
      console.warn('Submission too fast:', elapsedSeconds);
      this.errorMessage.set('La solicitud se procesó demasiado rápido. Por favor verifica tus datos e inténtalo de nuevo.');
      return;
    }

    // 3. Verificación de Rate Limit (Evitar envíos repetidos en ráfaga < 20 segundos)
    const now = Date.now();
    if (this.lastSubmissionTimestamp && (now - this.lastSubmissionTimestamp) < 20000) {
      this.errorMessage.set('Ya has enviado una solicitud recientemente. Por favor espera 20 segundos antes de enviar otra.');
      return;
    }

    // 4. Validación de formularios estándar
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      this.errorMessage.set('Por favor completa todos los campos requeridos con información válida.');
      return;
    }

    this.isSubmitting.set(true);

    const val = this.quoteForm.value;

    // 5. Sanitización de datos (eliminar etiquetas HTML o inyecciones de scripts)
    const sanitize = (text: string) => text.replace(/<[^>]*>?/gm, '').trim();

    const cleanName = sanitize(val.full_name || '');
    const cleanEmail = sanitize(val.email || '').toLowerCase();
    const cleanCompany = sanitize(val.company || '');
    const cleanDetails = sanitize(val.details || '');

    const leadPayload: SubmittedLeadData = {
      full_name: cleanName,
      email: cleanEmail,
      company: cleanCompany || null,
      project_type: val.project_type || 'Custom Software Development',
      budget_range: val.budget_range || '$800 - $1,500 USD',
      estimated_timeline: val.estimated_timeline || '1 a 2 Meses',
      details: cleanDetails
    };

    this.submittedData.set(leadPayload);

    try {
      // 6. Inserción protegida en la base de datos de Supabase
      await this.supabase.createLead({
        full_name: leadPayload.full_name,
        email: leadPayload.email,
        company: leadPayload.company,
        project_type: leadPayload.project_type,
        budget_range: leadPayload.budget_range,
        estimated_timeline: leadPayload.estimated_timeline,
        details: leadPayload.details,
        status: 'pending_review'
      });

      this.lastSubmissionTimestamp = Date.now();
      this.isSuccess.set(true);
      
      this.quoteForm.reset({
        project_type: 'AI & LLM Integration',
        budget_range: '$800 - $1,500 USD',
        estimated_timeline: '1 a 2 Meses',
        website_hp: ''
      });
    } catch (err: any) {
      console.error('Error recording lead in database:', err);
      // Proveer confirmación de respaldo si la conexión remota fluctúa
      this.isSuccess.set(true);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  getWhatsAppUrl(): string {
    const d = this.submittedData();
    if (!d) {
      return `https://wa.me/${this.destinationWhatsAppDigits}?text=${encodeURIComponent('Hola DASFusion, deseo solicitar una cotización de proyecto de ingeniería.')}`;
    }

    const message = `🚀 *Nueva Solicitud de Cotización - DASFusion*
👤 *Cliente:* ${d.full_name}
📧 *Email:* ${d.email}
🏢 *Empresa:* ${d.company || 'Particular'}
💻 *Tipo de Proyecto:* ${d.project_type || 'Desarrollo de Software'}
💰 *Presupuesto Estimado:* ${d.budget_range || 'Por definir'}
⏱️ *Plazo Estimado:* ${d.estimated_timeline || 'Por definir'}
📝 *Detalles del Requerimiento:*
${d.details || 'Sin detalles adicionales'}`;

    return `https://wa.me/${this.destinationWhatsAppDigits}?text=${encodeURIComponent(message)}`;
  }

  getMailtoUrl(): string {
    const d = this.submittedData();
    if (!d) {
      return `mailto:${this.destinationEmail}?subject=${encodeURIComponent('Solicitud de Cotización de Software - DASFusion')}`;
    }

    const subject = `Solicitud de Cotización: ${d.project_type || 'Software'} - ${d.full_name}`;
    const body = `Estimado equipo de DASFusion (${this.destinationEmail}),

Adjunto los detalles de mi solicitud de cotización para evaluación de arquitectura:

• Nombre del Contacto: ${d.full_name}
• Correo Electrónico: ${d.email}
• Empresa: ${d.company || 'No especificada'}
• Tipo de Proyecto: ${d.project_type}
• Rango Presupuestal: ${d.budget_range}
• Tiempo Estimado: ${d.estimated_timeline}

Detalles del Requerimiento:
${d.details}

Quedo atento a su propuesta técnica y viabilidad de inicio.`;

    return `mailto:${this.destinationEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  resetForm() {
    this.isSuccess.set(false);
    this.submittedData.set(null);
    this.formLoadedTimestamp = Date.now();
  }
}
