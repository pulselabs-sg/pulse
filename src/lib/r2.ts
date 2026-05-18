import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Required for Cloudflare R2 to prevent SSL handshake errors
});

export async function uploadBufferToR2(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  if (!process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
    throw new Error("R2_BUCKET_NAME or R2_PUBLIC_URL is not configured.");
  }

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return the public URL to the uploaded file
  const publicUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
  return `${publicUrl}/${filename}`;
}
