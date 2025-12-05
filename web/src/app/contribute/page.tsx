"use client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  organization: z.string().min(2, { message: "Organization must be at least 2 characters" }),
  country: z.string().min(2, { message: "Please specify the host country" }),
  level: z.string().min(2, { message: "Please specify the education level" }),
  funding: z.string().min(1, { message: "Please select funding type" }),
  mode: z.string().min(2, { message: "Please specify the study mode" }),
});

type FormData = z.infer<typeof schema>;

export default function ContributePage() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [funding, setFunding] = useState<string>("");
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ 
    resolver: zodResolver(schema) 
  });

  const onSubmit = async (_data: FormData) => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSubmittedId(Math.random().toString(36).slice(2, 10).toUpperCase());
  };

  if (submittedId) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-primary/5 dark:from-green-950/20 dark:to-primary/5">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
              <CheckIcon className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Thank You!</h1>
              <p className="text-muted-foreground">
                Your submission has been received and will be reviewed by our team.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">Reference ID:</span>
              <Badge variant="secondary" className="font-mono">{submittedId}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              We review submissions for accuracy and safety before adding them to our database.
              This typically takes 3-5 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild>
                <Link href="/scholarships">Browse Scholarships</Link>
              </Button>
              <Button variant="outline" onClick={() => setSubmittedId(null)}>
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="max-w-2xl space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Contribute a Scholarship
        </h1>
        <p className="text-lg text-muted-foreground">
          Know of a scholarship opportunity? Share it with the community. 
          Your contribution could help a fellow student achieve their academic dreams.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Scholarship Details</CardTitle>
              <CardDescription>
                Provide basic information about the scholarship. We&apos;ll verify and enrich the details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* URL */}
                <div className="space-y-2">
                  <Label htmlFor="url">Official Website URL <span className="text-destructive">*</span></Label>
                  <Input 
                    id="url" 
                    type="url"
                    placeholder="https://..." 
                    {...register('url')} 
                    className={errors.url ? 'border-destructive' : ''}
                  />
                  {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
                  <p className="text-xs text-muted-foreground">Link to the official scholarship page</p>
                </div>

                {/* Name and Organization */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Scholarship Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Fulbright Scholarship"
                      {...register('name')}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization <span className="text-destructive">*</span></Label>
                    <Input 
                      id="organization" 
                      placeholder="e.g., U.S. Department of State"
                      {...register('organization')}
                      className={errors.organization ? 'border-destructive' : ''}
                    />
                    {errors.organization && <p className="text-sm text-destructive">{errors.organization.message}</p>}
                  </div>
                </div>

                {/* Country and Level */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Host Country <span className="text-destructive">*</span></Label>
                    <Input 
                      id="country" 
                      placeholder="e.g., United States"
                      {...register('country')}
                      className={errors.country ? 'border-destructive' : ''}
                    />
                    {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Education Level <span className="text-destructive">*</span></Label>
                    <Input 
                      id="level" 
                      placeholder="e.g., Masters, Bachelors, PhD"
                      {...register('level')}
                      className={errors.level ? 'border-destructive' : ''}
                    />
                    {errors.level && <p className="text-sm text-destructive">{errors.level.message}</p>}
                  </div>
                </div>

                {/* Funding and Mode */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="funding">Funding Type <span className="text-destructive">*</span></Label>
                    <Select 
                      value={funding} 
                      onValueChange={(v) => {
                        setFunding(v);
                        setValue('funding', v);
                      }}
                    >
                      <SelectTrigger className={errors.funding ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select funding type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Fully Funded</SelectItem>
                        <SelectItem value="partial">Partially Funded</SelectItem>
                        <SelectItem value="none">Self-funded (No financial aid)</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" {...register('funding')} />
                    {errors.funding && <p className="text-sm text-destructive">{errors.funding.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mode">Study Mode <span className="text-destructive">*</span></Label>
                    <Input 
                      id="mode" 
                      placeholder="e.g., In-person, Online, Hybrid"
                      {...register('mode')}
                      className={errors.mode ? 'border-destructive' : ''}
                    />
                    {errors.mode && <p className="text-sm text-destructive">{errors.mode.message}</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                    {isSubmitting ? (
                      <>
                        <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <SendIcon className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                  <Button type="reset" variant="outline">
                    Reset Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <GuidelineItem 
                icon={<CheckCircleIcon className="h-4 w-4" />}
                text="Submit only legitimate, verified opportunities"
              />
              <GuidelineItem 
                icon={<CheckCircleIcon className="h-4 w-4" />}
                text="Include the official website URL"
              />
              <GuidelineItem 
                icon={<CheckCircleIcon className="h-4 w-4" />}
                text="Check if the scholarship is already listed"
              />
              <GuidelineItem 
                icon={<AlertIcon className="h-4 w-4" />}
                text="Submissions are reviewed before publishing"
              />
            </CardContent>
          </Card>

          {/* Impact */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <HeartIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Make an Impact</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every scholarship you share could change someone&apos;s life. 
                Many students rely on this database to find opportunities they wouldn&apos;t discover otherwise.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Questions about submissions? Want to report an issue?
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="mailto:info@hbafoundation.org">
                  <MailIcon className="mr-2 h-4 w-4" />
                  Contact Us
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function GuidelineItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-primary shrink-0 mt-0.5">{icon}</span>
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

// Icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  );
}

function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
