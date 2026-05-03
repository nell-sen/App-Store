import { Timestamp } from 'firebase/firestore';

export interface APKApp {
  id: string;
  name: string;
  description: string;
  apkLink: string;
  thumbnail: string;
  category: string;
  views: number;
  downloads: number;
  createdAt: Timestamp;
  screenshots?: string[];
  rating?: number;
  ratingCount?: number;
}

export interface APKComment {
  id: string;
  appId: string;
  username: string;
  text: string;
  createdAt: Timestamp;
}

export type APKCategory = 'Tools' | 'Game' | 'Mod' | 'Social' | 'Productivity' | 'Other';

export const CATEGORIES: APKCategory[] = ['Tools', 'Game', 'Mod', 'Social', 'Productivity', 'Other'];
