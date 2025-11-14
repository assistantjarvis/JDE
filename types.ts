
export enum JournalCategory {
  SHOPPING = 'SHOPPING',
  REMINDER = 'REMINDER',
  NOTE = 'NOTE',
  RECOMMENDATION = 'RECOMMENDATION',
}

export interface JournalEntry {
  id: string;
  category: JournalCategory;
  content: string;
  timestamp: Date;
}

export interface UIMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}
