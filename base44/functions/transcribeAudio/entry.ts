import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { audioUrl, audioBase64, mimeType = 'audio/mpeg' } = body;

  let audioBuffer;

  if (audioBase64) {
    const binary = atob(audioBase64);
    audioBuffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) audioBuffer[i] = binary.charCodeAt(i);
  } else if (audioUrl) {
    const res = await fetch(audioUrl);
    if (!res.ok) return Response.json({ error: 'Failed to fetch audio' }, { status: 400 });
    audioBuffer = new Uint8Array(await res.arrayBuffer());
  } else {
    return Response.json({ error: 'audioUrl or audioBase64 required' }, { status: 400 });
  }

  const blob = new Blob([audioBuffer], { type: mimeType });
  const formData = new FormData();
  formData.append('file', blob, 'audio.mp3');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');

  const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
    body: formData,
  });

  if (!whisperRes.ok) {
    const err = await whisperRes.text();
    return Response.json({ error: `Whisper error: ${err}` }, { status: 500 });
  }

  const data = await whisperRes.json();

  // Build subtitle segments from words (group ~5 words per segment)
  const words = data.words || [];
  const segments = [];
  const GROUP_SIZE = 5;

  for (let i = 0; i < words.length; i += GROUP_SIZE) {
    const chunk = words.slice(i, i + GROUP_SIZE);
    segments.push({
      id: `sub_${i}`,
      text: chunk.map(w => w.word).join(' ').trim(),
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
    });
  }

  // Fallback: use Whisper segments if no word timestamps
  if (segments.length === 0 && data.segments) {
    data.segments.forEach((seg, i) => {
      segments.push({ id: `sub_${i}`, text: seg.text.trim(), start: seg.start, end: seg.end });
    });
  }

  return Response.json({ success: true, segments, fullText: data.text });
});