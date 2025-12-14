// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  language?: string;
  useDayThemes?: boolean;
}

// Auth types
export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
}

// Settings types
export interface Settings {
  darkMode?: boolean;
  useDayThemes?: boolean;
  showNotifications?: boolean;
  language?: string;
  useLocationServices?: boolean;
  showPlanetaryHours?: boolean;
  showZodiacInfo?: boolean;
  showDignities?: boolean;
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
  city?: string;
  region?: string;
  country?: string;
  timestamp?: number;
}

// Planet types
export type PlanetDay = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';

export interface Planet {
  id: PlanetDay;
  name: string;
  symbol: string;
  color: string;
  day: string;
  metal?: string;
  stone?: string;
  herb?: string;
  candle: string;
  incense?: string;
  description: string;
  keywords?: string[];
  ritualFocus?: string;
  ritual?: string;
}

// Planetary hour types
export interface PlanetaryHour {
  hour: number;
  hourNumber: number;
  planet: PlanetDay;
  planetId: PlanetDay;
  period: 'day' | 'night';
  isDay: boolean;
  startTime: Date;
  endTime: Date;
  isCurrentHour: boolean;
  isDayHour?: boolean; // Added for compatibility with app/types
}

// Planetary position types
export interface PlanetaryPosition {
  planet: PlanetDay;
  sign: string;
  degree: number;
  isRetrograde: boolean;
  house?: number;
}

// Ritual types
export interface Ritual {
  id: string;
  planetId: PlanetDay;
  completedAt: string;
  notes?: string;
}

export interface RitualDefinition {
  id: string;
  name: string;
  description: string;
  planet: string;
  duration: number;
  bestTime: string;
  materials: string[];
  steps: string[];
}

// Theme types
export interface DayTheme {
  id: PlanetDay;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  cardColor: string;
  borderColor: string;
  symbolStyle: 'classic' | 'modern' | 'alchemical';
}

// Profile types
export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  zodiacSign?: string;
  risingSign?: string;
  moonSign?: string;
  completedRituals: number;
  level: number;
  experience: number;
  createdAt: string;
  updatedAt: string;
}

// Learning content types
export interface LearningContent {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'planets' | 'astrology' | 'rituals' | 'history';
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'ritual' | 'planetary' | 'system';
  read: boolean;
  createdAt: string;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

// Journal entry types
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  planetaryHour?: PlanetDay;
  createdAt: string;
  updatedAt: string;
}

// Calendar event types
export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
  type: 'ritual' | 'reminder' | 'astronomical' | 'personal';
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Astrological chart types
export interface AstrologicalChart {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  positions: PlanetaryPosition[];
  houses: House[];
  aspects: Aspect[];
  createdAt: string;
  updatedAt: string;
}

export interface House {
  number: number;
  sign: string;
  degree: number;
  cusp: number;
}

export interface Aspect {
  planet1: PlanetDay;
  planet2: PlanetDay;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  applying: boolean;
}

// Tarot types
export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number;
  keywords: string[];
  meaning: {
    upright: string;
    reversed: string;
  };
  description: string;
  imageUrl: string;
  planetaryCorrespondence?: PlanetDay;
  zodiacCorrespondence?: string;
  elementCorrespondence?: 'fire' | 'water' | 'air' | 'earth';
}

export interface TarotReading {
  id: string;
  userId: string;
  type: 'daily' | 'three-card' | 'celtic-cross' | 'custom';
  question?: string;
  cards: {
    position: string;
    card: TarotCard;
    isReversed: boolean;
  }[];
  interpretation?: string;
  createdAt: string;
}

// Meditation types
export interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  planetaryCorrespondence?: PlanetDay;
  audioUrl?: string;
  imageUrl?: string;
  instructions: string;
  benefits: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface MeditationSession {
  id: string;
  userId: string;
  meditationId: string;
  duration: number; // actual duration in minutes
  notes?: string;
  mood?: string;
  createdAt: string;
}

// Spell types
export interface Spell {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  planetaryHour?: PlanetDay;
  moonPhase?: 'new' | 'waxing' | 'full' | 'waning';
  zodiacSign?: string;
  element?: 'fire' | 'water' | 'air' | 'earth';
  purpose: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  warnings?: string;
  createdAt: string;
  updatedAt: string;
}

// Dream journal types
export interface DreamEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  dreamDate: string;
  tags?: string[];
  mood?: string;
  lucid: boolean;
  recurring: boolean;
  symbols?: string[];
  interpretation?: string;
  planetaryHour?: PlanetDay;
  moonPhase?: string;
  createdAt: string;
  updatedAt: string;
}

// Herb types
export interface Herb {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  uses: string[];
  planetaryCorrespondence?: PlanetDay;
  elementCorrespondence?: 'fire' | 'water' | 'air' | 'earth';
  zodiacCorrespondence?: string[];
  warnings?: string;
  imageUrl?: string;
}

// Crystal types
export interface Crystal {
  id: string;
  name: string;
  description: string;
  properties: string[];
  planetaryCorrespondence?: PlanetDay;
  elementCorrespondence?: 'fire' | 'water' | 'air' | 'earth';
  zodiacCorrespondence?: string[];
  chakraCorrespondence?: string[];
  color: string;
  imageUrl?: string;
}

// Incense types
export interface Incense {
  id: string;
  name: string;
  description: string;
  ingredients?: string[];
  uses: string[];
  planetaryCorrespondence?: PlanetDay;
  elementCorrespondence?: 'fire' | 'water' | 'air' | 'earth';
  zodiacCorrespondence?: string[];
  warnings?: string;
  imageUrl?: string;
}

// Oil types
export interface Oil {
  id: string;
  name: string;
  description: string;
  uses: string[];
  planetaryCorrespondence?: PlanetDay;
  elementCorrespondence?: 'fire' | 'water' | 'air' | 'earth';
  zodiacCorrespondence?: string[];
  warnings?: string;
  imageUrl?: string;
}

// Candle types
export interface Candle {
  id: string;
  color: string;
  meaning: string;
  uses: string[];
  planetaryCorrespondence?: PlanetDay;
  elementCorrespondence?: 'fire' | 'water' | 'air' | 'earth';
  zodiacCorrespondence?: string[];
  imageUrl?: string;
}

// Rune types
export interface Rune {
  id: string;
  name: string;
  symbol: string;
  meaning: string;
  reversedMeaning?: string;
  elementCorrespondence?: 'fire' | 'water' | 'air' | 'earth';
  planetaryCorrespondence?: PlanetDay;
  imageUrl?: string;
}

// Sigil types
export interface Sigil {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  purpose: string;
  createdAt: string;
  userId: string;
}

// Altar types
export interface Altar {
  id: string;
  userId: string;
  name: string;
  description: string;
  items: string[];
  purpose: string;
  planetaryCorrespondence?: PlanetDay;
  elementCorrespondence?: 'fire' | 'water' | 'air' | 'earth';
  zodiacCorrespondence?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Sabbat types
export interface Sabbat {
  id: string;
  name: string;
  date: string; // This would be the date for the current year
  description: string;
  traditions: string[];
  correspondences: {
    colors: string[];
    herbs: string[];
    foods: string[];
    decorations: string[];
  };
  rituals: string[];
  imageUrl?: string;
}

// Moon phase types
export interface MoonPhase {
  phase: 'new' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' | 'full' | 'waning gibbous' | 'last quarter' | 'waning crescent';
  date: string;
  illumination: number; // 0-1
  age: number; // Days since new moon
  distance: number; // Distance from Earth in km
  name?: string; // Special name if applicable (e.g., "Harvest Moon")
  zodiacSign: string;
}

// Astrological event types
export interface AstrologicalEvent {
  id: string;
  type: 'retrograde' | 'direct' | 'ingress' | 'eclipse' | 'conjunction' | 'opposition';
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  planets?: PlanetDay[];
  zodiacSigns?: string[];
  impact: string;
  advice: string;
}

// Weather types for ritual planning
export interface Weather {
  date: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  moonPhase: string;
  sunrise: string;
  sunset: string;
  suitable: boolean; // Whether conditions are suitable for outdoor rituals
}

// Community types
export interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  topics: string[];
  imageUrl?: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

// Notification preferences
export interface NotificationPreferences {
  planetaryHourAlerts: boolean;
  moonPhaseAlerts: boolean;
  ritualReminders: boolean;
  astrologicalEvents: boolean;
  communityActivity: boolean;
  dailyHoroscope: boolean;
  weeklyForecast: boolean;
}

// App state types
export interface AppState {
  lastOpened: string;
  onboardingCompleted: boolean;
  currentTheme: 'light' | 'dark' | 'system' | PlanetDay;
  lastNotificationSeen: string;
  lastBackupDate?: string;
  appVersion: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Success response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Search
export interface SearchResult {
  type: 'ritual' | 'planet' | 'herb' | 'crystal' | 'spell' | 'learning' | 'community';
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  relevance: number; // 0-1 score of how relevant the result is
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium' | 'pro';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
  features: string[];
}

// Analytics types
export interface UserAnalytics {
  ritualCompletions: {
    total: number;
    byPlanet: Record<PlanetDay, number>;
    byMonth: Record<string, number>;
  };
  meditationMinutes: number;
  journalEntries: number;
  learningProgress: number;
  achievements: number;
  streak: number;
  lastActive: string;
}

// Feedback types
export interface Feedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'content' | 'other';
  title: string;
  description: string;
  screenshot?: string;
  status: 'submitted' | 'reviewing' | 'resolved' | 'rejected';
  response?: string;
  createdAt: string;
  updatedAt: string;
}