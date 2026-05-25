import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { put } from '@vercel/blob';
import { apiResponse } from '@/lib/security';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return apiResponse('No file uploaded', 400);
    }

    // Restrict to allowed mime types (audios, images, videos)
    const allowedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return apiResponse('Unsupported file type', 400);
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload using Vercel Blob server-side SDK
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true
    });

    return NextResponse.json({ url: blob.url, name: file.name });
  } catch (error: any) {
    console.error('[MOBILE_UPLOAD_ERROR]:', error);
    return apiResponse(error.message || 'Internal upload error', 500);
  }
}
