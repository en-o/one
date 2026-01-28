export interface YearData {
  year: number;
  text: string;
  isFuture: boolean;
}

export interface MountainScapeProps {
  year: number;
  text: string;
  seed?: number;
}

export interface ScrollState {
  birthYear: number | null;
  years: YearData[];
  isGenerated: boolean;
}
