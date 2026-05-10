import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.26.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

// ─── Helpers ────────────────────────────────────────────────────────────────

async function claudeText(systemPrompt, userPrompt) {
  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });
  return msg.content[0].text;
}

async function generateVoice(text, voiceProvider = 'elevenlabs') {
  if (voiceProvider === 'elevenlabs') {
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
      method: 'POST',
      headers: {
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });
    if (!res.ok) throw new Error(`ElevenLabs error: ${await res.text()}`);
    const buffer = await res.arrayBuffer();
    return { type: 'audio/mpeg', data: Buffer.from(buffer).toString('base64'), provider: 'elevenlabs' };
  }

  if (voiceProvider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'tts-1', input: text, voice: 'alloy' }),
    });
    if (!res.ok) throw new Error(`OpenAI TTS error: ${await res.text()}`);
    const buffer = await res.arrayBuffer();
    return { type: 'audio/mpeg', data: Buffer.from(buffer).toString('base64'), provider: 'openai' };
  }

  throw new Error('Unknown voice provider');
}

async function searchPixabay(query, type = 'video') {
  const key = Deno.env.get('PIXABAY_API_KEY');
  const url = type === 'video'
    ? `https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(query)}&per_page=5`
    : `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=photo&per_page=5`;
  const res = await fetch(url);
  const data = await res.json();
  if (type === 'video') {
    return (data.hits || []).slice(0, 3).map(h => ({ url: h.videos?.medium?.url || h.videos?.small?.url, thumb: h.userImageURL, tags: h.tags }));
  }
  return (data.hits || []).slice(0, 3).map(h => ({ url: h.largeImageURL, thumb: h.previewURL, tags: h.tags }));
}

async function generateDIDPresenter(script, audioBase64 = null) {
  const body = {
    script: { type: 'text', input: script, provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' } },
    config: { fluent: true, pad_audio: 0.0 },
    source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg',
  };
  if (audioBase64) {
    body.script = { type: 'audio', audio_url: `data:audio/mpeg;base64,${audioBase64}` };
  }
  const res = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${btoa(Deno.env.get('DID_API_KEY') + ':')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { id: data.id, status: 'processing' };
}

async function generateBrollImages(keywords) {
  const results = [];
  for (const kw of keywords.slice(0, 3)) {
    const videos = await searchPixabay(kw, 'video');
    const images = await searchPixabay(kw, 'photo');
    results.push({ keyword: kw, videos, images });
  }
  return results;
}

// ─── Pipeline stages ────────────────────────────────────────────────────────

async function stageScript(instruction) {
  const script = await claudeText(
    'You are a professional video scriptwriter. Create engaging, clear scripts. Return JSON with: { title, duration_seconds, script_text, sections: [{title, content, duration}], keywords: string[] }',
    `Create a video script for: "${instruction}"`
  );
  return JSON.parse(script.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

async function stageReview(script) {
  const review = await claudeText(
    'You are a video production reviewer. Review scripts and return JSON: { score: 1-10, issues: string[], improvements: string[], approved: boolean }',
    `Review this video script:\n${JSON.stringify(script, null, 2)}`
  );
  return JSON.parse(review.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

async function stageBroll(keywords) {
  return await generateBrollImages(keywords);
}

async function stageVoice(scriptText, provider) {
  return await generateVoice(scriptText.slice(0, 2500), provider);
}

async function stageCharacter(scriptText, audioData) {
  return await generateDIDPresenter(scriptText.slice(0, 500), audioData?.data);
}

async function stageAssemble(script, broll, voice, character) {
  const plan = await claudeText(
    'You are a video editor AI. Create an assembly plan. Return JSON: { timeline: [{t: number, type: "presenter"|"broll"|"text", content: string, duration: number}], total_duration: number, subtitles: [{start: number, end: number, text: string}] }',
    `Assemble this video:
Script: ${JSON.stringify(script?.sections?.slice(0, 3))}
B-roll available: ${JSON.stringify(broll?.map(b => b.keyword))}
Has voice: ${!!voice}
Has character: ${!!character}`
  );
  return JSON.parse(plan.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

// ─── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { instruction, voiceProvider = 'elevenlabs', stage } = await req.json();

  if (!instruction) return Response.json({ error: 'instruction required' }, { status: 400 });

  const results = {};

  try {
    // STAGE 1: Script
    results.stage = 'script';
    results.script = await stageScript(instruction);
    results.stagesDone = ['script'];

    // STAGE 2: Review
    results.stage = 'review';
    results.review = await stageReview(results.script);
    results.stagesDone.push('review');

    // STAGE 3: B-roll
    results.stage = 'broll';
    results.broll = await stageBroll(results.script.keywords || ['technology', 'business']);
    results.stagesDone.push('broll');

    // STAGE 4: Voice
    results.stage = 'voice';
    results.voice = await stageVoice(results.script.script_text, voiceProvider);
    results.stagesDone.push('voice');

    // STAGE 5: Character (D-ID)
    results.stage = 'character';
    results.character = await stageCharacter(results.script.script_text, results.voice);
    results.stagesDone.push('character');

    // STAGE 6: Assemble
    results.stage = 'assemble';
    results.assembly = await stageAssemble(results.script, results.broll, results.voice, results.character);
    results.stagesDone.push('assemble');

    // STAGE 7: Done
    results.stage = 'done';
    results.stagesDone.push('render', 'done');

    return Response.json({ success: true, ...results });
  } catch (err) {
    return Response.json({ success: false, error: err.message, stage: results.stage, partial: results }, { status: 500 });
  }
});