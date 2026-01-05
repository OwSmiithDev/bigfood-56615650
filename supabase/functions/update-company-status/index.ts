import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OpeningHours {
  [day: string]: {
    open: string; // "09:00"
    close: string; // "22:00"
    enabled: boolean;
  };
}

const dayMap: { [key: number]: string } = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

function isWithinOpeningHours(openingHours: OpeningHours | null): boolean {
  if (!openingHours) return false;

  const now = new Date();
  // Use Brazil timezone (UTC-3)
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  
  const dayOfWeek = brazilTime.getDay();
  const dayKey = dayMap[dayOfWeek];
  const dayConfig = openingHours[dayKey];

  if (!dayConfig || !dayConfig.enabled) {
    return false;
  }

  const currentHour = brazilTime.getHours();
  const currentMinute = brazilTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  const [openHour, openMinute] = dayConfig.open.split(":").map(Number);
  const [closeHour, closeMinute] = dayConfig.close.split(":").map(Number);

  const openTimeMinutes = openHour * 60 + openMinute;
  let closeTimeMinutes = closeHour * 60 + closeMinute;

  // Handle overnight hours (e.g., 18:00 - 02:00)
  if (closeTimeMinutes < openTimeMinutes) {
    // If current time is after opening OR before closing (next day)
    return currentTimeMinutes >= openTimeMinutes || currentTimeMinutes < closeTimeMinutes;
  }

  return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching companies with opening_hours...");

    // Fetch all companies that have opening_hours configured
    const { data: companies, error: fetchError } = await supabase
      .from("companies")
      .select("id, display_name, opening_hours, is_open");

    if (fetchError) {
      console.error("Error fetching companies:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${companies?.length || 0} companies to check`);

    const updates: { id: string; name: string; wasOpen: boolean; isNowOpen: boolean }[] = [];

    for (const company of companies || []) {
      const openingHours = company.opening_hours as OpeningHours | null;
      
      // Only auto-manage if opening_hours is configured
      if (openingHours && Object.keys(openingHours).length > 0) {
        const shouldBeOpen = isWithinOpeningHours(openingHours);
        
        if (company.is_open !== shouldBeOpen) {
          console.log(`Updating ${company.display_name}: ${company.is_open} -> ${shouldBeOpen}`);
          
          const { error: updateError } = await supabase
            .from("companies")
            .update({ is_open: shouldBeOpen })
            .eq("id", company.id);

          if (updateError) {
            console.error(`Error updating company ${company.id}:`, updateError);
          } else {
            updates.push({
              id: company.id,
              name: company.display_name,
              wasOpen: company.is_open,
              isNowOpen: shouldBeOpen,
            });
          }
        }
      }
    }

    console.log(`Updated ${updates.length} companies`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${companies?.length || 0} companies, updated ${updates.length}`,
        updates,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in update-company-status:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
