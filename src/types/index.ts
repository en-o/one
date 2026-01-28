export interface YearData {
  year: number;
  text: string;
  isFuture: boolean;
}

export interface UserData {
  id: string;
  name: string;
  birthYear: number;
  years: YearData[];
  createdAt: number;
  updatedAt: number;
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
