import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export type PeriodFilter = "today" | "7days" | "30days";

interface OrderChartData {
  date: string;
  label: string;
  count: number;
  revenue: number;
}

export const useOrdersChart = (
  companyId?: string,
  period: PeriodFilter = "7days",
  categoryFilter?: string
) => {
  return useQuery({
    queryKey: ["orders-chart", companyId, period, categoryFilter],
    queryFn: async (): Promise<OrderChartData[]> => {
      const today = new Date();
      let startDate: Date;
      
      switch (period) {
        case "today":
          startDate = startOfDay(today);
          break;
        case "7days":
          startDate = subDays(today, 6);
          break;
        case "30days":
          startDate = subDays(today, 29);
          break;
        default:
          startDate = subDays(today, 6);
      }

      let query = supabase
        .from("orders")
        .select("created_at, total, company_id, companies!inner(category)")
        .gte("created_at", startDate.toISOString());

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("companies.category", categoryFilter);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      // Generate all days in the interval
      const days = eachDayOfInterval({ start: startDate, end: today });
      
      // Initialize data for all days
      const chartData: OrderChartData[] = days.map(day => ({
        date: format(day, "yyyy-MM-dd"),
        label: period === "today" 
          ? "Hoje"
          : format(day, "dd/MM", { locale: ptBR }),
        count: 0,
        revenue: 0,
      }));

      // Aggregate orders by date
      orders?.forEach(order => {
        const orderDate = format(new Date(order.created_at), "yyyy-MM-dd");
        const dayData = chartData.find(d => d.date === orderDate);
        if (dayData) {
          dayData.count += 1;
          dayData.revenue += order.total;
        }
      });

      return chartData;
    },
    enabled: true,
  });
};

export const useCompanyCategories = () => {
  return useQuery({
    queryKey: ["company-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data?.map(c => c.category).filter(Boolean))];
      return uniqueCategories as string[];
    },
  });
};
