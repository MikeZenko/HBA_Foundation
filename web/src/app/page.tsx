import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scholarships } from "@/lib/data";

export default function Home() {
  const featured = scholarships.slice(0, 6);
  const totalScholarships = scholarships.length;
  const fullyFunded = scholarships.filter(s => s.fundingType === 'full').length;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {totalScholarships} verified scholarships available
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
              Pathways to{" "}
              <span className="text-primary">Global Learning</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Discover vetted scholarships and educational opportunities designed for Afghan students. 
              Search by level, funding type, and location. Apply with confidence using our step-by-step guide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/scholarships">
                  <GraduationIcon className="mr-2 h-5 w-5" />
                  Explore Scholarships
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/guide">
                  <BookIcon className="mr-2 h-5 w-5" />
                  Application Guide
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl -z-10"></div>
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <Image 
                    src="/hba-logo.png" 
                    alt="HBA Foundation" 
                    width={56} 
                    height={56}
                    className="rounded-full ring-4 ring-primary/10"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">High Bluff Academy</h3>
                    <p className="text-sm text-muted-foreground">Foundation</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <StatCard number={totalScholarships} label="Scholarships" />
                  <StatCard number={fullyFunded} label="Fully Funded" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Updated regularly with verified opportunities from trusted organizations worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps to find your perfect opportunity</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard 
            step={1} 
            title="Browse Scholarships" 
            description="Explore our curated database of verified scholarships from universities and organizations worldwide."
          />
          <StepCard 
            step={2} 
            title="Prepare Documents" 
            description="Use our application guide and checklist to prepare your transcripts, essays, and recommendations."
          />
          <StepCard 
            step={3} 
            title="Apply with Confidence" 
            description="Submit strong applications with all requirements met. Track deadlines and stay organized."
          />
        </div>
      </section>

      {/* Featured Scholarships */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Scholarships</h2>
            <p className="text-muted-foreground">Handpicked opportunities with strong funding and support</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/scholarships">
              View All
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((s) => (
            <ScholarshipCard key={s.id} scholarship={s} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Know a Scholarship?</h2>
            <p className="text-white/90 leading-relaxed">
              Help fellow students by sharing verified scholarship opportunities. 
              Your contribution could open doors for someone&apos;s future.
            </p>
          </div>
          <div className="flex justify-start md:justify-end">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link href="/contribute">
                <HeartIcon className="mr-2 h-5 w-5" />
                Contribute an Opportunity
              </Link>
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </section>
    </div>
  );
}

function StatCard({ number, label }: { number: number; label: string }) {
  return (
    <div className="text-center p-4 rounded-xl bg-muted/50">
      <div className="text-3xl font-bold text-primary">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
          {step}
        </div>
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function ScholarshipCard({ scholarship: s }: { scholarship: typeof scholarships[0] }) {
  return (
    <Card className="group relative overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <Badge 
            variant="secondary" 
            className={`
              text-xs font-medium
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
          {s.verified && (
            <Badge className="bg-primary/10 text-primary text-xs">Verified</Badge>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {s.title}
          </h3>
          <p className="text-sm text-muted-foreground">{s.organization}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground">{s.level}</span>
          <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground">{s.hostCountry || s.region}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{s.deadlines[0]?.label || 'Ongoing'}</span>
          <Link 
            href={`/scholarships/${s.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View Details →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Icons
function GraduationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}
