export type FundingType = 'full' | 'partial' | 'none';
export type StudyMode = 'online' | 'in-person' | 'hybrid';
export type Level = 'highschool' | 'bachelors' | 'masters' | 'phd' | 'short-course';
export type Region = 'global' | 'asia' | 'europe' | 'north-america' | 'other';

export type Deadline = { label: string; date?: string };

export interface Scholarship {
  id: string;
  slug: string;
  title: string;
  organization: string;
  website: string;
  fundingType: FundingType;
  studyMode: StudyMode;
  level: Level;
  region: Region;
  hostCountry?: string;
  deadlines: Deadline[];
  eligibility: string[];
  benefits: string[];
  howToApply: string[];
  verified: boolean;
  lastChecked: string;
}

export interface FilterState {
  query: string;
  studyMode: StudyMode[];
  region: Region[];
  level: Level[];
  funding: FundingType[];
  deadlineWindow: 'any' | '30d' | '90d' | 'ongoing';
  sort: 'relevance' | 'deadline' | 'newest';
  view: 'grid' | 'list';
}



