import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, duration, referenceImageBase64, mode } = await req.json();
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'XAI_API_KEY is not configured.' }, { status: 500 });
    }

    if (!prompt && !referenceImageBase64) {
      return NextResponse.json({ error: 'Prompt or reference image is required.' }, { status: 400 });
    }

    const payload: any = {
      model: "grok-imagine-video",
      prompt: prompt || 'Generate a video',
      duration: duration ? parseInt(duration) : 5,
    };

    if (referenceImageBase64) {
      if (mode === 'flow') {
        payload.video = {
          url: referenceImageBase64
        };
      } else {
        payload.image = {
          url: referenceImageBase64
        };
      }
    }

    const endpoint = mode === 'flow' 
      ? 'https://api.x.ai/v1/videos/extensions' 
      : 'https://api.x.ai/v1/videos/generations';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('XAI API Video Error:', errorData);
      return NextResponse.json({ error: 'Failed to initiate video generation', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ request_id: data.request_id });

  } catch (error: any) {
    console.error('Generate Video Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
