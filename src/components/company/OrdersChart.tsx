import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrdersChart, PeriodFilter, useCompanyCategories } from "@/hooks/useOrdersChart";
import { BarChart3 } from "lucide-react";

interface OrdersChartProps {
  companyId?: string;
  showCategoryFilter?: boolean;
}

export const OrdersChart = ({ companyId, showCategoryFilter = false }: OrdersChartProps) => {
  const [period, setPeriod] = useState<PeriodFilter>("7days");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { data: chartData, isLoading } = useOrdersChart(companyId, period, showCategoryFilter ? categoryFilter : undefined);
  const { data: categories } = useCompanyCategories();

  const periodLabels = {
    today: "Hoje",
    "7days": "7 dias",
    "30days": "30 dias",
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-primary" />
            Pedidos por Dia
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(periodLabels) as PeriodFilter[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
                className="text-xs"
              >
                {periodLabels[p]}
              </Button>
            ))}
          </div>
        </div>
        {showCategoryFilter && categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant={categoryFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
              className="text-xs"
            >
              Todas
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chartData && chartData.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "count") return [value, "Pedidos"];
                    return [`R$ ${value.toFixed(2)}`, "Faturamento"];
                  }}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhum pedido no período
          </div>
        )}
        {chartData && chartData.length > 0 && (
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Total Pedidos</p>
              <p className="font-bold text-lg">{chartData.reduce((sum, d) => sum + d.count, 0)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Faturamento</p>
              <p className="font-bold text-lg text-primary">
                R$ {chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
