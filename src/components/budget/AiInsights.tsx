import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BudgetItem {
  id: string;
  glcode: string;
  account_budget: number;
  used_amt: number;
  remaining_amt: number;
  created_at?: string;
}

interface AiInsightsProps {
  budgetData: BudgetItem[];
  department: string;
  ward: string; // ✅ added
  year?: number;
}

const AiInsights: React.FC<AiInsightsProps> = ({ budgetData, department, ward, year }) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAiInsights = async () => {
    if (!budgetData || budgetData.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data Found",
        description: "Please fetch the department budget data first.",
      });
      return;
    }

    setLoading(true);

    try {
      const transformedBudget = budgetData.map((item) => ({
        glcode: item.glcode,
        account_budget: Number(item.account_budget) || 0,
        used_amt: Number(item.used_amt) || 0,
        remaining_amt: Number(item.remaining_amt) || 0,
      }));

      // ✅ filter out completely empty rows
      const validBudget = transformedBudget.filter(
        (item) => item.account_budget !== 0 || item.used_amt !== 0 || item.remaining_amt !== 0
      );

      if (validBudget.length === 0) {
        toast({
          variant: "destructive",
          title: "No Valid Data",
          description: "All budget amounts are zero. Please import valid data first.",
        });
        setLoading(false);
        return;
      }

      const currentYear = year || new Date().getFullYear();

      console.log("Payload sent to get-ai-insights:", {
        department,
        ward,
        year: currentYear,
        budgetData: validBudget,
      });

      const { data, error } = await supabase.functions.invoke("get-ai-insights", {
        body: {
          department,
          ward,
          year: currentYear,
          budgetData: validBudget,
        },
      });

      if (error) throw error;

      if (data?.insights) {
        setInsights(data.insights);
        toast({
          title: "AI Analysis Complete",
          description: "Insights generated successfully for this department.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "No Insights Generated",
          description: "The AI function returned no insights.",
        });
      }
    } catch (err) {
      console.error("Error getting AI insights:", err);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Failed to generate AI insights. Please check server logs.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Budget Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={getAiInsights}
            disabled={loading || !budgetData.length}
            className="w-full md:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Analyzing..." : "Analyze Budget with AI"}
          </Button>

          {insights && (
            <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent animate-in slide-in-from-bottom-4 duration-500">
              <h4 className="font-semibold mb-2 text-accent-foreground">
                AI Analysis Results:
              </h4>
              <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                {insights}
              </div>
            </div>
          )}

          {!insights && !loading && (
            <p className="text-muted-foreground text-sm">
              Click "Analyze Budget with AI" to get insights on spending patterns,
              anomalies, and potential optimizations for this department.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiInsights;
