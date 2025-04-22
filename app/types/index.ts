import type { 
  Database,
  Json,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  RitualLog,
  RitualLogInsert,
  RitualLogUpdate,
  Settings,
  SettingsInsert,
  SettingsUpdate
} from './database';

export type PlanetDay = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';

export interface PlanetInfo {
  name: string;
  ruler: PlanetDay;
}

export interface PlanetaryHourBase {
  readonly planet: PlanetDay;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly isDayHour: boolean;
  readonly hourNumber: number;
}

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
  isDayHour?: boolean;
}

export interface Planet {
  id: PlanetDay;
  name: string;
  day: string;
  color: string;
  candle: string;
  symbol: string;
  description: string;
  ritual: string;
}

export interface DayTheme {
  name: string;
  description: string;
  gradient: string[];
  color: string;
  ui: {
    cardBorderRadius: number;
    buttonBorderRadius: number;
  };
  symbol: string;
  planetId: PlanetDay;
  correspondences: {
    colors: Array<string>;
    herbs: Array<string>;
    incense: Array<string>;
    crystals: Array<string>;
    metal: string;
  };
  motifs: {
    element: string;
    pattern: string;
    symbol: string;
    borderStyle: string;
    accentElement: string;
  };
  patterns: {
    background: string;
  };
  colors: {
    primary: string;
    secondary: string;
    gradientStart: string;
    gradientMiddle: string;
    gradientEnd: string;
  };
  typography: {
    titleFont: string;
    bodyFont: string;
  };
}

export interface PlanetaryPosition {
  planet: PlanetDay;
  sign: string;
  degree: number;
  isRetrograde: boolean;
}

interface PlanetaryDignityType {
  status: 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Peregrine';
  description: string;
}

export type PlanetaryDignity = PlanetaryDignityType;

export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
  timezone?: string;
  country?: string;
}



export type {
  Database,
  Json,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  RitualLog,
  RitualLogInsert,
  RitualLogUpdate,
  Settings,
  SettingsInsert,
  SettingsUpdate
};

export interface Ritual {
  id: string;
  name: string;
  description: string;
  planet: PlanetDay | string;
  duration: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  bestTime?: string;
  elements?: string[];
  tools?: string[];
  materials?: string[];
  steps: string[];
  benefits?: string[];
  warnings?: string[];
  recommendedTime?: {
    dayOfWeek?: number;
    planetaryHour?: PlanetDay;
    moonPhase?: string;
  };
  imageUrl?: string;
  videoUrl?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

export type RootStackParamList = {
  '(tabs)': undefined;
  'auth': undefined;
  'modal': undefined;
  'hymn/[id]': { id: string };
  'ritual/[id]': { id: string };
};

const AppTypes = {};
export default AppTypes;
