"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ChecklistItem = { 
  id: string; 
  label: string; 
  tip: string;
  priority: 'high' | 'medium' | 'low';
};

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { 
    id: 'transcripts', 
    label: 'Academic Transcripts', 
    tip: 'Request official transcripts from your institution at least 4-6 weeks before deadlines. Many universities require sealed official copies.',
    priority: 'high'
  },
  { 
    id: 'recs', 
    label: 'Recommendation Letters', 
    tip: 'Ask professors, employers, or mentors 4-6 weeks in advance. Provide them with your CV, statement of purpose, and deadline information.',
    priority: 'high'
  },
  { 
    id: 'essays', 
    label: 'Personal Statement / Essays', 
    tip: 'Draft your core statement once, then adapt for each program. Have multiple people review for clarity and impact.',
    priority: 'high'
  },
  { 
    id: 'cv', 
    label: 'CV / Resume', 
    tip: 'Keep undergraduate CVs to 1 page, graduate to 2 pages max. Highlight achievements, leadership, and relevant experience.',
    priority: 'high'
  },
  { 
    id: 'english', 
    label: 'English Proficiency Test', 
    tip: 'IELTS, TOEFL, or Duolingo English Test. Book early as test slots fill quickly. Check each program\'s minimum score requirements.',
    priority: 'medium'
  },
  { 
    id: 'id', 
    label: 'Passport / ID Documents', 
    tip: 'Ensure your passport is valid for at least 6 months beyond your intended program start date.',
    priority: 'medium'
  },
  { 
    id: 'financial', 
    label: 'Financial Documents', 
    tip: 'Bank statements, sponsor letters, or scholarship confirmation letters may be required for visa applications.',
    priority: 'medium'
  },
  { 
    id: 'portfolio', 
    label: 'Portfolio / Work Samples', 
    tip: 'For creative or technical programs. Compile your best work and ensure it meets program specifications.',
    priority: 'low'
  },
];

const TIMELINE_STEPS = [
  {
    title: '12+ Months Before',
    items: [
      'Research scholarships and programs',
      'Take standardized tests (IELTS/TOEFL, GRE/GMAT)',
      'Identify recommenders',
    ],
  },
  {
    title: '6-12 Months Before',
    items: [
      'Request transcripts',
      'Draft personal statement',
      'Ask for recommendation letters',
      'Prepare CV/resume',
    ],
  },
  {
    title: '3-6 Months Before',
    items: [
      'Submit applications',
      'Complete scholarship applications',
      'Follow up on recommendations',
    ],
  },
  {
    title: '0-3 Months Before',
    items: [
      'Accept offers',
      'Apply for visa',
      'Arrange accommodation',
      'Plan travel',
    ],
  },
];

export default function GuidePage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const raw = localStorage.getItem('guide-checklist');
    if (raw) setChecked(JSON.parse(raw));
  }, []);
  
  useEffect(() => {
    localStorage.setItem('guide-checklist', JSON.stringify(checked));
  }, [checked]);

  const completeCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const progress = (completeCount / CHECKLIST_ITEMS.length) * 100;

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Application Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Prepare once, apply to many. Use this checklist to organize your documents and stay on track with deadlines.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <BookmarkIcon className="h-4 w-4" />
          <span>Your progress is saved locally in your browser</span>
        </div>
      </header>

      {/* Progress Overview */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Your Progress</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Documents ready</span>
                  <span className="font-medium text-foreground">{completeCount} of {CHECKLIST_ITEMS.length}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {completeCount === CHECKLIST_ITEMS.length && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckIcon className="h-3 w-3 mr-1" />
                  All documents ready!
                </Badge>
              )}
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground mt-1">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Checklist */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Document Checklist</h2>
          {completeCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setChecked({})}
              className="text-muted-foreground"
            >
              Reset all
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {CHECKLIST_ITEMS.map((item) => (
                <label 
                  key={item.id}
                  className={`
                    group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg cursor-pointer transition-colors
                    ${checked[item.id] ? 'bg-primary/5' : 'hover:bg-muted/50'}
                  `}
                >
                  <Checkbox 
                    id={item.id} 
                    checked={!!checked[item.id]} 
                    onCheckedChange={(v) => setChecked((c) => ({ ...c, [item.id]: Boolean(v) }))}
                    className="h-4 w-4 shrink-0"
                  />
                  <span className={`flex-1 text-sm ${checked[item.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.label}
                  </span>
                  <PriorityBadge priority={item.priority} />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <p className="text-xs text-muted-foreground">
          Tip: Request official documents 4-6 weeks before deadlines. Keep copies of everything.
        </p>
      </section>

      {/* Timeline */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Application Timeline</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIMELINE_STEPS.map((step, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20">
                <div 
                  className="w-full bg-primary transition-all duration-300"
                  style={{ height: `${((index + 1) / TIMELINE_STEPS.length) * 100}%` }}
                />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {step.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Pro Tips</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <TipCard 
            icon={<ClockIcon className="h-5 w-5" />}
            title="Start Early"
            description="Begin your preparation 12+ months before deadlines. This gives you time to retake tests if needed."
          />
          <TipCard 
            icon={<FolderIcon className="h-5 w-5" />}
            title="Stay Organized"
            description="Create a master spreadsheet tracking all deadlines, requirements, and submission status for each application."
          />
          <TipCard 
            icon={<UsersIcon className="h-5 w-5" />}
            title="Get Feedback"
            description="Have multiple people review your essays. Fresh perspectives can significantly improve your application."
          />
        </div>
      </section>

      {/* CTA */}
      <Card className="border-0 bg-muted/50">
        <CardContent className="p-6 md:p-8 text-center space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Ready to find scholarships?</h3>
          <p className="text-muted-foreground">
            Browse our curated list of verified opportunities for Afghan students.
          </p>
          <Button asChild size="lg">
            <Link href="/scholarships">
              <SearchIcon className="mr-2 h-4 w-4" />
              Explore Scholarships
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  
  return (
    <Badge variant="secondary" className={`text-xs ${styles[priority]}`}>
      {priority}
    </Badge>
  );
}

function TipCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

// Icons
function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
    </svg>
  );
}
