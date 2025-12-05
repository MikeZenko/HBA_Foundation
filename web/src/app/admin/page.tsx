"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { scholarships } from "@/lib/data";

// Mock pending submissions data
const MOCK_SUBMISSIONS = [
  { id: 'SUB001', name: 'Chevening Scholarship', organization: 'UK Government', status: 'pending', submittedAt: '2024-12-01' },
  { id: 'SUB002', name: 'DAAD Scholarship', organization: 'German Academic Exchange', status: 'pending', submittedAt: '2024-12-02' },
  { id: 'SUB003', name: 'Australia Awards', organization: 'Australian Government', status: 'review', submittedAt: '2024-11-28' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Admin Dashboard
          </h1>
          <Badge variant="secondary" className="text-xs">Beta</Badge>
        </div>
        <p className="text-muted-foreground">
          Manage scholarships, review submissions, and monitor site activity.
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Scholarships" 
          value={scholarships.length} 
          icon={<GraduationIcon className="h-5 w-5" />}
          trend="+2 this month"
        />
        <StatCard 
          title="Fully Funded" 
          value={scholarships.filter(s => s.fundingType === 'full').length} 
          icon={<DollarIcon className="h-5 w-5" />}
        />
        <StatCard 
          title="Pending Review" 
          value={MOCK_SUBMISSIONS.filter(s => s.status === 'pending').length} 
          icon={<ClockIcon className="h-5 w-5" />}
          highlight
        />
        <StatCard 
          title="Verified" 
          value={scholarships.filter(s => s.verified).length} 
          icon={<CheckIcon className="h-5 w-5" />}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions
            {MOCK_SUBMISSIONS.filter(s => s.status === 'pending').length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                {MOCK_SUBMISSIONS.filter(s => s.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionButton 
                icon={<PlusIcon className="h-5 w-5" />}
                title="Add Scholarship"
                description="Create a new scholarship entry"
                disabled
              />
              <ActionButton 
                icon={<InboxIcon className="h-5 w-5" />}
                title="Review Submissions"
                description={`${MOCK_SUBMISSIONS.filter(s => s.status === 'pending').length} pending`}
                onClick={() => setActiveTab("submissions")}
              />
              <ActionButton 
                icon={<RefreshIcon className="h-5 w-5" />}
                title="Update Deadlines"
                description="Refresh deadline information"
                disabled
              />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest changes and submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem 
                  action="New submission received"
                  detail="DAAD Scholarship - German Academic Exchange"
                  time="2 hours ago"
                  type="submission"
                />
                <ActivityItem 
                  action="Scholarship verified"
                  detail="Fulbright Foreign Student Program"
                  time="1 day ago"
                  type="verified"
                />
                <ActivityItem 
                  action="Deadline updated"
                  detail="Erasmus Mundus Joint Masters - Extended to Feb 15"
                  time="2 days ago"
                  type="update"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Submissions</CardTitle>
              <CardDescription>Review and approve community submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {MOCK_SUBMISSIONS.length === 0 ? (
                <div className="text-center py-8">
                  <InboxIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending submissions</p>
                </div>
              ) : (
    <div className="space-y-4">
                  {MOCK_SUBMISSIONS.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Scholarships</CardTitle>
                <CardDescription>Manage existing scholarship entries</CardDescription>
              </div>
              <Button disabled>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Level</div>
                  <div className="col-span-2">Funding</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="divide-y">
                  {scholarships.slice(0, 10).map((s) => (
                    <div key={s.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-muted/30 transition-colors">
                      <div className="col-span-5">
                        <div className="font-medium text-foreground truncate">{s.title}</div>
                        <div className="text-xs text-muted-foreground">{s.organization}</div>
                      </div>
                      <div className="col-span-2 text-muted-foreground">{s.level}</div>
                      <div className="col-span-2">
                        <Badge 
                          variant="secondary"
                          className={`text-xs ${
                            s.fundingType === 'full' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {s.fundingType === 'full' ? 'Full' : 'Partial'}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        {s.verified ? (
                          <Badge className="bg-primary/10 text-primary text-xs">Verified</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Unverified</Badge>
                        )}
                      </div>
                      <div className="col-span-1 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/scholarships/${s.slug}`}>
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {scholarships.length > 10 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Showing 10 of {scholarships.length} scholarships
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Coming Soon Notice */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
          <h3 className="font-semibold text-foreground mb-2">Full Admin Features</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Complete CRUD operations, user management, analytics dashboard, and bulk operations 
            are in development. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, trend, highlight }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  trend?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary/50 bg-primary/5' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className={`${highlight ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</span>
          {trend && <span className="text-xs text-green-600">{trend}</span>}
        </div>
        <div className="mt-3">
          <div className={`text-3xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({ icon, title, description, onClick, disabled }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-start gap-4 p-4 rounded-lg border text-left transition-colors
        ${disabled 
          ? 'opacity-50 cursor-not-allowed bg-muted/30' 
          : 'hover:bg-muted/50 hover:border-primary/30'
        }
      `}
    >
      <span className="text-primary shrink-0 mt-0.5">{icon}</span>
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </button>
  );
}

function ActivityItem({ action, detail, time, type }: {
  action: string;
  detail: string;
  time: string;
  type: 'submission' | 'verified' | 'update';
}) {
  const icons = {
    submission: <InboxIcon className="h-4 w-4" />,
    verified: <CheckIcon className="h-4 w-4" />,
    update: <RefreshIcon className="h-4 w-4" />,
  };
  const colors = {
    submission: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    verified: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    update: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-full ${colors[type]}`}>
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground">{action}</div>
        <div className="text-sm text-muted-foreground truncate">{detail}</div>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">{time}</div>
    </div>
  );
}

function SubmissionCard({ submission }: { submission: typeof MOCK_SUBMISSIONS[0] }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${
          submission.status === 'pending' 
            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          <ClockIcon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium text-foreground">{submission.name}</div>
          <div className="text-sm text-muted-foreground">{submission.organization}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="capitalize">{submission.status}</Badge>
        <Button size="sm" variant="outline" disabled>Review</Button>
        <Button size="sm" disabled>Approve</Button>
      </div>
    </div>
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

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}
