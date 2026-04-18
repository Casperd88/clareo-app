import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_BUCKET || "audiobooks";

async function deleteS3Folder(prefix: string): Promise<number> {
  let deleted = 0;

  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  });

  const listed = await s3Client.send(listCommand);

  if (!listed.Contents || listed.Contents.length === 0) {
    console.log(`No S3 objects found with prefix: ${prefix}`);
    return 0;
  }

  const objectsToDelete = listed.Contents.map((obj) => ({ Key: obj.Key }));

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: { Objects: objectsToDelete },
  });

  await s3Client.send(deleteCommand);
  deleted = objectsToDelete.length;

  console.log(`Deleted ${deleted} S3 objects with prefix: ${prefix}`);
  return deleted;
}

async function deleteAudiobook(audiobookId: string) {
  console.log(`\nDeleting audiobook: ${audiobookId}\n`);

  const audiobook = await prisma.audiobook.findUnique({
    where: { id: audiobookId },
    include: {
      chapters: true,
      author: true,
    },
  });

  if (!audiobook) {
    console.error(`Audiobook not found: ${audiobookId}`);
    process.exit(1);
  }

  console.log(`Found: "${audiobook.title}" by ${audiobook.author.name}`);
  console.log(`Chapters: ${audiobook.chapters.length}`);

  // Delete S3 assets
  console.log("\nDeleting S3 assets...");
  const s3Deleted = await deleteS3Folder(`${audiobookId}/`);

  // Delete from database (cascades to chapters, segments, library items, playback states, bookmarks)
  console.log("\nDeleting from database...");
  await prisma.audiobook.delete({
    where: { id: audiobookId },
  });

  console.log(`\nDeleted audiobook "${audiobook.title}"`);
  console.log(`  - Database records: removed (with cascade)`);
  console.log(`  - S3 objects: ${s3Deleted} deleted`);
}

async function main() {
  const audiobookId = process.argv[2];

  if (!audiobookId) {
    console.log("Usage: npx tsx scripts/delete-audiobook.ts <audiobook-id>");
    console.log("\nAvailable audiobooks:");

    const audiobooks = await prisma.audiobook.findMany({
      select: { id: true, title: true },
    });

    audiobooks.forEach((book) => {
      console.log(`  ${book.id} - ${book.title}`);
    });

    process.exit(1);
  }

  await deleteAudiobook(audiobookId);
}

main()
  .catch((e) => {
    console.error("Delete failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
