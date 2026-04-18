import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const internalEndpoint = process.env.S3_ENDPOINT || "http://minio:9000";
const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || "http://localhost:9000";

export const s3Client = new S3Client({
  endpoint: internalEndpoint,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

const publicS3Client = new S3Client({
  endpoint: publicEndpoint,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

export const BUCKET_NAME = process.env.S3_BUCKET || "audiobooks";

export type MediaType = "audio" | "cover" | "video" | "subtitle";

export function getMediaPath(
  audiobookId: string,
  type: MediaType,
  filename: string
): string {
  return `${audiobookId}/${type}/${filename}`;
}

export async function generateSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(publicS3Client, command, { expiresIn });

  if (process.env.CDN_URL) {
    const url = new URL(signedUrl);
    const cdnUrl = new URL(process.env.CDN_URL);
    url.hostname = cdnUrl.hostname;
    url.protocol = cdnUrl.protocol;
    url.port = "";
    return url.toString();
  }

  return signedUrl;
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}
