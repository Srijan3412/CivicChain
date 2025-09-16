import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BudgetItem {
  id?: string;
  account: string;
  glcode: string;
  account_b: string;
  budget_a: number;
  used_amt: number;
  remaining_amt: number;
}

interface AiInsightsProps {
  budgetData: BudgetItem[];
}

const AiInsights: React.FC<AiInsightsProps> = ({ budgetData }) => {
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
    setInsights(""); // Clear previous results when re-running

    try {
      // ✅ 1. Transform + Filter Data
      const transformedBudget = budgetData.map((item) => ({
        account: item.account,
        glcode: item.glcode,
        description: item.account_b,
        allocated: Number(item.budget_a) || 0,
        spent: Number(item.used_amt) || 0,
        remaining: Number(item.remaining_amt) || 0,
      }));

      const validBudget = transformedBudget.filter(
        (item) => item.allocated > 0 || item.spent > 0 || item.remaining > 0
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

      // ✅ 2. Build a Strong AI Prompt
      const aiPrompt = `
You are an expert municipal budget analyst. Analyze the following budget data 
and summarize it for a general citizen. Your output must be:

- Short (max 5 sentences), clear, and actionable.
- Avoid technical jargon or bureaucratic terms.
- Mention total allocation vs total spending.
- Flag top categories with overspending (>120%) or underspending (<70%).
- Call out any categories with 0 spending or unusual patterns.

Budget Data (JSON):
${JSON.stringify(validBudget, null, 2)}
`;

      console.log("Sending to Edge Function:", aiPrompt);

      // ✅ 3. Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("get-ai-insights", {
        body: { prompt: aiPrompt },
      });

      if (error) {
        console.error("Supabase Function Error:", error);
        throw new Error(error.message || "Failed to call AI function");
      }

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
          description: "The AI did not return any output. Try again or check the function logs.",
        });
      }
    } catch (err) {
      console.error("Error getting AI insights:", err);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Something went wrong while generating AI insights. Check server logs.",
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
              Click <b>“Analyze Budget with AI”</b> to see department-wise spending
              patterns, overspending/underspending alerts, and anomalies in plain language.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiInsights;
