const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { photo, outfitType } = await req.json();
    if (!photo || !outfitType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert fashion color stylist. Analyze the person's skin tone from the image and recommend flattering colors for the requested outfit. Be precise and concise.`;
    const userPrompt = `Analyze the skin tone in this photo and recommend 3 colors that would look best on this person wearing a ${outfitType}. Categorize their skin tone as one of: fair, medium, olive, dark.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: photo } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend_colors",
            description: "Return skin tone analysis and color recommendations",
            parameters: {
              type: "object",
              properties: {
                skinTone: { type: "string", enum: ["fair", "medium", "olive", "dark"] },
                explanation: { type: "string", description: "1-2 sentence explanation of why these colors work" },
                colors: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "color name like 'Navy Blue'" },
                      hex: { type: "string", description: "hex code like #1A2B3C" },
                      reason: { type: "string", description: "short reason this color flatters them" },
                    },
                    required: ["name", "hex", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["skinTone", "explanation", "colors"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend_colors" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "No recommendations generated" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const args = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("style-recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
