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
    "/Users/casperdeseyne/Projects/clareoapp/content/outputs/the-art-of-not-giving-a-fuck_mark-manson";
  const coverImagePath =
    "/Users/casperdeseyne/.cursor/projects/Users-casperdeseyne-Projects-sandbox/assets/Billy88_a_single_centered_figure_dropping_a_heavy_suitcase_lo_6957687b-6f4f-4cf7-956e-f3d746cd1b00_3-ce5040dc-b984-49f8-be4d-e947dcee6801.png";

  console.log("Loading metadata...");
  const metadataPath = path.join(
    basePath,
    "the_art_of_not_giving_a_fuck_complete_audiobook_metadata_enhanced.json"
  );
  const metadata: AudiobookMetadata = JSON.parse(
    fs.readFileSync(metadataPath, "utf-8")
  );

  console.log("Loading whisper data...");
  const whisperPath = path.join(
    basePath,
    "the_art_of_not_giving_a_fuck_complete_audiobook_whisper.json"
  );
  const whisperData: WhisperData = JSON.parse(
    fs.readFileSync(whisperPath, "utf-8")
  );

  const audioPath = path.join(
    basePath,
    "the_art_of_not_giving_a_fuck_complete_audiobook.mp3"
  );

  const AUDIOBOOK_ID = "subtle-art";
  const OFFICIAL_TITLE = "The Subtle Art of Not Giving a F*ck";

  console.log("Creating author...");
  const author = await prisma.author.upsert({
    where: { id: "mark-manson" },
    update: { name: metadata.author },
    create: {
      id: "mark-manson",
      name: metadata.author,
      bio: "Mark Manson is a bestselling author and blogger known for his self-help advice that cuts through the noise with brutal honesty and humor.",
    },
  });

  console.log("Creating audiobook...");
  const audiobook = await prisma.audiobook.upsert({
    where: { id: AUDIOBOOK_ID },
    update: {
      title: OFFICIAL_TITLE,
      description:
        "A counterintuitive approach to living a good life. Mark Manson argues that improving our lives hinges not on our ability to turn lemons into lemonade, but on learning to stomach lemons better.",
      totalDuration: metadata.totalDuration,
      language: metadata.language,
      coverImageKey: `${AUDIOBOOK_ID}/cover/cover.png`,
    },
    create: {
      id: AUDIOBOOK_ID,
      title: OFFICIAL_TITLE,
      description:
        "A counterintuitive approach to living a good life. Mark Manson argues that improving our lives hinges not on our ability to turn lemons into lemonade, but on learning to stomach lemons better.",
      totalDuration: metadata.totalDuration,
      language: metadata.language,
      authorId: author.id,
      coverImageKey: `${AUDIOBOOK_ID}/cover/cover.png`,
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
    await uploadFile(`${AUDIOBOOK_ID}/cover/cover.png`, coverImagePath, "image/png");
  } else {
    console.log(`Cover image not found: ${coverImagePath}`);
  }

  if (fs.existsSync(audioPath)) {
    await uploadFile(`${AUDIOBOOK_ID}/audio/full.mp3`, audioPath, "audio/mpeg");
  } else {
    console.log(`Audio file not found: ${audioPath}`);
  }

  const selfHelpGenre = await prisma.genre.upsert({
    where: { name: "Self-Help" },
    update: {},
    create: { name: "Self-Help" },
  });

  const psychologyGenre = await prisma.genre.upsert({
    where: { name: "Psychology" },
    update: {},
    create: { name: "Psychology" },
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
        genreId: psychologyGenre.id,
      },
    },
    update: {},
    create: { audiobookId: audiobook.id, genreId: psychologyGenre.id },
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
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
