import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateCouponRequest {
  code: string;
  companyId: string;
  orderTotal: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Não autorizado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Usuário não autenticado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { code, companyId, orderTotal }: ValidateCouponRequest = await req.json();

    console.log(`Validating coupon ${code} for user ${user.id}, company ${companyId}, total ${orderTotal}`);

    // Use service role for backend validation
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch coupon
    const { data: coupons, error: couponError } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .limit(1);

    if (couponError) {
      console.error("Error fetching coupon:", couponError);
      throw couponError;
    }

    const coupon = coupons?.[0];
    if (!coupon) {
      return new Response(
        JSON.stringify({ success: false, error: "Cupom inválido ou não encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if coupon is for this company or is global
    if (coupon.company_id && coupon.company_id !== companyId) {
      return new Response(
        JSON.stringify({ success: false, error: "Cupom não válido para este restaurante" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return new Response(
        JSON.stringify({ success: false, error: "Cupom ainda não está válido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return new Response(
        JSON.stringify({ success: false, error: "Cupom expirado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return new Response(
        JSON.stringify({ success: false, error: "Cupom esgotado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check minimum order value
    if (coupon.min_order_value && orderTotal < coupon.min_order_value) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Pedido mínimo de R$ ${coupon.min_order_value.toFixed(2).replace(".", ",")} para usar este cupom`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // CRITICAL: Check if user has already used this coupon (backend guarantee)
    const { data: existingUsage, error: usageError } = await supabaseAdmin
      .from("coupon_usage")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_id", user.id)
      .limit(1);

    if (usageError) {
      console.error("Error checking coupon usage:", usageError);
      throw usageError;
    }

    if (existingUsage && existingUsage.length > 0) {
      console.log(`User ${user.id} already used coupon ${coupon.id}`);
      return new Response(
        JSON.stringify({ success: false, error: "Você já utilizou este cupom anteriormente" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = orderTotal * (coupon.discount_value / 100);
    } else {
      discount = Math.min(coupon.discount_value, orderTotal);
    }

    console.log(`Coupon ${code} validated successfully, discount: ${discount}`);

    return new Response(
      JSON.stringify({
        success: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
        },
        discount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error validating coupon:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
