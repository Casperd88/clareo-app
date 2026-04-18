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
  const basePath =
    "/Users/casperdeseyne/Projects/clareoapp/content/outputs/girlboss_sophia-amoruso";
  const coverImagePath =
    "/Users/casperdeseyne/.cursor/projects/Users-casperdeseyne-Projects-sandbox/assets/Billy88_proffesional_woman_wearing_a_crown_--raw_--sref_68057_84c7b7af-494a-450e-8e5c-fb3ed4856dc5_2-b49d584b-3daa-47c1-9c27-556c0d545c58.png";
  const coverVideoPath =
    "/Users/casperdeseyne/Downloads/grok-video-8fd8742c-16ae-428e-be73-a47b451327ff.mp4";

  const metadataPath = path.join(
    basePath,
    "_girlboss_complete_audiobook_metadata_enhanced.json"
  );
  const whisperPath = path.join(
    basePath,
    "_girlboss_complete_audiobook_whisper.json"
  );
  const audioPath = path.join(basePath, "_girlboss_complete_audiobook.mp3");

  console.log("Loading metadata...");
  const metadata: AudiobookMetadata = JSON.parse(
    fs.readFileSync(metadataPath, "utf-8")
  );

  console.log("Loading whisper data...");
  const whisperData: WhisperData = JSON.parse(
    fs.readFileSync(whisperPath, "utf-8")
  );

  const AUDIOBOOK_ID = "girlboss";
  const AUTHOR_ID = "sophia-amoruso";
  const OFFICIAL_TITLE = "#Girlboss";

  console.log("Creating author...");
  const author = await prisma.author.upsert({
    where: { id: AUTHOR_ID },
    update: { name: metadata.author },
    create: {
      id: AUTHOR_ID,
      name: metadata.author,
      bio: "Sophia Amoruso is an entrepreneur and author best known for founding Nasty Gal and writing #Girlboss.",
    },
  });

  console.log("Creating audiobook...");
  const audiobook = await prisma.audiobook.upsert({
    where: { id: AUDIOBOOK_ID },
    update: {
      title: OFFICIAL_TITLE,
      description:
        "Sophia Amoruso shares the unconventional path that took her from dumpster diving and hitchhiking to building Nasty Gal into a fast-growing fashion business.",
      totalDuration: metadata.totalDuration,
      language: metadata.language,
      coverImageKey: `${AUDIOBOOK_ID}/cover/cover.png`,
      coverVideoKey: `${AUDIOBOOK_ID}/video/cover.mp4`,
    },
    create: {
      id: AUDIOBOOK_ID,
      title: OFFICIAL_TITLE,
      description:
        "Sophia Amoruso shares the unconventional path that took her from dumpster diving and hitchhiking to building Nasty Gal into a fast-growing fashion business.",
      totalDuration: metadata.totalDuration,
      language: metadata.language,
      authorId: author.id,
      coverImageKey: `${AUDIOBOOK_ID}/cover/cover.png`,
      coverVideoKey: `${AUDIOBOOK_ID}/video/cover.mp4`,
    },
  });

  console.log("Creating chapters...");
  const chaptersMap = new Map<number, string>();

  for (const ts of metadata.chapterTimestamps) {
    const chapterMeta = metadata.chapters.find((chapter) => chapter.number === ts.number);

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

  console.log("Refreshing subtitle segments...");
  await prisma.segment.deleteMany({
    where: { chapter: { audiobookId: audiobook.id } },
  });

  const segmentsBatch = whisperData.segments
    .map((segment) => {
      let chapterId = chaptersMap.get(1);

      for (const ts of metadata.chapterTimestamps) {
        if (segment.start >= ts.startTime && segment.start < ts.endTime) {
          chapterId = chaptersMap.get(ts.number);
          break;
        }
      }

      return chapterId
        ? {
            chapterId,
            startTime: segment.start,
            endTime: segment.end,
            text: segment.text,
            words: segment.words,
          }
        : null;
    })
    .filter((segment): segment is NonNullable<typeof segment> => segment !== null);

  if (segmentsBatch.length > 0) {
    await prisma.segment.createMany({
      data: segmentsBatch,
    });
  }

  console.log(`Created ${segmentsBatch.length} segments`);
  console.log("Uploading media files...");

  if (fs.existsSync(coverImagePath)) {
    await uploadFile(`${AUDIOBOOK_ID}/cover/cover.png`, coverImagePath, "image/png");
  } else {
    console.log(`Cover image not found: ${coverImagePath}`);
  }

  if (fs.existsSync(coverVideoPath)) {
    await uploadFile(`${AUDIOBOOK_ID}/video/cover.mp4`, coverVideoPath, "video/mp4");
  } else {
    console.log(`Cover video not found: ${coverVideoPath}`);
  }

  if (fs.existsSync(audioPath)) {
    await uploadFile(`${AUDIOBOOK_ID}/audio/full.mp3`, audioPath, "audio/mpeg");
  } else {
    console.log(`Audio file not found: ${audioPath}`);
  }

  const biographyGenre = await prisma.genre.upsert({
    where: { name: "Biography" },
    update: {},
    create: { name: "Biography" },
  });

  const entrepreneurshipGenre = await prisma.genre.upsert({
    where: { name: "Entrepreneurship" },
    update: {},
    create: { name: "Entrepreneurship" },
  });

  await prisma.audiobookGenre.upsert({
    where: {
      audiobookId_genreId: {
        audiobookId: audiobook.id,
        genreId: biographyGenre.id,
      },
    },
    update: {},
    create: { audiobookId: audiobook.id, genreId: biographyGenre.id },
  });

  await prisma.audiobookGenre.upsert({
    where: {
      audiobookId_genreId: {
        audiobookId: audiobook.id,
        genreId: entrepreneurshipGenre.id,
      },
    },
    update: {},
    create: { audiobookId: audiobook.id, genreId: entrepreneurshipGenre.id },
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
  console.log(`Audiobook: ${OFFICIAL_TITLE}`);
  console.log(`Author: ${metadata.author}`);
  console.log(`Duration: ${Math.round(metadata.totalDuration / 60)} minutes`);
  console.log(`Chapters: ${metadata.chapterTimestamps.length}`);
  console.log(`Segments: ${segmentsBatch.length}`);
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
