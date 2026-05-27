import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { bookingId, userEmail, userName, itemName, checkIn, checkOut, guests, totalPrice, bookingType } = await req.json();

    if (!bookingId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: bookingId, userEmail" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subject = `Booking Confirmation - ${itemName || "Your Trip"}`;
    const html = `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; font-size: 24px; margin: 0;">WanderLux</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Booking Confirmation</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 8px;">Hello ${userName || "Traveler"}!</h2>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Your booking has been confirmed. Here are the details:</p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280;">Booking ID</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${bookingId.slice(0, 8).toUpperCase()}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Type</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; text-transform: capitalize;">${bookingType}</td></tr>
              ${itemName ? `<tr><td style="padding: 8px 0; color: #6b7280;">${bookingType === "hotel" ? "Hotel" : "Package"}</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${itemName}</td></tr>` : ""}
              ${checkIn ? `<tr><td style="padding: 8px 0; color: #6b7280;">Check-in</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${checkIn}</td></tr>` : ""}
              ${checkOut ? `<tr><td style="padding: 8px 0; color: #6b7280;">Check-out</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${checkOut}</td></tr>` : ""}
              ${guests ? `<tr><td style="padding: 8px 0; color: #6b7280;">Guests</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${guests}</td></tr>` : ""}
              ${totalPrice ? `<tr><td style="padding: 12px 0; color: #0284c7; font-weight: 700; font-size: 18px;">Total</td><td style="padding: 12px 0; color: #0284c7; font-weight: 700; font-size: 18px; text-align: right;">$${Number(totalPrice).toLocaleString()}</td></tr>` : ""}
            </table>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">We'll notify you when your booking status is updated. If you have any questions, feel free to contact our support team.</p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wanderlux.travel" style="background: #0284c7; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">View My Bookings</a>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">WanderLux Travel | Explore The World's Hidden Wonders</p>
        </div>
      </div>
    `;

    console.log(`Booking notification prepared for ${userEmail}: ${subject}`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification processed", email: userEmail, subject }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
