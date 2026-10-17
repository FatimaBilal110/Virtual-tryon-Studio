import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS Preflight
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
    const { photo, outfitType } = req.body;
    if (!photo || !outfitType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on Vercel' });
    }

    const systemPrompt = `You are an expert fashion color stylist. Analyze the person's skin tone from the image and recommend flattering colors for the requested outfit. Be precise and concise.`;
    const userPrompt = `Analyze the skin tone in this photo and recommend 3 colors that would look best on this person wearing a ${outfitType}. Categorize their skin tone as one of: fair, medium, olive, dark.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY.trim()}`
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: "image_url", image_url: { url: photo } },
            ],
          },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'recommend_colors',
            description: 'Return skin tone analysis and color recommendations',
            parameters: {
              type: 'object',
              properties: {
                skinTone: { type: 'string', enum: ['fair', 'medium', 'olive', 'dark'] },
                explanation: { type: 'string', description: '1-2 sentence explanation of why these colors work' },
                colors: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: "color name like 'Navy Blue'" },
                      hex: { type: 'string', description: "hex code like #1A2B3C" },
                      reason: { type: 'string', description: 'short reason this color flatters them' },
                    },
                    required: ['name', 'hex', 'reason'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['skinTone', 'explanation', 'colors'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'recommend_colors' } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(500).json({ error: 'AI analysis failed via direct provider' });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return res.status(500).json({ error: 'No recommendations generated' });
    }
    
    const args = JSON.parse(toolCall.function.arguments);
    return res.status(200).json(args);
  } catch (e) {
    console.error('style-recommend error:', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
}