import type { VercelRequest, VercelResponse } from '@vercel/node';

const OUTFIT_PROMPTS: Record<string, string> = {
  "button-down-shirt": "a tailored button-down shirt with collar, buttons down the front, and proper sleeves",
  "frock": "an elegant frock dress with a fitted bodice and flowing skirt",
  "kurta": "a traditional kurta — a long loose tunic top reaching mid-thigh with subtle neckline embroidery",
  "kameez": "a traditional kameez — a long tunic top with classic neckline",
  "shalwar-kameez": "a complete shalwar kameez outfit — a long kameez tunic paired with loose shalwar trousers",
  "pants": "well-tailored pants/trousers",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { personImage, clothImage, outfitType, color, colorName } = req.body;

    if (!personImage || !outfitType || (!clothImage && !color)) {
      return res.status(400).json({ error: "Need person image, outfit type, and either a cloth image or a color" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on Vercel' });
    }

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY.trim()}`
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash-image",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(500).json({ error: 'AI generation failed via direct provider' });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return res.status(500).json({ error: "No image generated. Try different photos." });
    }

    return res.status(200).json({ image: imageUrl });
  } catch (e) {
    console.error("tryon error:", e);
    return res.status(500).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}