import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

interface IndustryItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  solution: string;
  gridSpan: string;
  gradient: string;
  metrics: string;
  iconSvg: string;
}

@Component({
  selector: 'app-industries-collage',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './industries-collage.component.html'
})
export class IndustriesCollageComponent {
  industries: IndustryItem[] = [
    {
      id: 'fintech',
      title: 'FinTech & Banca Digital',
      tag: 'Finanzas & Pagos',
      description: 'Entornos bancarios y pasarelas de pago de alta exigencia.',
      solution: 'Plataformas transaccionales de latencia ultra-baja, conciliación automática bancaria, tokenización segura de tarjetas y modelos antifraude en tiempo real.',
      gridSpan: 'lg:col-span-2',
      gradient: 'linear-gradient(135deg, #1b365d 0%, #121316 100%)',
      metrics: '99.999% Disponibilidad',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`
    },
    {
      id: 'healthtech',
      title: 'HealthTech & Sector Salud',
      tag: 'Salud & Telemedicina',
      description: 'Digitalización médica y teleconsulta segura.',
      solution: 'Sistemas EHR interoperables con normativas de privacidad médica, análisis predictivo de historiales y triaje asistido por IA generativa.',
      gridSpan: 'lg:col-span-1',
      gradient: 'linear-gradient(135deg, #1e2022 0%, #162438 100%)',
      metrics: '100% Cifrado E2E',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
    },
    {
      id: 'logistics',
      title: 'Logística & Supply Chain',
      tag: 'Transporte & Envíos',
      description: 'Monitoreo de flotas y distribución inteligente.',
      solution: 'Enrutamiento dinámico de entregas con algoritmos heurísticos, telemetría IoT en vivo y sincronización de bodegas multisede.',
      gridSpan: 'lg:col-span-1',
      gradient: 'linear-gradient(135deg, #1e2022 0%, #202d3f 100%)',
      metrics: '-35% Tiempos de Entrega',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
    },
    {
      id: 'ecommerce',
      title: 'Retail & E-Commerce Omnicanal',
      tag: 'Comercio Digital',
      description: 'Experiencias de compra hiperpersonalizadas.',
      solution: 'Motores de búsqueda semántica y recomendación inteligente con LLMs, checkout sin fricción e integración con ERPs de inventario global.',
      gridSpan: 'lg:col-span-2',
      gradient: 'linear-gradient(135deg, #162a46 0%, #121316 100%)',
      metrics: '+40% Tasa de Conversión',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    },
    {
      id: 'industry40',
      title: 'Manufactura & Industria 4.0',
      tag: 'Smart Factory & IoT',
      description: 'Automatización de plantas industriales.',
      solution: 'Mantenimiento predictivo de maquinaria con sensores edge, tableros SCADA en tiempo real y gemelos digitales de líneas de ensamblaje.',
      gridSpan: 'lg:col-span-2',
      gradient: 'linear-gradient(135deg, #1e2022 0%, #1a2f4c 100%)',
      metrics: '-50% Paradas no Programadas',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
    },
    {
      id: 'legaltech',
      title: 'LegalTech & PropTech',
      tag: 'Bienes Raíces & Contratos',
      description: 'Gestión documental y transacciones inmobiliarias.',
      solution: 'Extracción semántica y auditoría de contratos con IA, valoración algorítmica de activos y firma electrónica con validez jurídica.',
      gridSpan: 'lg:col-span-1',
      gradient: 'linear-gradient(135deg, #18263a 0%, #121316 100%)',
      metrics: '8x Agilidad Documental',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
    }
  ];
}
