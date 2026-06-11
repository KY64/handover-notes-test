import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from '../config.js';

const s3 = new S3Client({ region: config.awsRegion });

function safeExt(fileName: string, contentType: string) {
  const ext = extname(fileName).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return ext;
  if (contentType === 'image/png') return '.png';
  if (contentType === 'image/webp') return '.webp';
  if (contentType === 'image/gif') return '.gif';
  return '.jpg';
}

export async function uploadThreadImage(eventId: string, file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Only image uploads are supported');
  const key = `event-threads/${eventId}/${Date.now()}-${randomUUID()}${safeExt(file.name, file.type)}`;
  const body = Buffer.from(await file.arrayBuffer());
  await s3.send(new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: key,
    Body: body,
    ContentType: file.type,
  }));
  const baseUrl = config.s3PublicBaseUrl || `https://${config.s3Bucket}.s3.${config.awsRegion}.amazonaws.com`;
  return { key, url: `${baseUrl}/${key}` };
}
