"use client";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { scholarships } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={<ScholarshipsLoading />}>
      <ScholarshipsContent />
    </Suspense>
  );
}

function ScholarshipsLoading() {
  return (
    <div className="space-y-8">
    <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ScholarshipsContent() {
  const params = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(params.get('q') || '');
  const [levelFilter, setLevelFilter] = useState(params.get('level') || 'all');
  const [fundingFilter, setFundingFilter] = useState(params.get('funding') || 'all');

  const filtered = useMemo(() => {
    return scholarships.filter((s) => {
      const matchesSearch = !searchQuery || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.hostCountry?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = levelFilter === 'all' || s.level.toLowerCase().includes(levelFilter.toLowerCase());
      const matchesFunding = fundingFilter === 'all' || s.fundingType === fundingFilter;
      
      return matchesSearch && matchesLevel && matchesFunding;
    });
  }, [searchQuery, levelFilter, fundingFilter]);

  const levels = [...new Set(scholarships.map(s => s.level))];
  const fullyFundedCount = scholarships.filter(s => s.fundingType === 'full').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Scholarships
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse {scholarships.length} verified scholarships. {fullyFundedCount} are fully funded.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, organization, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map(level => (
                <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fundingFilter} onValueChange={setFundingFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Funding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Funding</SelectItem>
              <SelectItem value="full">Fully Funded</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="none">Self-funded</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || levelFilter !== 'all' || fundingFilter !== 'all') && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery('');
                setLevelFilter('all');
                setFundingFilter('all');
              }}
              className="text-muted-foreground"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Showing {filtered.length} of {scholarships.length} scholarships
        </div>

        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <SearchIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">No scholarships found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setLevelFilter('all');
                  setFundingFilter('all');
                }}
              >
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScholarshipCard({ scholarship: s }: { scholarship: typeof scholarships[0] }) {
  return (
    <Card className="group h-full flex flex-col border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Header with badges */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <Badge 
            variant="secondary" 
            className={`
              text-xs font-medium shrink-0
              ${s.fundingType === 'full' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : s.fundingType === 'partial' 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }
            `}
          >
            {s.fundingType === 'full' ? 'Fully Funded' : s.fundingType === 'partial' ? 'Partial' : 'Self-funded'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {s.deadlines[0]?.label || 'Ongoing'}
          </span>
        </div>

        {/* Title and org */}
        <div className="space-y-2 mb-4 flex-1">
          <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {s.title}
          </h3>
          <p className="text-sm text-muted-foreground">{s.organization}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground">
            <GraduationIcon className="h-3 w-3 mr-1" />
            {s.level}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground">
            <LocationIcon className="h-3 w-3 mr-1" />
            {s.hostCountry || s.region}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground">
            <ModeIcon className="h-3 w-3 mr-1" />
            {s.studyMode}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border/50">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/scholarships/${s.slug}`}>View Details</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={s.website} target="_blank" rel="noreferrer" aria-label="Open official website">
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
    </svg>
  );
}

function GraduationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function ModeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}
