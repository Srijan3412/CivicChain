import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ Securely load API key from environment
    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");

    if (!deepseekApiKey) {
      return new Response(
        JSON.stringify({ error: "DeepSeek API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { budgetData, department } = await req.json();

    if (!budgetData || !department) {
      return new Response(
        JSON.stringify({ error: "Budget data and department are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Format data
    const formattedData = budgetData.map((item: any) => ({
      category: item.category,
      amount: item.amount,
      percentage: (
        (item.amount /
          budgetData.reduce(
            (sum: number, b: any) => sum + Number(b.amount),
            0,
          )) *
        100
      ).toFixed(1),
    }));

    const prompt = `You are an AI analyzing municipal budget data for transparency.
Department: ${department}
Budget Data: ${JSON.stringify(formattedData, null, 2)}

Provide:
- 3-line summary of key spending for this department
- Highlight anomalies or overspending within categories
- Suggest optimization areas

Respond in plain English, no code blocks.`;

    console.log("📤 Sending request to DeepSeek API...");

    // ✅ DeepSeek API call
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ DeepSeek API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI insights from DeepSeek", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    console.log("✅ DeepSeek API response:", data);

    const insights = data.choices?.[0]?.message?.content || "No insights returned.";

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("💥 Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
