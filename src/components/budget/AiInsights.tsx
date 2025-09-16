// Supabase Edge Function: get-ai-insights
// Handles AI analysis for budget data using Google Gemini

Deno.serve(async (req) => {
  try {
    // 1️⃣ Parse Request Body
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing prompt" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2️⃣ Get Gemini API Key from Environment
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("❌ Missing GEMINI_API_KEY in environment variables");
      return new Response(
        JSON.stringify({ error: "Server misconfigured: Missing GEMINI_API_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3️⃣ Call Gemini API
    console.log("📤 Sending prompt to Gemini API...");
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    // 4️⃣ Handle Non-OK Responses
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("❌ Gemini API Error Response:", errorText);
      return new Response(
        JSON.stringify({
          error: "Gemini API call failed",
          status: geminiResponse.status,
          details: errorText,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5️⃣ Extract Gemini Output
    const data = await geminiResponse.json();
    console.log("✅ Gemini API Raw Response:", data);

    const insights =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No insights generated.";

    return new Response(JSON.stringify({ insights }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("🔥 Unhandled Error in get-ai-insights:", err);
    return new Response(
      JSON.stringify({
        error: "Edge Function crashed",
        details: err.message || "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
