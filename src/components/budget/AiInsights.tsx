import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BudgetItem {
  id: string;
  account: string;
  glcode: string;
  account_budget: string;
  budget_a: number | string;
  used_amt: number | string;
  remaining_amt: number | string;
}

interface AiInsightsProps {
  budgetData: BudgetItem[];
  department: string;
}

const AiInsights: React.FC<AiInsightsProps> = ({ budgetData, department }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAiInsights = async () => {
    if (!budgetData?.length) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'Please fetch budget data first before analyzing.',
      });
      return;
    }

    if (!department) {
      toast({
        variant: 'destructive',
        title: 'Missing Department',
        description: 'Please select a department before analyzing.',
      });
      return;
    }

    setLoading(true);
    setInsights(''); // clear previous result

    try {
      // ✅ Convert numeric fields to numbers safely
      const formattedData = budgetData.map((item) => ({
        id: item.id,
        account: item.account,
        glcode: item.glcode,
        account_budget: item.account_budget,
        budget_a: Number(item.budget_a) || 0,
        used_amt: Number(item.used_amt) || 0,
        remaining_amt: Number(item.remaining_amt) || 0,
      }));

      console.log('📤 Sending to AI Edge Function:', JSON.stringify({ department, budgetData: formattedData }, null, 2));

      const { data, error } = await supabase.functions.invoke('get-ai-insights', {
        body: { budgetData: formattedData, department },
      });

      if (error) {
        console.error('❌ Supabase Edge Function error:', error);
        throw new Error(error.message || 'Unknown edge function error');
      }

      if (!data?.insights) {
        throw new Error('AI did not return any insights.');
      }

      setInsights(data.insights);

      toast({
        title: 'AI Analysis Complete',
        description: 'Generated insights for your budget data.',
      });
    } catch (err: any) {
      console.error('💥 Error getting AI insights:', err);

      if (err?.message?.includes('429') || err?.status === 429) {
        toast({
          variant: 'destructive',
          title: 'Quota Limit Reached',
          description: 'You have reached your Gemini API request limit. Please try again later.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: err?.message || 'Failed to generate AI insights. Please try again.',
        });
      }
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
            disabled={loading || !budgetData?.length}
            className="w-full md:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Analyzing...' : 'Analyze Budget with AI'}
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
              Click the button above to get AI-powered insights about allocated
              budget, spending usage, and remaining amounts. The analysis will
              also highlight anomalies and optimization opportunities.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiInsights;
