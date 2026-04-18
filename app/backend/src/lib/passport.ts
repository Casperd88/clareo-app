import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as AppleStrategy } from "passport-apple";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { prisma } from "./prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface OAuthProfile {
  provider: string;
  id: string;
  email?: string;
  displayName?: string;
  photos?: Array<{ value: string }>;
}

async function findOrCreateUser(profile: OAuthProfile) {
  const email = profile.email;
  if (!email) {
    throw new Error("Email is required for authentication");
  }

  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: profile.provider,
        providerAccountId: profile.id,
      },
    },
    include: { user: true },
  });

  if (existingAccount) {
    return existingAccount.user;
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: profile.displayName || email.split("@")[0],
        avatarUrl: profile.photos?.[0]?.value || null,
      },
    });
  }

  await prisma.account.create({
    data: {
      provider: profile.provider,
      providerAccountId: profile.id,
      userId: user.id,
    },
  });

  return user;
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        scope: ["email", "profile"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUser({
            provider: "google",
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
            photos: profile.photos,
          });
          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

if (
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY
) {
  const appleOptions = {
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    callbackURL: process.env.APPLE_CALLBACK_URL || "/api/auth/apple/callback",
    scope: ["name", "email"],
    passReqToCallback: false,
  };

  const appleVerify = async (
    _accessToken: unknown,
    _refreshToken: unknown,
    idToken: unknown,
    profile: unknown,
    done: (error: Error | null, user?: unknown) => void
  ) => {
    try {
      const token = idToken as { sub: string; email?: string };
      const prof = profile as { name?: { firstName?: string; lastName?: string } };
      
      const displayName = prof.name
        ? `${prof.name.firstName || ""} ${prof.name.lastName || ""}`.trim()
        : undefined;

      const user = await findOrCreateUser({
        provider: "apple",
        id: token.sub,
        email: token.email,
        displayName,
      });
      done(null, user);
    } catch (error) {
      done(error as Error, undefined);
    }
  };

  passport.use(new AppleStrategy(appleOptions as never, appleVerify as never));
}

passport.serializeUser((user, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export { passport };
