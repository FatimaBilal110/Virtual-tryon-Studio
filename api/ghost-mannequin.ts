import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const { garmentImage, gender = 'female', bodyType = 'regular' } = req.body;
    if (!garmentImage) {
      return res.status(400).json({ error: 'Missing garment image' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on Vercel' });
    }

    const prompt = `Create a professional e-commerce catalog photo. Take the garment shown in this image (which may be on a hanger, flat lay, or mannequin) and place it on a realistic ${bodyType}-build ${gender} fashion model. The model should have a natural, confident pose suitable for a clothing brand catalog. Use clean studio lighting with a soft neutral background (light gray or off-white). Preserve the exact texture, color, pattern, fabric details, and fit of the garment. The result should look like a high-end professional product photoshoot — sharp, well-lit, full-body or 3/4 body shot, photorealistic. Output a single high-quality image.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY.trim()}`
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-image',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: garmentImage } },
          ],
        }],
        modalities: ['image', 'text'],
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
      return res.status(500).json({ error: 'No image generated. Try a clearer garment photo.' });
    }

    return res.status(200).json({ image: imageUrl });
  } catch (e) {
    console.error('ghost-mannequin error:', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
}