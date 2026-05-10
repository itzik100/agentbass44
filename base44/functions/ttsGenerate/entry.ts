import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { text } = await req.json();
  if (!text) return Response.json({ error: 'text required' }, { status: 400 });

  const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
    method: 'POST',
    headers: {
      'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: `ElevenLabs error: ${err}` }, { status: 500 });
  }

  const buffer = await res.arrayBuffer();
  const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

  return Response.json({ audioBase64, mimeType: 'audio/mpeg' });
});