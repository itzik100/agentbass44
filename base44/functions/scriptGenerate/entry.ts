import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.26.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { topic, keywords = [], duration = 60, language = 'hebrew' } = await req.json();
  if (!topic) return Response.json({ error: 'topic required' }, { status: 400 });

  const langNote = language === 'hebrew' ? 'Write all text content in Hebrew.' : 'Write all text content in English.';

  const prompt = `You are a professional video scriptwriter. ${langNote}

Create a complete video script for the topic: "${topic}"
Keywords to include: ${keywords.join(', ') || 'none'}
Target duration: ${duration} seconds

Return a JSON object with this exact structure:
{
  "title": "video title",
  "total_duration": number (seconds),
  "sections": [
    {
      "id": "section_1",
      "type": "intro" | "main" | "broll" | "outro",
      "title": "section title",
      "duration": number (seconds),
      "narration": "full voiceover text for this section",
      "visuals": "description of what should be shown visually",
      "broll_keywords": ["keyword1", "keyword2"],
      "screen_texts": [
        { "text": "text to display on screen", "timing": "start" | "middle" | "end", "style": "title" | "subtitle" | "caption" }
      ]
    }
  ],
  "full_narration": "complete narration text for the entire video"
}

Make it engaging, professional, and well-structured. Aim for ${Math.ceil(duration / 15)} sections.`;

  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = msg.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const script = JSON.parse(raw);

  return Response.json({ success: true, script });
});