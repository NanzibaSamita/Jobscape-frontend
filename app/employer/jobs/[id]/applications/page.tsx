'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getJobApplications, updateApplicationStatus, type ApplicationStatus } from '@/lib/api/applications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, 
  TrendingUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Users,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import ApplicationDetailModal from '@/components/ApplicationDetailModal';

interface BackendApplication {
  id: string;
  job_id: string;
  jobseeker_id: string;
  resume_id: string | null;
  status: ApplicationStatus;
  match_score: number;
  cover_letter: string | null;
  applied_at: string;
  updated_at: string;
  applicant_name?: string;
  applicant_email?: string;
}

type FilterType = ApplicationStatus | 'ALL';

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [applications, setApplications] = useState<BackendApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, [jobId, filter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const statusFilter = filter !== 'ALL' ? filter : undefined;
      const data = await getJobApplications(jobId, statusFilter);
      setApplications(data as BackendApplication[]);
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      toast.error(error.response?.data?.detail || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig: Record<ApplicationStatus, { color: string; icon: any; label: string }> = {
      PENDING: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' },
      REVIEWED: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Reviewed' },
      SHORTLISTED: { color: 'bg-indigo-100 text-indigo-800', icon: Users, label: 'Shortlisted' },
      INTERVIEW_SCHEDULED: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Interview' },
      ACCEPTED: { color: 'bg-green-200 text-green-900', icon: CheckCircle2, label: 'Accepted' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      WITHDRAWN: { color: 'bg-gray-100 text-gray-600', icon: XCircle, label: 'Withdrawn' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      setUpdatingStatus(applicationId);
      await updateApplicationStatus(applicationId, { status: newStatus });
      toast.success(`Application status updated`);
      loadApplications();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusActions = (app: BackendApplication) => {
    const isUpdating = updatingStatus === app.id;

    switch (app.status) {
      case 'PENDING':
        return (
          <>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(app.id, 'REVIEWED')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Reviewed'}
            </Button>
            <Button 
              size="sm"
              onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
              disabled={isUpdating}
            >
              Shortlist
            </Button>
          </>
        );
      case 'REVIEWED':
        return (
          <Button 
            size="sm"
            onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Shortlist'}
          </Button>
        );
      case 'SHORTLISTED':
        return (
          <Button 
            size="sm"
            onClick={() => handleStatusUpdate(app.id, 'INTERVIEW_SCHEDULED')}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Schedule Interview'}
          </Button>
        );
      case 'INTERVIEW_SCHEDULED':
        return (
          <Button 
            size="sm"
            onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept'}
          </Button>
        );
      default:
        return null;
    }
  };

  const getApplicationStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'PENDING').length,
      reviewed: applications.filter(a => a.status === 'REVIEWED').length,
      shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
      interview: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
      accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    };
    return stats;
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Jobs
          </Button>
          <h1 className="text-3xl font-bold mb-2">Job Applications</h1>
          <p className="text-gray-600">Review and manage applications for this position</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
              <div className="text-sm text-gray-600">Reviewed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{stats.shortlisted}</div>
              <div className="text-sm text-gray-600">Shortlisted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.interview}</div>
              <div className="text-sm text-gray-600">Interview</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="REVIEWED">Reviewed</TabsTrigger>
            <TabsTrigger value="SHORTLISTED">Shortlisted</TabsTrigger>
            <TabsTrigger value="INTERVIEW_SCHEDULED">Interview</TabsTrigger>
            <TabsTrigger value="ACCEPTED">Accepted</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 mb-2">No applications found</p>
                  <p className="text-sm text-gray-400">
                    {filter !== 'ALL' 
                      ? `No applications with status: ${filter.replace('_', ' ')}` 
                      : 'Applications will appear here once candidates apply'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const name = app.applicant_name || 'Unknown Applicant';
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                  return (
                    <Card key={app.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          {/* Applicant Info */}
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="text-lg bg-primary/10">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-1">{name}</CardTitle>
                              {app.applicant_email && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Mail className="h-4 w-4" />
                                  {app.applicant_email}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status & Match Score */}
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(app.status)}
                            <Badge className={`${getMatchScoreColor(app.match_score)} flex items-center gap-1`}>
                              <TrendingUp className="h-3 w-3" />
                              {app.match_score}% Match
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Applied {new Date(app.applied_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-4">
                          {/* Match Score Bar */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">Match Score</h4>
                              <span className="text-xs text-gray-600">{getMatchScoreLabel(app.match_score)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  app.match_score >= 80 ? 'bg-green-500' : 
                                  app.match_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${app.match_score}%` }}
                              />
                            </div>
                          </div>

                          {/* Cover Letter Preview */}
                          {app.cover_letter && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Cover Letter</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-700 line-clamp-3">
                                  {app.cover_letter}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-4 border-t flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplicationId(app.id)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Full Details & Resume
                            </Button>
                            
                            {getStatusActions(app)}
                            
                            {app.status !== 'REJECTED' && app.status !== 'WITHDRAWN' && app.status !== 'ACCEPTED' && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                disabled={updatingStatus === app.id}
                                className="ml-auto"
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Detail Modal */}
      {selectedApplicationId && (
        <ApplicationDetailModal
          applicationId={selectedApplicationId}
          isOpen={!!selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
        />
      )}
    </>
  );
}