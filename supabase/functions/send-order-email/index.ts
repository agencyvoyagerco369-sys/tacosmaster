import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  customer_name: string;
  address: string;
  reference: string;
  order_summary: string;
  total_amount: string;
  payment_method: string;
  customer_phone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: OrderEmailRequest = await req.json();

    const serviceId = Deno.env.get("VITE_EMAILJS_SERVICE_ID");
    const templateId = Deno.env.get("VITE_EMAILJS_TEMPLATE_ID");
    const publicKey = Deno.env.get("VITE_EMAILJS_PUBLIC_KEY");

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS credentials not configured");
      return new Response(
        JSON.stringify({ error: "EmailJS credentials not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // EmailJS API endpoint
    const emailjsUrl = "https://api.emailjs.com/api/v1.0/email/send";

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        customer_name: emailData.customer_name,
        address: emailData.address,
        reference: emailData.reference,
        order_summary: emailData.order_summary,
        total_amount: emailData.total_amount,
        payment_method: emailData.payment_method,
        customer_phone: emailData.customer_phone,
      },
    };

    console.log("Sending email with payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(emailjsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("EmailJS response:", response.status, responseText);

    if (!response.ok) {
      throw new Error(`EmailJS error: ${response.status} - ${responseText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
