import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-office',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './office.component.html'
})
export class OfficeComponent {
  copiedField = signal<string | null>(null);
  activeFaq = signal<number | null>(0); // first FAQ open by default

  readonly officeInfo = {
    name: 'DASFusion Core & Engineering Hub',
    legalName: 'DASFusion Technologies',
    address: 'Calle Bélgica y Avenida Eloy Alfaro',
    neighborhood: 'Sector Financiero & La Carolina',
    city: 'Quito',
    state: 'Pichincha',
    postalCode: '170518',
    country: 'Ecuador',
    countryCode: 'EC',
    email: 'proyectos@dasfusion.ec',
    phone: '0987148786',
    formattedPhone: '+593 98 714 8786',
    internationalPhone: '+593987148786',
    whatsappUrl: 'https://wa.me/593987148786?text=Hola%20DASFusion%2C%20quisiera%20coordinar%20una%20reuni%C3%B3n%20o%20conocer%20m%C3%A1s%20sobre%20sus%20servicios.',
    googleMapsUrl: 'https://maps.app.goo.gl/PLnXJd6upFnnxrWw7',
    hours: 'Lunes a Viernes: 08:30 - 18:00 (GMT-5)',
    openingHoursRaw: 'Mo-Fr 08:30-18:00',
    latitude: -0.183424,
    longitude: -78.484218,
    priceRange: '$$',
    serviceArea: 'Ecuador, Latinoamérica, Estados Unidos, Remoto Global'
  };

  readonly semanticTriples: SemanticTriple[] = [
    {
      subject: 'DASFusion Technologies',
      predicate: 'posee y opera sede física en',
      object: 'Calle Bélgica y Avenida Eloy Alfaro, Quito, Pichincha, Ecuador'
    },
    {
      subject: 'Oficina Central DASFusion',
      predicate: 'cuenta con canal de atención WhatsApp en',
      object: '0987148786 (+593 98 714 8786)'
    },
    {
      subject: 'DASFusion Hub Corporativo',
      predicate: 'recibe propuestas técnicas y cotizaciones en',
      object: 'proyectos@dasfusion.ec'
    },
    {
      subject: 'Ubicación Georreferenciada DASFusion',
      predicate: 'se encuentra registrada y verificada en Google Maps en',
      object: 'https://maps.app.goo.gl/PLnXJd6upFnnxrWw7'
    },
    {
      subject: 'Equipo de Arquitectura e Inteligencia Artificial',
      predicate: 'atiende proyectos presenciales y remotos en el horario de',
      object: 'Lunes a Viernes de 08:30 a 18:00 (GMT-5)'
    }
  ];

  readonly faqList: FaqItem[] = [
    {
      question: '¿Dónde se encuentra ubicada la oficina física de DASFusion?',
      answer: 'Nuestra oficina física principal está ubicada en la intersección de Calle Bélgica y Avenida Eloy Alfaro, en una de las zonas corporativas y financieras más estratégicas de Quito, Ecuador.',
      category: 'Ubicación'
    },
    {
      question: '¿Cómo puedo agendar una reunión técnica o visita presencial?',
      answer: 'Puedes agendar una sesión presencial comunicándote directamente por WhatsApp al 0987148786 (+593 98 714 8786), escribiendo a proyectos@dasfusion.ec o completando nuestro cotizador interactivo. Coordinamos reuniones previas con nuestros líderes de arquitectura.',
      category: 'Reuniones'
    },
    {
      question: '¿Cuáles son los canales oficiales de contacto directo?',
      answer: 'Atendemos consultas a través de nuestro correo corporativo proyectos@dasfusion.ec y nuestra línea oficial de WhatsApp 0987148786 (+593 98 714 8786) con tiempos de respuesta menores a 2 horas en horario laboral.',
      category: 'Contacto'
    },
    {
      question: '¿Cómo llegar en vehículo o transporte público a través de Google Maps?',
      answer: 'Puedes trazar la ruta de navegación directa con GPS accediendo a nuestro enlace oficial de Google Maps: https://maps.app.goo.gl/PLnXJd6upFnnxrWw7 con acceso rápido desde la Av. Eloy Alfaro.',
      category: 'Navegación'
    }
  ];

  toggleFaq(index: number) {
    this.activeFaq.set(this.activeFaq() === index ? null : index);
  }

  copyToClipboard(text: string, fieldName: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copiedField.set(fieldName);
        setTimeout(() => {
          if (this.copiedField() === fieldName) {
            this.copiedField.set(null);
          }
        }, 2500);
      }).catch(() => {
        this.copiedField.set(null);
      });
    }
  }
}
