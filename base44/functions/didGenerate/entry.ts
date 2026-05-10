import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DID_API_KEY = Deno.env.get('DID_API_KEY');
const AUTH = `Basic ${btoa(DID_API_KEY + ':')}`;

async function pollTalk(talkId) {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: { Authorization: AUTH },
    });
    const data = await res.json();
    if (data.status === 'done') return data.result_url;
    if (data.status === 'error') throw new Error(data.error?.description || 'D-ID error');
  }
  throw new Error('D-ID timeout');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, avatarUrl, voiceProvider = 'microsoft', voiceId = 'en-US-JennyNeural' } = await req.json();
  if (!text || !avatarUrl) return Response.json({ error: 'text and avatarUrl required' }, { status: 400 });

  // Step 1: If voiceProvider is elevenlabs, generate audio first
  let scriptPayload;
  if (voiceProvider === 'elevenlabs') {
    const ttsRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
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
    if (!ttsRes.ok) throw new Error(`ElevenLabs error: ${await ttsRes.text()}`);
    const buffer = await ttsRes.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    scriptPayload = { type: 'audio', audio_url: `data:audio/mpeg;base64,${audioBase64}` };
  } else {
    scriptPayload = {
      type: 'text',
      input: text,
      provider: { type: 'microsoft', voice_id: voiceId },
    };
  }

  // Step 2: Create D-ID talk
  const createRes = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_url: avatarUrl,
      script: scriptPayload,
      config: { fluent: true, pad_audio: 0.0 },
    }),
  });

  const createData = await createRes.json();
  if (!createData.id) return Response.json({ error: createData.message || 'D-ID failed' }, { status: 500 });

  // Step 3: Poll for result
  const videoUrl = await pollTalk(createData.id);
  return Response.json({ videoUrl });
});