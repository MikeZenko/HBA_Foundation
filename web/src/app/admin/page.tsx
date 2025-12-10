"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchContributions,
  fetchScholarships,
  approveContribution,
  rejectContribution,
  deleteContribution,
  updateContribution,
  setPendingContribution,
  updateScholarship,
  deleteScholarship,
  createScholarship,
  login,
  type Contribution,
  type BackendScholarship,
} from "@/lib/api";

const AUTH_KEY = 'adminAuthenticated';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState("overview");
  const [submissions, setSubmissions] = useState<Contribution[]>([]);
  const [scholarshipsList, setScholarshipsList] = useState<BackendScholarship[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Dialog states for contributions
  const [reviewOpen, setReviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Contribution | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog states for scholarships
  const [scholarshipEditOpen, setScholarshipEditOpen] = useState(false);
  const [scholarshipDeleteOpen, setScholarshipDeleteOpen] = useState(false);
  const [scholarshipCreateOpen, setScholarshipCreateOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<BackendScholarship | null>(null);

  // Load submissions and scholarships
  const loadData = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [submissionsData, scholarshipsData] = await Promise.all([
        fetchContributions(),
        fetchScholarships()
      ]);
      setSubmissions(submissionsData);
      setScholarshipsList(scholarshipsData);
    } catch (err) {
      setError('Failed to load data. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  // Legacy function for compatibility
  const loadSubmissions = loadData;

  // Check authentication on mount
  useEffect(() => {
    const isAuth = typeof window !== 'undefined' && sessionStorage.getItem(AUTH_KEY) === 'true';
    setAuthenticated(isAuth);
    if (!isAuth) {
      setLoginOpen(true);
    } else {
      loadData();
    }
  }, [loadData]);

  // Handle login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    
    try {
      const response = await login({ email: loginEmail, password: loginPassword });
      if (response.success) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        setAuthenticated(true);
        setLoginOpen(false);
        setLoginEmail('');
        setLoginPassword('');
        await loadData();
      } else {
        setLoginError(response.message || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Failed to connect to server. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoginLoading(false);
    }
  }

  // Handle logout
  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setLoginOpen(true);
    setSubmissions([]);
    setScholarshipsList([]);
  }

  // Action handlers with success messages
  async function handleApprove(id: number) {
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const result = await approveContribution(id);
      if (result.success) {
        setSuccessMessage('Scholarship approved successfully');
        await loadSubmissions();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to approve');
      }
    } catch (err) {
      setError('Failed to approve. Please try again.');
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(id: number) {
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const result = await rejectContribution(id);
      if (result.success) {
        setSuccessMessage('Scholarship rejected');
        await loadSubmissions();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to reject');
      }
    } catch (err) {
      setError('Failed to reject. Please try again.');
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSetPending(id: number) {
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const result = await setPendingContribution(id);
      if (result.success) {
        setSuccessMessage('Status set to pending');
        await loadSubmissions();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status. Please try again.');
      console.error('Failed to set pending:', err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedSubmission) return;
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const result = await deleteContribution(selectedSubmission.id);
      if (result.success) {
        setSuccessMessage('Submission deleted permanently');
        setDeleteOpen(false);
        setSelectedSubmission(null);
        await loadSubmissions();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to delete');
      }
    } catch (err) {
      setError('Failed to delete. Please try again.');
      console.error('Failed to delete:', err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEdit(data: Partial<Contribution>) {
    if (!selectedSubmission) return;
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const result = await updateContribution(selectedSubmission.id, data);
      if (result.success) {
        setSuccessMessage('Submission updated successfully');
        setEditOpen(false);
        setSelectedSubmission(null);
        await loadSubmissions();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to update');
      }
    } catch (err) {
      setError('Failed to update. Please try again.');
      console.error('Failed to update:', err);
    } finally {
      setActionLoading(false);
    }
  }

  // ============ Scholarship Action Handlers ============
  
  async function handleScholarshipEdit(data: Partial<BackendScholarship>) {
    if (!selectedScholarship) return;
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const result = await updateScholarship(selectedScholarship.id, data);
      if (result.success) {
        setSuccessMessage('Scholarship updated successfully');
        setScholarshipEditOpen(false);
        setSelectedScholarship(null);
        await loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to update scholarship');
      }
    } catch (err) {
      setError('Failed to update scholarship. Please try again.');
      console.error('Failed to update scholarship:', err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleScholarshipDelete() {
    if (!selectedScholarship) return;
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const result = await deleteScholarship(selectedScholarship.id);
      if (result.success) {
        setSuccessMessage('Scholarship deleted successfully');
        setScholarshipDeleteOpen(false);
        setSelectedScholarship(null);
        await loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to delete scholarship');
      }
    } catch (err) {
      setError('Failed to delete scholarship. Please try again.');
      console.error('Failed to delete scholarship:', err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleScholarshipCreate(data: Omit<BackendScholarship, 'id'>) {
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const result = await createScholarship(data);
      if (result.success) {
        setSuccessMessage('Scholarship created successfully');
        setScholarshipCreateOpen(false);
        await loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to create scholarship');
      }
    } catch (err) {
      setError('Failed to create scholarship. Please try again.');
      console.error('Failed to create scholarship:', err);
    } finally {
      setActionLoading(false);
    }
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;

  // Show login dialog if not authenticated
  if (!authenticated) {
    return (
      <Dialog open={loginOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Enter your credentials to access the admin dashboard
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="adminhba"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {loginError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {loginError}
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={loginLoading} className="w-full">
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage scholarships, review submissions, and monitor site activity.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogoutIcon className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Success message */}
      {successMessage && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-green-700 dark:text-green-400 text-sm">{successMessage}</p>
            <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)}>
              ×
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error message */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-destructive text-sm">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                Dismiss
              </Button>
              <Button variant="outline" size="sm" onClick={loadSubmissions}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Scholarships" 
          value={scholarshipsList.length} 
          icon={<GraduationIcon className="h-5 w-5" />}
        />
        <StatCard 
          title="Submissions" 
          value={submissions.length} 
          icon={<InboxIcon className="h-5 w-5" />}
        />
        <StatCard 
          title="Pending Review" 
          value={pendingCount} 
          icon={<ClockIcon className="h-5 w-5" />}
          highlight={pendingCount > 0}
        />
        <StatCard 
          title="Approved" 
          value={approvedCount} 
          icon={<CheckIcon className="h-5 w-5" />}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions
            {pendingCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                {pendingCount}
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
                icon={<InboxIcon className="h-5 w-5" />}
                title="Review Submissions"
                description={`${pendingCount} pending`}
                onClick={() => setActiveTab("submissions")}
              />
              <ActionButton 
                icon={<RefreshIcon className="h-5 w-5" />}
                title="Refresh Data"
                description="Reload from server"
                onClick={loadSubmissions}
              />
              <ActionButton 
                icon={<EyeIcon className="h-5 w-5" />}
                title="View Site"
                description="Open public site"
                onClick={() => window.open('/scholarships', '_blank')}
              />
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest scholarship contributions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No submissions yet</p>
              ) : (
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((sub) => (
                    <ActivityItem 
                      key={sub.id}
                      action={sub.scholarshipName}
                      detail={`${sub.organization} • ${sub.status}`}
                      time={new Date(sub.timestamp).toLocaleDateString()}
                      type={sub.status === 'approved' ? 'verified' : sub.status === 'pending' ? 'submission' : 'update'}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Submissions</CardTitle>
                  <CardDescription>Review, edit, approve, or reject community submissions</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status ({submissions.length})</SelectItem>
                    <SelectItem value="pending">Pending ({submissions.filter(s => s.status === 'pending').length})</SelectItem>
                    <SelectItem value="approved">Approved ({submissions.filter(s => s.status === 'approved').length})</SelectItem>
                    <SelectItem value="rejected">Rejected ({submissions.filter(s => s.status === 'rejected').length})</SelectItem>
                    <SelectItem value="hidden">Hidden ({submissions.filter(s => s.status === 'hidden').length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <InboxIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions
                    .filter(s => statusFilter === 'all' || s.status === statusFilter)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((submission) => (
                    <SubmissionCard 
                      key={submission.id} 
                      submission={submission}
                      onReview={() => {
                        setSelectedSubmission(submission);
                        setReviewOpen(true);
                      }}
                      onEdit={() => {
                        setSelectedSubmission(submission);
                        setEditOpen(true);
                      }}
                      onDelete={() => {
                        setSelectedSubmission(submission);
                        setDeleteOpen(true);
                      }}
                      onApprove={() => handleApprove(submission.id)}
                      onReject={() => handleReject(submission.id)}
                      onSetPending={() => handleSetPending(submission.id)}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Published Scholarships</CardTitle>
                  <CardDescription>Manage scholarships visible to users ({scholarshipsList.length} total)</CardDescription>
                </div>
                <Button onClick={() => setScholarshipCreateOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Scholarship
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : scholarshipsList.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No scholarships yet</p>
                  <Button className="mt-4" onClick={() => setScholarshipCreateOpen(true)}>
                    Add First Scholarship
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-2">Level</div>
                    <div className="col-span-2">Country</div>
                    <div className="col-span-2">Funding</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {scholarshipsList.map((s) => (
                      <div key={s.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-muted/30 transition-colors">
                        <div className="col-span-4">
                          <div className="font-medium text-foreground truncate">{s.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{s.organization}</div>
                        </div>
                        <div className="col-span-2 text-muted-foreground text-xs">
                          {Array.isArray(s.level) ? s.level.join(', ') : s.level}
                        </div>
                        <div className="col-span-2 text-muted-foreground text-xs truncate">{s.hostCountry}</div>
                        <div className="col-span-2">
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${
                              s.funding === 'Yes' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                          >
                            {s.funding === 'Yes' ? 'Fully Funded' : 'Partial'}
                          </Badge>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedScholarship(s);
                              setScholarshipEditOpen(true);
                            }}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedScholarship(s);
                              setScholarshipDeleteOpen(true);
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <a href={s.website} target="_blank" rel="noreferrer">
                              <ExternalLinkIcon className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Review the full submission before taking action
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
    <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Scholarship Name" value={selectedSubmission.scholarshipName} />
                <DetailItem label="Organization" value={selectedSubmission.organization} />
                <DetailItem label="Host Country" value={selectedSubmission.hostCountry} />
                <DetailItem label="Level" value={selectedSubmission.level} />
                <DetailItem label="Target Group" value={selectedSubmission.targetGroup} />
                <DetailItem label="Deadline" value={selectedSubmission.deadline} />
                <DetailItem label="Funding Type" value={selectedSubmission.fundingType} />
                <DetailItem label="Status" value={selectedSubmission.status} />
              </div>
              <DetailItem label="Website" value={selectedSubmission.website} isLink />
              <DetailItem label="Funding Details" value={selectedSubmission.fundingDetails} />
              <DetailItem label="Eligibility" value={selectedSubmission.eligibility} />
              <DetailItem label="Application Process" value={selectedSubmission.applicationProcess} />
              {selectedSubmission.additionalNotes && (
                <DetailItem label="Additional Notes" value={selectedSubmission.additionalNotes} />
              )}
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Submitted by:</span>{' '}
                    <span className="font-medium">{selectedSubmission.submitterName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="font-medium">{selectedSubmission.submitterEmail}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>{' '}
                    <span className="font-medium">{new Date(selectedSubmission.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Close</Button>
            {selectedSubmission?.status === 'pending' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleReject(selectedSubmission.id);
                    setReviewOpen(false);
                  }}
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    handleApprove(selectedSubmission.id);
                    setReviewOpen(false);
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>
              Update the submission details
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <EditForm 
              submission={selectedSubmission} 
              onSave={handleEdit}
              onCancel={() => setEditOpen(false)}
              loading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="py-4">
              <p className="font-medium">{selectedSubmission.scholarshipName}</p>
              <p className="text-sm text-muted-foreground">{selectedSubmission.organization}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Scholarship Dialogs ============ */}

      {/* Scholarship Edit Dialog */}
      <Dialog open={scholarshipEditOpen} onOpenChange={setScholarshipEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Scholarship</DialogTitle>
            <DialogDescription>
              Update the scholarship details
            </DialogDescription>
          </DialogHeader>
          {selectedScholarship && (
            <ScholarshipEditForm 
              scholarship={selectedScholarship} 
              onSave={handleScholarshipEdit}
              onCancel={() => setScholarshipEditOpen(false)}
              loading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Scholarship Delete Dialog */}
      <Dialog open={scholarshipDeleteOpen} onOpenChange={setScholarshipDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scholarship</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this scholarship? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedScholarship && (
            <div className="py-4">
              <p className="font-medium">{selectedScholarship.name}</p>
              <p className="text-sm text-muted-foreground">{selectedScholarship.organization}</p>
              <p className="text-xs text-muted-foreground mt-2">{selectedScholarship.hostCountry}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setScholarshipDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleScholarshipDelete} disabled={actionLoading}>
              {actionLoading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scholarship Create Dialog */}
      <Dialog open={scholarshipCreateOpen} onOpenChange={setScholarshipCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Scholarship</DialogTitle>
            <DialogDescription>
              Create a new scholarship listing
            </DialogDescription>
          </DialogHeader>
          <ScholarshipCreateForm 
            onSave={handleScholarshipCreate}
            onCancel={() => setScholarshipCreateOpen(false)}
            loading={actionLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      {isLink ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
          {value}
        </a>
      ) : (
        <div className="text-sm">{value}</div>
      )}
    </div>
  );
}

function EditForm({ 
  submission, 
  onSave, 
  onCancel, 
  loading 
}: { 
  submission: Contribution; 
  onSave: (data: Partial<Contribution>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    scholarshipName: submission.scholarshipName,
    organization: submission.organization,
    website: submission.website,
    level: submission.level,
    hostCountry: submission.hostCountry,
    targetGroup: submission.targetGroup,
    deadline: submission.deadline,
    fundingType: submission.fundingType,
    fundingDetails: submission.fundingDetails,
    eligibility: submission.eligibility,
    applicationProcess: submission.applicationProcess,
    additionalNotes: submission.additionalNotes || '',
    status: submission.status,
  });

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scholarshipName">Scholarship Name</Label>
          <Input 
            id="scholarshipName" 
            value={formData.scholarshipName}
            onChange={(e) => handleChange('scholarshipName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Input 
            id="organization" 
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hostCountry">Host Country</Label>
          <Input 
            id="hostCountry" 
            value={formData.hostCountry}
            onChange={(e) => handleChange('hostCountry', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Input 
            id="level" 
            value={formData.level}
            onChange={(e) => handleChange('level', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetGroup">Target Group</Label>
          <Input 
            id="targetGroup" 
            value={formData.targetGroup}
            onChange={(e) => handleChange('targetGroup', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input 
            id="deadline" 
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fundingType">Funding Type</Label>
          <Select value={formData.fundingType} onValueChange={(v) => handleChange('fundingType', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Fully Funded</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="No">Not Funded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input 
          id="website" 
          value={formData.website}
          onChange={(e) => handleChange('website', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fundingDetails">Funding Details</Label>
        <Input 
          id="fundingDetails" 
          value={formData.fundingDetails}
          onChange={(e) => handleChange('fundingDetails', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="eligibility">Eligibility</Label>
        <Input 
          id="eligibility" 
          value={formData.eligibility}
          onChange={(e) => handleChange('eligibility', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="applicationProcess">Application Process</Label>
        <Input 
          id="applicationProcess" 
          value={formData.applicationProcess}
          onChange={(e) => handleChange('applicationProcess', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Input 
          id="additionalNotes" 
          value={formData.additionalNotes}
          onChange={(e) => handleChange('additionalNotes', e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ============ Scholarship Form Components ============

function ScholarshipEditForm({ 
  scholarship, 
  onSave, 
  onCancel, 
  loading 
}: { 
  scholarship: BackendScholarship; 
  onSave: (data: Partial<BackendScholarship>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: scholarship.name,
    organization: scholarship.organization,
    website: scholarship.website,
    hostCountry: scholarship.hostCountry,
    region: scholarship.region || '',
    targetGroup: scholarship.targetGroup || '',
    level: Array.isArray(scholarship.level) ? scholarship.level.join(', ') : scholarship.level,
    deadline: scholarship.deadline,
    funding: scholarship.funding,
    fundingDetails: scholarship.fundingDetails || '',
    eligibility: scholarship.eligibility || '',
    applicationProcess: scholarship.applicationProcess || '',
    notes: scholarship.notes || '',
    returnHome: scholarship.returnHome || 'No',
  });

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...formData,
      level: formData.level.split(',').map(l => l.trim()).filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Scholarship Name *</Label>
          <Input 
            id="name" 
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization">Organization *</Label>
          <Input 
            id="organization" 
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hostCountry">Host Country *</Label>
          <Input 
            id="hostCountry" 
            value={formData.hostCountry}
            onChange={(e) => handleChange('hostCountry', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Input 
            id="region" 
            value={formData.region}
            onChange={(e) => handleChange('region', e.target.value)}
            placeholder="e.g., North America, Asia, Online"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level (comma-separated)</Label>
          <Input 
            id="level" 
            value={formData.level}
            onChange={(e) => handleChange('level', e.target.value)}
            placeholder="e.g., Bachelor's, Master's"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetGroup">Target Group</Label>
          <Input 
            id="targetGroup" 
            value={formData.targetGroup}
            onChange={(e) => handleChange('targetGroup', e.target.value)}
            placeholder="e.g., Afghan Women, Refugees"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input 
            id="deadline" 
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            placeholder="e.g., Ongoing, Jan 15 annually"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="funding">Funding</Label>
          <Select value={formData.funding} onValueChange={(v) => handleChange('funding', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Fully Funded</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="No">Not Funded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website URL *</Label>
        <Input 
          id="website" 
          type="url"
          value={formData.website}
          onChange={(e) => handleChange('website', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fundingDetails">Funding Details</Label>
        <Input 
          id="fundingDetails" 
          value={formData.fundingDetails}
          onChange={(e) => handleChange('fundingDetails', e.target.value)}
          placeholder="What the funding covers..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="eligibility">Eligibility</Label>
        <Input 
          id="eligibility" 
          value={formData.eligibility}
          onChange={(e) => handleChange('eligibility', e.target.value)}
          placeholder="Who can apply..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="applicationProcess">Application Process</Label>
        <Input 
          id="applicationProcess" 
          value={formData.applicationProcess}
          onChange={(e) => handleChange('applicationProcess', e.target.value)}
          placeholder="How to apply..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input 
          id="notes" 
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional information..."
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ScholarshipCreateForm({ 
  onSave, 
  onCancel, 
  loading 
}: { 
  onSave: (data: Omit<BackendScholarship, 'id'>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    website: '',
    hostCountry: '',
    region: '',
    targetGroup: '',
    level: '',
    deadline: '',
    funding: 'Yes',
    fundingDetails: '',
    eligibility: '',
    applicationProcess: '',
    notes: '',
    returnHome: 'No',
  });

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...formData,
      level: formData.level.split(',').map(l => l.trim()).filter(Boolean),
    } as Omit<BackendScholarship, 'id'>);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="create-name">Scholarship Name *</Label>
          <Input 
            id="create-name" 
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-organization">Organization *</Label>
          <Input 
            id="create-organization" 
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-hostCountry">Host Country *</Label>
          <Input 
            id="create-hostCountry" 
            value={formData.hostCountry}
            onChange={(e) => handleChange('hostCountry', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-region">Region</Label>
          <Input 
            id="create-region" 
            value={formData.region}
            onChange={(e) => handleChange('region', e.target.value)}
            placeholder="e.g., North America, Asia, Online"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-level">Level (comma-separated)</Label>
          <Input 
            id="create-level" 
            value={formData.level}
            onChange={(e) => handleChange('level', e.target.value)}
            placeholder="e.g., Bachelor's, Master's"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-targetGroup">Target Group</Label>
          <Input 
            id="create-targetGroup" 
            value={formData.targetGroup}
            onChange={(e) => handleChange('targetGroup', e.target.value)}
            placeholder="e.g., Afghan Women, Refugees"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-deadline">Deadline</Label>
          <Input 
            id="create-deadline" 
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            placeholder="e.g., Ongoing, Jan 15 annually"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-funding">Funding</Label>
          <Select value={formData.funding} onValueChange={(v) => handleChange('funding', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Fully Funded</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="No">Not Funded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-website">Website URL *</Label>
        <Input 
          id="create-website" 
          type="url"
          value={formData.website}
          onChange={(e) => handleChange('website', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-fundingDetails">Funding Details</Label>
        <Input 
          id="create-fundingDetails" 
          value={formData.fundingDetails}
          onChange={(e) => handleChange('fundingDetails', e.target.value)}
          placeholder="What the funding covers..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-eligibility">Eligibility</Label>
        <Input 
          id="create-eligibility" 
          value={formData.eligibility}
          onChange={(e) => handleChange('eligibility', e.target.value)}
          placeholder="Who can apply..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-applicationProcess">Application Process</Label>
        <Input 
          id="create-applicationProcess" 
          value={formData.applicationProcess}
          onChange={(e) => handleChange('applicationProcess', e.target.value)}
          placeholder="How to apply..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-notes">Notes</Label>
        <Input 
          id="create-notes" 
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional information..."
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Scholarship'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function StatCard({ title, value, icon, highlight }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary/50 bg-primary/5' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className={`${highlight ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</span>
        </div>
        <div className="mt-3">
          <div className={`text-3xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({ icon, title, description, onClick }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-4 rounded-lg border text-left transition-colors hover:bg-muted/50 hover:border-primary/30"
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
    submission: <ClockIcon className="h-4 w-4" />,
    verified: <CheckIcon className="h-4 w-4" />,
    update: <RefreshIcon className="h-4 w-4" />,
  };
  const colors = {
    submission: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    verified: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    update: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-full ${colors[type]}`}>
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">{action}</div>
        <div className="text-sm text-muted-foreground truncate">{detail}</div>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">{time}</div>
    </div>
  );
}

function SubmissionCard({ 
  submission, 
  onReview, 
  onEdit, 
  onDelete,
  onApprove,
  onReject,
  onSetPending,
  loading 
}: { 
  submission: Contribution;
  onReview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSetPending: () => void;
  loading: boolean;
}) {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    hidden: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{submission.scholarshipName}</h3>
              <Badge className={`text-xs ${statusColors[submission.status]}`}>
                {submission.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{submission.organization}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{submission.hostCountry}</span>
              <span>•</span>
              <span>{submission.level}</span>
              <span>•</span>
              <span>{new Date(submission.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={onReview}>
              <EyeIcon className="h-4 w-4 mr-1" />
              Review
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <EditIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            {submission.status === 'pending' && (
              <>
                <Button size="sm" variant="outline" onClick={onReject} disabled={loading}>
                  Reject
                </Button>
                <Button size="sm" onClick={onApprove} disabled={loading}>
                  Approve
                </Button>
              </>
            )}
            
            {submission.status !== 'pending' && (
              <Button size="sm" variant="outline" onClick={onSetPending} disabled={loading}>
                Set Pending
              </Button>
            )}
            
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive hover:text-destructive">
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
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

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}
