import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const VERSION = "v2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${VERSION}] delete-coupon called`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify caller's auth token using admin client
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Unauthorized: missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !requestingUser) {
      console.error(`[${VERSION}] Auth error:`, authError);
      throw new Error("Unauthorized: invalid token");
    }

    console.log(`[${VERSION}] Authenticated user:`, requestingUser.id);

    // Check if requesting user is admin
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      throw new Error("Only admins can delete coupons");
    }

    // Get request body
    const { couponId } = await req.json();

    if (!couponId) {
      throw new Error("Coupon ID is required");
    }

    console.log(`[${VERSION}] Deleting coupon:`, couponId);

    // First, update orders to remove the coupon association
    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .update({ coupon_id: null })
      .eq("coupon_id", couponId);

    if (orderError) {
      console.error(`[${VERSION}] Error updating orders:`, orderError);
      throw orderError;
    }

    // Now, delete related coupon_usage records
    const { error: usageError } = await supabaseAdmin
      .from("coupon_usage")
      .delete()
      .eq("coupon_id", couponId);

    if (usageError) {
      console.error(`[${VERSION}] Error deleting coupon usage:`, usageError);
      throw usageError;
    }

    // Finally, delete the coupon
    const { error: deleteError } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", couponId);

    if (deleteError) {
      console.error(`[${VERSION}] Error deleting coupon:`, deleteError);
      throw deleteError;
    }

    console.log(`[${VERSION}] Coupon deleted successfully:`, couponId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Coupon deleted successfully",
        _version: VERSION,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error deleting coupon";
    console.error(`[${VERSION}] Error in delete-coupon function:`, error);
    return new Response(
      JSON.stringify({ error: errorMessage, _version: VERSION }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
