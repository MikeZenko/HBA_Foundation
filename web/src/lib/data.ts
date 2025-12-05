import raw from '../data/scholarships.json';
import type { Scholarship, FundingType, StudyMode, Level, Region } from './types';

type LegacyScholarship = {
  id: number;
  name: string;
  organization: string;
  hostCountry: string;
  region: string;
  targetGroup?: string;
  level: string[];
  deadline: string;
  funding: string;
  fundingDetails?: string;
  returnHome?: string;
  website: string;
  notes?: string;
  eligibility?: string;
  applicationProcess?: string;
};

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function mapFunding(f: string): FundingType {
  const s = f.toLowerCase();
  if (s === 'yes' || s === 'full' || s.includes('full')) return 'full';
  if (s === 'partial' || s.includes('partial')) return 'partial';
  return 'none';
}

function mapLevel(levels: string[]): Level {
  const s = levels.map((l) => l.toLowerCase());
  if (s.some((l) => l.includes('phd'))) return 'phd';
  if (s.some((l) => l.includes('master'))) return 'masters';
  if (s.some((l) => l.includes("bachelor"))) return 'bachelors';
  if (s.some((l) => l.includes('high'))) return 'highschool';
  return 'short-course';
}

function mapRegion(region: string): Region {
  const s = region.toLowerCase();
  if (s.includes('north')) return 'north-america';
  if (s.includes('asia')) return 'asia';
  if (s.includes('europe')) return 'europe';
  if (s.includes('global') || s.includes('online')) return 'global';
  return 'other';
}

function inferStudyMode(hostCountry: string, region: string): StudyMode {
  const hc = hostCountry.toLowerCase();
  const r = region.toLowerCase();
  if (hc === 'online' || r === 'online') return 'online';
  return 'in-person';
}

export const scholarships: Scholarship[] = (raw as LegacyScholarship[]).map((s) => {
  const slug = toSlug(`${s.name}-${s.organization}`);
  const fundingType = mapFunding(s.funding || 'none');
  const studyMode = inferStudyMode(s.hostCountry || '', s.region || '');
  const level = mapLevel(s.level || []);
  const region = mapRegion(s.region || '');
  const deadlines = /ongoing|currently/i.test(s.deadline)
    ? [{ label: 'Ongoing' }]
    : [{ label: s.deadline }];

  const eligibility = s.eligibility ? [s.eligibility] : [];
  const benefits = s.fundingDetails ? [s.fundingDetails] : [];
  const howToApply = s.applicationProcess ? [s.applicationProcess] : [];

  return {
    id: String(s.id),
    slug,
    title: s.name,
    organization: s.organization,
    website: s.website,
    fundingType,
    studyMode,
    level,
    region,
    hostCountry: s.hostCountry,
    deadlines,
    eligibility,
    benefits,
    howToApply,
    verified: true,
    lastChecked: new Date().toISOString().slice(0, 10),
  } satisfies Scholarship;
});

export function getScholarshipBySlug(slug: string): Scholarship | undefined {
  return scholarships.find((s) => s.slug === slug);
}


