const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OUTFIT_PROMPTS: Record<string, string> = {
  "button-down-shirt": "a tailored button-down shirt with collar, buttons down the front, and proper sleeves",
  "frock": "an elegant frock dress with a fitted bodice and flowing skirt",
  "kurta": "a traditional kurta — a long loose tunic top reaching mid-thigh with subtle neckline embroidery",
  "kameez": "a traditional kameez — a long tunic top with classic neckline",
  "shalwar-kameez": "a complete shalwar kameez outfit — a long kameez tunic paired with loose shalwar trousers",
  "pants": "well-tailored pants/trousers",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { personImage, clothImage, outfitType, color, colorName } = await req.json();

    if (!personImage || !outfitType || (!clothImage && !color)) {
      return new Response(JSON.stringify({ error: "Need person image, outfit type, and either a cloth image or a color" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const outfitDesc = OUTFIT_PROMPTS[outfitType] ?? outfitType;
    const colorPhrase = color ? ` The garment color must be ${colorName ? `${colorName} (${color})` : color}.` : "";

    let prompt: string;
    if (clothImage && color) {
      prompt = `Create a photorealistic virtual try-on image. Take the person from the FIRST image and dress them in ${outfitDesc}. Use the fabric texture and pattern from the SECOND image, but recolor the garment to ${colorName ? `${colorName} (${color})` : color} — the final outfit color must clearly match this hex. Preserve the person's face, body, pose, skin tone, hair, and background exactly. Realistic folds, lighting and shadows. Output a single high-quality photo.`;
    } else if (clothImage) {
      prompt = `Create a photorealistic virtual try-on image. Take the person from the FIRST image and dress them in ${outfitDesc}. Use the fabric, color, and pattern from the SECOND image as the material for this garment. Preserve the person's face, body, pose, skin tone, hair, and background exactly. The new garment should fit naturally with realistic folds, lighting, and shadows that match the original photo. Keep the person's identity completely unchanged. Output a single high-quality photo.`;
    } else {
      prompt = `Create a photorealistic virtual try-on image. Take the person from the image and dress them in ${outfitDesc}.${colorPhrase} Use a clean, natural fabric appropriate for this outfit type. Preserve the person's face, body, pose, skin tone, hair, and background exactly. Realistic folds, lighting and shadows. Keep the person's identity completely unchanged. Output a single high-quality photo.`;
    }

    const content: any[] = [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: personImage } }];
    if (clothImage) content.push({ type: "image_url", image_url: { url: clothImage } });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
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
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "No image generated. Try different photos." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image: imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tryon error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
