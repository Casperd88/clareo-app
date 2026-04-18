export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface Author {
  id: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
}

export interface Narrator {
  id: string;
  name: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
  guideline?: string | null;
}

export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

export interface Audiobook {
  id: string;
  title: string;
  description: string | null;
  coverImageKey: string | null;
  coverVideoKey: string | null;
  totalDuration: number;
  language: string;
  author: Author;
  narrators: Narrator[];
  genres: Genre[];
  chapters?: Chapter[];
  _count?: {
    chapters: number;
  };
}

export interface PlaybackState {
  id: string;
  currentPosition: number;
  currentChapter: number;
  playbackSpeed: number;
  isCompleted: boolean;
  lastPlayedAt: string;
}

export interface LibraryItem {
  id: string;
  addedAt: string;
  audiobook: Audiobook;
  playbackState: PlaybackState | null;
}

export interface SignedUrls {
  coverImage: string | null;
  coverVideo: string | null;
  audio: string | null;
}

export interface AudiobookSignedUrls {
  audiobookId: string;
  expiresIn: number;
  urls: SignedUrls;
  chapters: Array<{
    chapterId: string;
    chapterNumber: number;
    audioUrl: string | null;
  }>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type ListeningHabit = 
  | "commute"
  | "exercise"
  | "bedtime"
  | "housework"
  | "relaxation"
  | "work";

export type PlaybackSpeedPreference = 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface OnboardingData {
  displayName: string;
  selectedGenres: string[];
  listeningHabits: ListeningHabit[];
  monthlyGoal: number;
  preferredSpeed: PlaybackSpeedPreference;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  data: OnboardingData;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
