export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // NOTE: Grok chưa cung cấp API denoising/clean audio output (chỉ STT rất mạnh với noisy audio).
  // Trong tương lai có thể kết hợp Voice Agent hoặc external tool.
  // Hiện tại giữ simulate để pipeline hoạt động mượt cho MVP.
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    
    if (!file) return new NextResponse("No file provided", { status: 400 });

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const buffer = await file.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.type || 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="cleaned_audio.mp3"',
      },
    });
  } catch (error) {
    return new NextResponse("Error processing audio", { status: 500 });
  }
}