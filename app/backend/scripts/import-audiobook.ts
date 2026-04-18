import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";

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

interface ChapterTimestamp {
  number: number;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
}

interface ChapterMetadata {
  number: number;
  title: string;
  filename: string;
  guideline: string;
}

interface AudiobookMetadata {
  title: string;
  author: string;
  language: string;
  totalChapters: number;
  totalDuration: number;
  chapters: ChapterMetadata[];
  chapterTimestamps: ChapterTimestamp[];
}

interface WhisperWord {
  word: string;
  start: number;
  end: number;
  punct?: string;
}

interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words: WhisperWord[];
}

interface WhisperData {
  text: string;
  segments: WhisperSegment[];
}

async function uploadFile(
  key: string,
  filePath: string,
  contentType: string
): Promise<void> {
  const fileBuffer = fs.readFileSync(filePath);
  console.log(`Uploading ${filePath} to ${key}...`);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  console.log(`Uploaded ${key}`);
}

async function main() {
  const args = process.argv.slice(2);
  const basePath =
    args[0] ||
    "/Users/casperdeseyne/Projects/clareoapp/content/outputs/the-4-hour-work-week_tim-ferriss";
  const coverImagePath =
    args[1] ||
    "/Users/casperdeseyne/.cursor/projects/Users-casperdeseyne-Projects-sandbox/assets/Billy88_an_empty_hammock_suspended_between_two_minimal_poles__8f303011-e4cf-411b-953a-0feb3e56e7c3_1-3168ff65-066d-4e90-a41b-f064208c7b46.png";
  const coverVideoPath =
    args[2] ||
    "/Users/casperdeseyne/Downloads/4292056b-e389-4144-9a70-fb16e2f1b777.mp4";

  console.log("Loading metadata...");
  const metadataPath = path.join(
    basePath,
    "the_4_hour_work_week_complete_audiobook_metadata_enhanced.json"
  );
  const metadata: AudiobookMetadata = JSON.parse(
    fs.readFileSync(metadataPath, "utf-8")
  );

  console.log("Loading whisper data...");
  const whisperPath = path.join(
    basePath,
    "the_4_hour_work_week_complete_audiobook_whisper.json"
  );
  const whisperData: WhisperData = JSON.parse(
    fs.readFileSync(whisperPath, "utf-8")
  );

  const audioPath = path.join(
    basePath,
    "the_4_hour_work_week_complete_audiobook.mp3"
  );

  console.log("Creating author...");
  const author = await prisma.author.upsert({
    where: { id: "tim-ferriss" },
    update: { name: metadata.author },
    create: {
      id: "tim-ferriss",
      name: metadata.author,
      bio: "Tim Ferriss is an American entrepreneur, investor, author, and podcaster.",
    },
  });

  console.log("Creating audiobook...");
  const audiobook = await prisma.audiobook.upsert({
    where: { id: "4hww" },
    update: {
      title: metadata.title,
      description:
        "Escape 9-5, Live Anywhere, and Join the New Rich. Tim Ferriss challenges conventional work assumptions and provides a blueprint for designing your ideal lifestyle.",
      totalDuration: metadata.totalDuration,
      language: metadata.language,
      coverImageKey: "4hww/cover/cover.png",
      coverVideoKey: "4hww/video/cover.mp4",
    },
    create: {
      id: "4hww",
      title: metadata.title,
      description:
        "Escape 9-5, Live Anywhere, and Join the New Rich. Tim Ferriss challenges conventional work assumptions and provides a blueprint for designing your ideal lifestyle.",
      totalDuration: metadata.totalDuration,
      language: metadata.language,
      authorId: author.id,
      coverImageKey: "4hww/cover/cover.png",
      coverVideoKey: "4hww/video/cover.mp4",
    },
  });

  console.log("Creating chapters...");
  const chaptersMap = new Map<number, string>();

  for (const ts of metadata.chapterTimestamps) {
    const chapterMeta = metadata.chapters.find((c) => c.number === ts.number);

    const chapter = await prisma.chapter.upsert({
      where: {
        audiobookId_chapterNumber: {
          audiobookId: audiobook.id,
          chapterNumber: ts.number,
        },
      },
      update: {
        title: chapterMeta?.title || ts.title,
        startTime: ts.startTime,
        endTime: ts.endTime,
        duration: ts.duration,
        guideline: chapterMeta?.guideline,
      },
      create: {
        audiobookId: audiobook.id,
        chapterNumber: ts.number,
        title: chapterMeta?.title || ts.title,
        startTime: ts.startTime,
        endTime: ts.endTime,
        duration: ts.duration,
        guideline: chapterMeta?.guideline,
      },
    });

    chaptersMap.set(ts.number, chapter.id);
  }

  console.log("Creating segments from whisper data...");
  await prisma.segment.deleteMany({
    where: { chapter: { audiobookId: audiobook.id } },
  });

  const segmentsBatch = [];

  for (const segment of whisperData.segments) {
    let chapterId: string | undefined;
    for (const ts of metadata.chapterTimestamps) {
      if (segment.start >= ts.startTime && segment.start < ts.endTime) {
        chapterId = chaptersMap.get(ts.number);
        break;
      }
    }

    if (!chapterId) {
      chapterId = chaptersMap.get(1);
    }

    if (chapterId) {
      segmentsBatch.push({
        chapterId,
        startTime: segment.start,
        endTime: segment.end,
        text: segment.text,
        words: segment.words,
      });
    }
  }

  if (segmentsBatch.length > 0) {
    await prisma.segment.createMany({
      data: segmentsBatch,
    });
  }

  console.log(`Created ${segmentsBatch.length} segments`);

  console.log("Uploading media files...");

  if (fs.existsSync(coverImagePath)) {
    await uploadFile("4hww/cover/cover.png", coverImagePath, "image/png");
  }

  if (fs.existsSync(coverVideoPath)) {
    await uploadFile("4hww/video/cover.mp4", coverVideoPath, "video/mp4");
  }

  if (fs.existsSync(audioPath)) {
    await uploadFile("4hww/audio/full.mp3", audioPath, "audio/mpeg");
  }

  const selfHelpGenre = await prisma.genre.upsert({
    where: { name: "Self-Help" },
    update: {},
    create: { name: "Self-Help" },
  });

  const productivityGenre = await prisma.genre.upsert({
    where: { name: "Productivity" },
    update: {},
    create: { name: "Productivity" },
  });

  await prisma.audiobookGenre.upsert({
    where: {
      audiobookId_genreId: {
        audiobookId: audiobook.id,
        genreId: selfHelpGenre.id,
      },
    },
    update: {},
    create: { audiobookId: audiobook.id, genreId: selfHelpGenre.id },
  });

  await prisma.audiobookGenre.upsert({
    where: {
      audiobookId_genreId: {
        audiobookId: audiobook.id,
        genreId: productivityGenre.id,
      },
    },
    update: {},
    create: { audiobookId: audiobook.id, genreId: productivityGenre.id },
  });

  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@example.com" },
  });

  if (demoUser) {
    await prisma.libraryItem.upsert({
      where: {
        userId_audiobookId: {
          userId: demoUser.id,
          audiobookId: audiobook.id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        audiobookId: audiobook.id,
      },
    });
    console.log("Added audiobook to demo user library");
  }

  console.log("\nImport complete!");
  console.log(`Audiobook: ${metadata.title}`);
  console.log(`Author: ${metadata.author}`);
  console.log(`Duration: ${Math.round(metadata.totalDuration / 60)} minutes`);
  console.log(`Chapters: ${metadata.chapterTimestamps.length}`);
  console.log(`Segments: ${segmentsBatch.length}`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
