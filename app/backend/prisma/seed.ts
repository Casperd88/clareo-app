import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create genres
  const genres = await Promise.all([
    prisma.genre.upsert({
      where: { name: "Fiction" },
      update: {},
      create: { name: "Fiction" },
    }),
    prisma.genre.upsert({
      where: { name: "Non-Fiction" },
      update: {},
      create: { name: "Non-Fiction" },
    }),
    prisma.genre.upsert({
      where: { name: "Science Fiction" },
      update: {},
      create: { name: "Science Fiction" },
    }),
    prisma.genre.upsert({
      where: { name: "Mystery" },
      update: {},
      create: { name: "Mystery" },
    }),
    prisma.genre.upsert({
      where: { name: "Fantasy" },
      update: {},
      create: { name: "Fantasy" },
    }),
    prisma.genre.upsert({
      where: { name: "Biography" },
      update: {},
      create: { name: "Biography" },
    }),
    prisma.genre.upsert({
      where: { name: "Self-Help" },
      update: {},
      create: { name: "Self-Help" },
    }),
  ]);

  console.log(`Created ${genres.length} genres`);

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create author
  const author = await prisma.author.create({
    data: {
      name: "Sample Author",
      bio: "A talented author who writes amazing stories.",
    },
  });

  // Create narrator
  const narrator = await prisma.narrator.create({
    data: {
      name: "Sample Narrator",
      bio: "An award-winning narrator with a captivating voice.",
    },
  });

  // Create sample audiobook
  const audiobook = await prisma.audiobook.create({
    data: {
      title: "Sample Audiobook",
      description: "An engaging story that will captivate your imagination.",
      totalDuration: 36000,
      language: "en",
      authorId: author.id,
      narrators: {
        create: {
          narratorId: narrator.id,
        },
      },
      genres: {
        create: {
          genreId: genres[0].id,
        },
      },
      chapters: {
        create: [
          {
            title: "Chapter 1: The Beginning",
            chapterNumber: 1,
            startTime: 0,
            duration: 1800,
          },
          {
            title: "Chapter 2: The Journey",
            chapterNumber: 2,
            startTime: 1800,
            duration: 2100,
          },
          {
            title: "Chapter 3: The Discovery",
            chapterNumber: 3,
            startTime: 3900,
            duration: 1950,
          },
        ],
      },
    },
  });

  console.log(`Created audiobook: ${audiobook.title}`);

  // Add to user's library
  await prisma.libraryItem.create({
    data: {
      userId: user.id,
      audiobookId: audiobook.id,
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
