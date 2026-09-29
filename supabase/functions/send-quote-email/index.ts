// Supabase Edge Function: send-quote-email
// Serves dual-email dispatch:
// 1. Internal notification to proyectos@dasfusion.ec with full technical specs.
// 2. Client confirmation email confirming receipt of the proposal request.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const DASFUSION_EMAIL = 'proyectos@dasfusion.ec';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      title, 
      category, 
      description, 
      createdAt 
    } = await req.json();

    if (!title || !description || !clientEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required quote fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // HTML Email to DASFusion Engineering Team
    const adminEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 24px; font-weight: 800;">🚀 Nueva Cotización Registrada</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">DASFusion Hub - Estimation Engine</p>
        </div>
        
        <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="font-size: 18px; color: #ffffff; margin-top: 0;">${title}</h2>
          <p style="margin: 6px 0;"><strong style="color: #38bdf8;">Categoría:</strong> ${category}</p>
          <p style="margin: 6px 0;"><strong style="color: #38bdf8;">Cliente:</strong> ${clientName || 'Cliente DASFusion'} (${clientEmail})</p>
          ${clientPhone ? `<p style="margin: 6px 0;"><strong style="color: #38bdf8;">Teléfono:</strong> ${clientPhone}</p>` : ''}
          <p style="margin: 6px 0;"><strong style="color: #38bdf8;">Fecha de Registro:</strong> ${createdAt || new Date().toISOString()}</p>
        </div>

        <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
          <h3 style="font-size: 15px; color: #cbd5e1; margin-top: 0; text-transform: uppercase; letter-spacing: 0.05em;">Alcance y Especificaciones Técnicas:</h3>
          <p style="white-space: pre-wrap; color: #e2e8f0; font-size: 14px; line-height: 1.6;">${description}</p>
        </div>

        <div style="text-align: center; padding-top: 12px;">
          <a href="https://wa.me/${(clientPhone || '').replace(/\D/g, '')}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Contactar Cliente por WhatsApp</a>
        </div>
      </div>
    `;

    // HTML Email to the Client
    const clientEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 24px; font-weight: 800;">DASFusion Technologies</h1>
          <p style="color: #10b981; font-weight: bold; font-size: 14px; margin-top: 6px;">¡Hemos recibido tu requerimiento de proyecto!</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Hola <strong>${clientName || 'estimado cliente'}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          Tu solicitud para el proyecto <strong style="color: #ffffff;">"${title}"</strong> ha ingresado formalmente a nuestra cola de análisis técnico y de arquitectura.
        </p>

        <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #38bdf8; font-size: 14px; text-transform: uppercase;">Resumen de tu Solicitud</h3>
          <ul style="padding-left: 20px; margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.8;">
            <li><strong>Categoría:</strong> ${category}</li>
            <li><strong>Fase inicial:</strong> Análisis y Descubrimiento Arquitectónico</li>
            <li><strong>Tiempo estimado de respuesta:</strong> Menos de 24 horas</li>
          </ul>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          Uno de nuestros arquitectos de software senior revisará las especificaciones técnicas y se pondrá en contacto contigo para presentarte el roadmap de desarrollo y la propuesta económica definitiva.
        </p>

        <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #334155;">
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">¿Tienes dudas urgentes o deseas complementar requerimientos?</p>
          <a href="https://wa.me/593987148786" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">Escribir a Soporte WhatsApp (+593 98 714 8786)</a>
        </div>
      </div>
    `;

    // If Resend API Key is available, dispatch both emails
    if (RESEND_API_KEY) {
      // 1. Send to DASFusion
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DASFusion Hub <notificaciones@dasfusion.ec>',
          to: [DASFUSION_EMAIL],
          subject: `🚀 Nueva Cotización: ${title} (${clientName || clientEmail})`,
          html: adminEmailHtml
        })
      });

      // 2. Send confirmation to Client
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DASFusion Technologies <notificaciones@dasfusion.ec>',
          to: [clientEmail],
          subject: `✅ Cotización Recibida: ${title} - DASFusion`,
          html: clientEmailHtml
        })
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Emails dispatched successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
