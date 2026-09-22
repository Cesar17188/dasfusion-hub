import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

export interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
}

export interface IndustryItem {
  id: string;
  title: string;
  tag: string;
  queryIntent: string;
  tripleLabel: string;
  semanticTriple: SemanticTriple;
  description: string;
  solution: string;
  gridSpan: string;
  gradient: string;
  metrics: string;
  metricsLabel: string;
  iconSvg: string;
  seoKeywords: string[];
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
      id: 'marketing-seo-aeo',
      title: 'Marketing Digital, SEO & AEO',
      tag: 'Posicionamiento & Motores IA',
      queryIntent: '¿Cómo posicionar tu marca en Google y motores de búsqueda con IA?',
      tripleLabel: 'Estrategia de Posicionamiento & IA',
      semanticTriple: {
        subject: 'DasFusion SEO & AEO',
        predicate: 'indexa y posiciona',
        object: 'Motores IA & Búsqueda Orgánica'
      },
      description: 'Visibilidad orgánica y posicionamiento en motores de búsqueda e inteligencias generativas.',
      solution: 'Estrategias técnicas de SEO on/off-page, optimización AEO para motores de respuesta con IA (ChatGPT, Perplexity, Gemini), arquitectura de contenido semántico y campañas de adquisición de alto ROI.',
      gridSpan: 'lg:col-span-2',
      gradient: 'linear-gradient(135deg, #1b365d 0%, #121316 100%)',
      metricsLabel: 'Tráfico Web & IA',
      metrics: '+250% Tráfico Orgánico',
      seoKeywords: ['SEO Técnico', 'AEO Search Engines', 'Optimización ChatGPT/Perplexity', 'Contenido Semántico'],
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6M8 11h6"/></svg>`
    },
    {
      id: 'data-analytics',
      title: 'Análisis de Datos & BI',
      tag: 'Big Data & Analítica',
      queryIntent: '¿Cómo convertir datos dispersos en decisiones comerciales estratégicas?',
      tripleLabel: 'Pipeline Analítico & Decisión',
      semanticTriple: {
        subject: 'Data Analytics Suite',
        predicate: 'transforma datos masivos en',
        object: 'Decisiones y Modelos Predictivos'
      },
      description: 'Inteligencia de negocios y modelado predictivo para decisiones estratégicas.',
      solution: 'Pipelines de ingesta y consolidación de datos en tiempo real, dashboards ejecutivos en Power BI/Tableau, modelado predictivo y data warehouses centralizados.',
      gridSpan: 'lg:col-span-1',
      gradient: 'linear-gradient(135deg, #1e2022 0%, #162438 100%)',
      metricsLabel: 'Tiempo de Decisión',
      metrics: '10x Velocidad en Reportes',
      seoKeywords: ['Business Intelligence', 'Data Warehouse', 'Dashboards KPI', 'Modelado Predictivo'],
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
    },
    {
      id: 'franchises-startups',
      title: 'Emprendimientos & Franquicias',
      tag: 'Automatización & Modernización',
      queryIntent: '¿Cómo automatizar operaciones, estandarizar sucursales y modernizar sistemas para escalar?',
      tripleLabel: 'Estandarización & Escalabilidad Multi-Sede',
      semanticTriple: {
        subject: 'DasFusion Franchise Hub',
        predicate: 'moderniza y estandariza',
        object: 'Sistemas y Procesos Multi-Sucursal'
      },
      description: 'Estandarización operativa, modernización de software legado y control centralizado multi-sede.',
      solution: 'Migración y modernización de sistemas obsoletos a arquitecturas cloud escalables, automatización de flujos operativos y de venta, control centralizado de inventario por sucursal y onboarding acelerado para nuevos puntos de venta.',
      gridSpan: 'lg:col-span-1',
      gradient: 'linear-gradient(135deg, #1a2c4e 0%, #121316 100%)',
      metricsLabel: 'Escalabilidad Operativa',
      metrics: '+3x Velocidad de Expansión',
      seoKeywords: ['Software para Franquicias', 'Automatización de Negocios', 'Modernización de Sistemas', 'Control Multi-Sucursal', 'Escalabilidad Cloud'],
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M5 9v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M12 14v1"/></svg>`
    },
    {
      id: 'bpm-automation',
      title: 'BPM & Automatización de Procesos',
      tag: 'Business Process Management',
      queryIntent: '¿Cómo eliminar cuellos de botella operativos y automatizar tareas repetitivas?',
      tripleLabel: 'Flujo de Orquestación & Automatización',
      semanticTriple: {
        subject: 'Arquitectura BPMN & RPA',
        predicate: 'orquesta y automatiza',
        object: 'Flujos Operativos Críticos'
      },
      description: 'Optimización y orquestación integral de flujos de trabajo operativos.',
      solution: 'Modelado y reingeniería de procesos (BPMN), automatización robótica (RPA), integraciones API/webhooks en tiempo real y erradicación de errores manuales.',
      gridSpan: 'lg:col-span-2',
      gradient: 'linear-gradient(135deg, #1e2022 0%, #1a2f4c 100%)',
      metricsLabel: 'Ahorro Operativo',
      metrics: '-60% Costos Operativos',
      seoKeywords: ['BPMN 2.0', 'Automatización RPA', 'Workflows Empresariales', 'Integración APIs'],
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`
    },
    {
      id: 'inventory-control',
      title: 'Controles & Gestión de Inventarios',
      tag: 'Stock & Almacenes',
      queryIntent: '¿Cómo optimizar existencias, reducir mermas y sincronizar almacenes en tiempo real?',
      tripleLabel: 'Trazabilidad & Control de Stock',
      semanticTriple: {
        subject: 'Sistema WMS Inteligente',
        predicate: 'sincroniza y audita',
        object: 'Stock Omnicanal Multialmacén'
      },
      description: 'Trazabilidad total, control de mermas y predicción de demanda.',
      solution: 'Sistemas WMS avanzados, sincronización omnicanal de existencias en tiempo real, alertas inteligentes de reabastecimiento y control de inventario por códigos/lotes.',
      gridSpan: 'lg:col-span-1',
      gradient: 'linear-gradient(135deg, #1e2022 0%, #202d3f 100%)',
      metricsLabel: 'Exactitud de Stock',
      metrics: '99.8% Precisión en Stock',
      seoKeywords: ['Software WMS', 'Control de Stock Omnicanal', 'Trazabilidad de Lotes', 'Predicción de Demanda'],
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
    },
    {
      id: 'ecommerce',
      title: 'Retail & E-Commerce Omnicanal',
      tag: 'Comercio Digital',
      queryIntent: '¿Cómo escalar ventas y personalizar compras en comercio electrónico?',
      tripleLabel: 'Motor Transaccional & Omnicanalidad',
      semanticTriple: {
        subject: 'Plataforma E-Commerce AI',
        predicate: 'personaliza y maximiza',
        object: 'Conversión de Ventas B2B/B2C'
      },
      description: 'Experiencias de compra hiperpersonalizadas.',
      solution: 'Motores de búsqueda semántica y recomendación inteligente con LLMs, checkout sin fricción e integración directa con ERPs y pasarelas de pago globales.',
      gridSpan: 'lg:col-span-2',
      gradient: 'linear-gradient(135deg, #162a46 0%, #121316 100%)',
      metricsLabel: 'Conversión de Ventas',
      metrics: '+40% Tasa de Conversión',
      seoKeywords: ['E-Commerce B2B/B2C', 'Recomendación con IA', 'Checkout Unificado', 'Integración ERP'],
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    },
    {
      id: 'healthtech',
      title: 'HealthTech & Sector Salud',
      tag: 'Salud & Telemedicina',
      queryIntent: '¿Cómo digitalizar historiales clínicos y telemedicina bajo normativas médicas?',
      tripleLabel: 'Infraestructura Clínica & Telemedicina',
      semanticTriple: {
        subject: 'Ecosistema EHR Seguro',
        predicate: 'interopera y custodia',
        object: 'Historiales Clínicos Cifrados'
      },
      description: 'Digitalización médica y teleconsulta segura.',
      solution: 'Sistemas EHR interoperables con normativas de privacidad médica (HL7/HIPAA), análisis predictivo de historiales y triaje automatizado asistido por IA.',
      gridSpan: 'lg:col-span-1',
      gradient: 'linear-gradient(135deg, #18263a 0%, #121316 100%)',
      metricsLabel: 'Seguridad Médica',
      metrics: '100% Cifrado E2E',
      seoKeywords: ['Software Médico EHR', 'Telemedicina HIPAA', 'Interoperabilidad HL7', 'Triaje Clínico IA'],
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
    },
    {
      id: 'logistics',
      title: 'Logística & Supply Chain',
      tag: 'Transporte & Envíos',
      queryIntent: '¿Cómo monitorear flotas y optimizar tiempos de entrega en última milla?',
      tripleLabel: 'Cadena de Distribución & Última Milla',
      semanticTriple: {
        subject: 'Motor de Ruteo & IoT',
        predicate: 'monitorea y optimiza',
        object: 'Distribución de Última Milla'
      },
      description: 'Monitoreo de flotas y distribución inteligente.',
      solution: 'Enrutamiento dinámico de entregas con algoritmos heurísticos, telemetría IoT en vivo y sincronización de bodegas multisede para máxima puntualidad.',
      gridSpan: 'lg:col-span-1',
      gradient: 'linear-gradient(135deg, #1e2022 0%, #202d3f 100%)',
      metricsLabel: 'Eficiencia en Ruta',
      metrics: '-35% Tiempos de Entrega',
      seoKeywords: ['Ruteo Dinámico', 'Telemetría IoT', 'Última Milla', 'Tracking Logístico'],
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
    },
    {
      id: 'legaltech',
      title: 'LegalTech & PropTech',
      tag: 'Bienes Raíces & Contratos',
      queryIntent: '¿Cómo automatizar la revisión contractual y transacciones inmobiliarias?',
      tripleLabel: 'Validación Contractual & PropTech',
      semanticTriple: {
        subject: 'Agente Legal con IA',
        predicate: 'audita y valida',
        object: 'Contratos y Activos Inmobiliarios'
      },
      description: 'Gestión documental y transacciones inmobiliarias.',
      solution: 'Extracción semántica y auditoría de contratos con IA, valoración algorítmica de inmuebles y firma electrónica certificada con plena validez jurídica.',
      gridSpan: 'lg:col-span-1',
      gradient: 'linear-gradient(135deg, #18263a 0%, #121316 100%)',
      metricsLabel: 'Agilidad Jurídica',
      metrics: '8x Agilidad Documental',
      seoKeywords: ['Auditoría Legal IA', 'Firma Electrónica', 'PropTech Real Estate', 'Gestión Contractual'],
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
    }
  ];
}
