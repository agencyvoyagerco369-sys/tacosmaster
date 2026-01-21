import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  subtotal: number;
}

interface OrderNotificationRequest {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  order_mode: "delivery" | "pickup";
  total: number;
  items: OrderItem[];
  delivery_address?: string;
  pickup_time?: string;
  kitchen_notes?: string;
  notification_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderNotificationRequest = await req.json();

    const {
      order_id,
      customer_name,
      customer_phone,
      order_mode,
      total,
      items,
      delivery_address,
      pickup_time,
      kitchen_notes,
      notification_email,
    } = orderData;

    // Build items list HTML
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}x ${item.product_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal.toFixed(2)}</td>
          </tr>`
      )
      .join("");

    // Build order details
    const modeText = order_mode === "delivery" ? "🛵 Domicilio" : "🏪 Recoger";
    const locationInfo =
      order_mode === "delivery"
        ? `<p><strong>Dirección:</strong> ${delivery_address || "No especificada"}</p>`
        : `<p><strong>Hora de recolección:</strong> ${pickup_time || "Lo antes posible"}</p>`;

    const notesHtml = kitchen_notes
      ? `<div style="background: #fff3cd; padding: 12px; border-radius: 8px; margin-top: 16px;">
          <strong>📝 Notas de cocina:</strong><br/>
          ${kitchen_notes}
        </div>`
      : "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ea580c, #f97316); color: white; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 24px; }
          .badge { display: inline-block; background: #ea580c; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .total { font-size: 24px; font-weight: bold; color: #ea580c; text-align: right; padding: 16px 0; border-top: 2px solid #ea580c; }
          .customer-info { background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 16px 0; }
          .footer { text-align: center; padding: 16px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌮 ¡Nuevo Pedido!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">TacoMaster</p>
          </div>
          <div class="content">
            <p><span class="badge">${modeText}</span></p>
            
            <div class="customer-info">
              <p style="margin: 0;"><strong>👤 Cliente:</strong> ${customer_name}</p>
              <p style="margin: 8px 0 0;"><strong>📞 Teléfono:</strong> <a href="tel:${customer_phone}">${customer_phone}</a></p>
              ${locationInfo}
            </div>

            <h3 style="margin-bottom: 8px;">Productos:</h3>
            <table>
              ${itemsHtml}
            </table>
            
            <div class="total">Total: $${total.toFixed(2)} MXN</div>
            
            ${notesHtml}
          </div>
          <div class="footer">
            <p>Pedido #${order_id.slice(0, 8)}</p>
            <p>Este email fue enviado automáticamente por TacoMaster</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TacoMaster <onboarding@resend.dev>",
        to: [notification_email],
        subject: `🌮 Nuevo pedido de ${customer_name} - $${total.toFixed(2)} MXN`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResponse: emailResult }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-new-order function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
