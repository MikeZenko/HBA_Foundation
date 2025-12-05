import { getScholarshipBySlug, scholarships } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ScholarshipDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getScholarshipBySlug(slug);
  if (!s) return notFound();

  // Get related scholarships (same level or funding type)
  const related = scholarships
    .filter(r => r.id !== s.id && (r.level === s.level || r.fundingType === s.fundingType))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/scholarships" className="hover:text-foreground transition-colors">
          Scholarships
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground truncate">{s.title}</span>
      </nav>

      {/* Header */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`
              text-sm font-medium
              ${s.fundingType === 'full' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : s.fundingType === 'partial' 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }
            `}
          >
            {s.fundingType === 'full' ? 'Fully Funded' : s.fundingType === 'partial' ? 'Partial Funding' : 'Self-funded'}
          </Badge>
          {s.verified && (
            <Badge className="bg-primary/10 text-primary text-sm">
              <CheckIcon className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
            {s.title}
          </h1>
          <p className="text-lg text-muted-foreground">{s.organization}</p>
        </div>

        {/* Quick info chips */}
        <div className="flex flex-wrap gap-2">
          <InfoChip icon={<GraduationIcon className="h-4 w-4" />} label={s.level} />
          <InfoChip icon={<ModeIcon className="h-4 w-4" />} label={s.studyMode} />
          <InfoChip icon={<LocationIcon className="h-4 w-4" />} label={s.hostCountry || s.region || 'Various'} />
          <InfoChip icon={<CalendarIcon className="h-4 w-4" />} label={s.deadlines[0]?.label || 'Ongoing'} />
        </div>

        {/* Primary actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <a href={s.website} target="_blank" rel="noreferrer">
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              Apply on Official Site
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/scholarships">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to All Scholarships
            </Link>
          </Button>
        </div>
      </header>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5 text-primary" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                This scholarship is offered by <strong>{s.organization}</strong> for students seeking{' '}
                <strong>{s.level}</strong> programs through <strong>{s.studyMode}</strong> study.
                {s.hostCountry && <> Study location: <strong>{s.hostCountry}</strong>.</>}
              </p>
              <p className="text-sm text-muted-foreground mt-3 p-3 bg-muted/50 rounded-lg">
                Always verify all details on the official website before applying. Requirements and deadlines may change.
              </p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChecklistIcon className="h-5 w-5 text-primary" />
                Eligibility Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {s.eligibility.length > 0 ? (
                <ul className="space-y-3">
                  {s.eligibility.map((e, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{e}</span>
                    </li>
                  ))}
              </ul>
              ) : (
                <p className="text-muted-foreground">
                  Eligibility requirements are available on the official website.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GiftIcon className="h-5 w-5 text-primary" />
                Benefits & Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {s.benefits.length > 0 ? (
                <ul className="grid gap-2">
                  {s.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-muted-foreground">{b}</span>
                    </li>
                  ))}
              </ul>
              ) : (
                <p className="text-muted-foreground">
                  Benefit details are available on the official website.
                </p>
              )}
            </CardContent>
          </Card>

          {/* How to Apply */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RocketIcon className="h-5 w-5 text-primary" />
                How to Apply
              </CardTitle>
            </CardHeader>
            <CardContent>
              {s.howToApply.length > 0 ? (
                <ol className="space-y-4">
                  {s.howToApply.map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {i + 1}
                      </span>
                      <div className="flex-1 pt-1">
                        <p className="text-muted-foreground">{step}</p>
                      </div>
                    </li>
                  ))}
              </ol>
              ) : (
                <p className="text-muted-foreground">
                  Application steps are available on the official website.
                </p>
              )}
              
              <div className="mt-6 pt-6 border-t border-border">
                <Button asChild className="w-full sm:w-auto">
                  <a href={s.website} target="_blank" rel="noreferrer">
                    Start Application
                    <ExternalLinkIcon className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Facts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Facts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickFact label="Level" value={s.level} />
              <QuickFact label="Study Mode" value={s.studyMode} />
              <QuickFact label="Location" value={s.hostCountry || s.region || 'Various'} />
              <QuickFact 
                label="Funding" 
                value={s.fundingType === 'full' ? 'Fully Funded' : s.fundingType === 'partial' ? 'Partial' : 'Self-funded'} 
              />
              <QuickFact label="Deadline" value={s.deadlines[0]?.label || 'Ongoing'} />
            </CardContent>
          </Card>

          {/* Related Scholarships */}
          {related.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Similar Scholarships</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {related.map((r) => (
                  <Link 
                    key={r.id} 
                    href={`/scholarships/${r.slug}`}
                    className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {r.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{r.organization}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Report Issue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Found an Issue?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Help us keep information accurate. Report outdated or incorrect details.
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="mailto:info@hbafoundation.org?subject=Scholarship Update: ${s.title}">
                  <MailIcon className="mr-2 h-4 w-4" />
                  Report Update
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

// Icons
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
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

function ModeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

function ChecklistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
