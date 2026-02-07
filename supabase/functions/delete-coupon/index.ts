import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get the authorization header to verify admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    // Create client with user's token to check if they're admin
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { authorization: authHeader } },
    });

    const { data: { user: requestingUser }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !requestingUser) {
      console.error("Auth error:", authError);
      throw new Error("Unauthorized");
    }

    // Check if requesting user is admin
    const { data: roles } = await supabaseUser
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

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // First, update orders to remove the coupon association
    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .update({ coupon_id: null })
      .eq("coupon_id", couponId);

    if (orderError) {
      console.error("Error updating orders:", orderError);
      throw orderError;
    }

    // Now, delete related coupon_usage records
    const { error: usageError } = await supabaseAdmin
      .from("coupon_usage")
      .delete()
      .eq("coupon_id", couponId);

    if (usageError) {
      console.error("Error deleting coupon usage:", usageError);
      throw usageError;
    }

    // Finally, delete the coupon
    const { error: deleteError } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", couponId);

    if (deleteError) {
      console.error("Error deleting coupon:", deleteError);
      throw deleteError;
    }

    console.log("Coupon deleted successfully:", couponId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Coupon deleted successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error deleting coupon";
    console.error("Error in delete-coupon function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
