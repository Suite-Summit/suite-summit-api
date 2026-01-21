import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllExecutives, getAllCompanies, getAllIntroRequests, getAILogs, getPlatformStats, updateExecutiveStatus } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Mountain, LogOut, Users, Building2, FileText, Brain, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [executives, setExecutives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [introRequests, setIntroRequests] = useState([]);
  const [aiLogs, setAILogs] = useState([]);
  const [updatingExec, setUpdatingExec] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, execData, companyData, requestsData, logsData] = await Promise.all([
        getPlatformStats(),
        getAllExecutives(),
        getAllCompanies(),
        getAllIntroRequests(),
        getAILogs()
      ]);
      setStats(statsData);
      setExecutives(execData);
      setCompanies(companyData);
      setIntroRequests(requestsData);
      setAILogs(logsData);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (execId, status) => {
    setUpdatingExec(execId);
    try {
      await updateExecutiveStatus(execId, status);
      setExecutives(prev => prev.map(exec => 
        exec.id === execId ? { ...exec, status } : exec
      ));
      toast.success(`Executive ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingExec(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[status] || styles.pending}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-mist flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-mist">
      {/* Header */}
      <nav className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="w-8 h-8" />
            <span className="font-heading font-bold text-xl">Suite Summit</span>
            <Badge className="ml-2 bg-sky-500 text-white">Admin</Badge>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-slate-800" data-testid="admin-logout-btn">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Monitor and manage the Suite Summit platform.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Companies</p>
                  <p className="text-2xl font-heading font-bold text-slate-900">{stats?.total_companies || 0}</p>
                </div>
                <Building2 className="w-8 h-8 text-slate-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Executives</p>
                  <p className="text-2xl font-heading font-bold text-slate-900">{stats?.total_executives || 0}</p>
                  <p className="text-xs text-slate-400">{stats?.pending_executives || 0} pending</p>
                </div>
                <Users className="w-8 h-8 text-slate-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Intro Requests</p>
                  <p className="text-2xl font-heading font-bold text-slate-900">{stats?.total_intros || 0}</p>
                  <p className="text-xs text-slate-400">{stats?.accepted_intros || 0} accepted</p>
                </div>
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Approved Execs</p>
                  <p className="text-2xl font-heading font-bold text-slate-900">{stats?.approved_executives || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="executives" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="executives" data-testid="admin-tab-executives">Executives</TabsTrigger>
            <TabsTrigger value="companies" data-testid="admin-tab-companies">Companies</TabsTrigger>
            <TabsTrigger value="requests" data-testid="admin-tab-requests">Intro Requests</TabsTrigger>
            <TabsTrigger value="ai-logs" data-testid="admin-tab-ai-logs">AI Logs</TabsTrigger>
          </TabsList>

          {/* Executives Tab */}
          <TabsContent value="executives">
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="font-heading">Executive Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executives.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          No executive applications yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      executives.map((exec) => (
                        <TableRow key={exec.id} data-testid={`exec-row-${exec.id}`}>
                          <TableCell className="font-medium">{exec.user_name}</TableCell>
                          <TableCell>{exec.user_email}</TableCell>
                          <TableCell>{exec.title}</TableCell>
                          <TableCell>{exec.years_experience} years</TableCell>
                          <TableCell>{getStatusBadge(exec.status)}</TableCell>
                          <TableCell>
                            {exec.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleUpdateStatus(exec.id, 'approved')}
                                  disabled={updatingExec === exec.id}
                                  data-testid={`approve-exec-${exec.id}`}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => handleUpdateStatus(exec.id, 'rejected')}
                                  disabled={updatingExec === exec.id}
                                  data-testid={`reject-exec-${exec.id}`}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="font-heading">Registered Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Challenge</TableHead>
                      <TableHead>Looking For</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          No companies registered yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.company_name}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{company.contact_name}</p>
                              <p className="text-xs text-slate-500">{company.contact_email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{company.company_stage?.replace('-', ' ')}</TableCell>
                          <TableCell>{company.revenue_range}</TableCell>
                          <TableCell className="capitalize">{company.primary_challenge?.replace('-', ' ')}</TableCell>
                          <TableCell>{company.desired_role}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Intro Requests Tab */}
          <TabsContent value="requests">
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="font-heading">Introduction Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company ID</TableHead>
                      <TableHead>Executive ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {introRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          No intro requests yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      introRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-mono text-sm">{request.company_id?.slice(0, 8)}...</TableCell>
                          <TableCell className="font-mono text-sm">{request.executive_id?.slice(0, 8)}...</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Logs Tab */}
          <TabsContent value="ai-logs">
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Output Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No AI interactions logged yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="p-4 bg-slate-50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-slate-900 text-white">{log.model_used}</Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <p className="text-slate-500 mb-1">Response:</p>
                          <p className="text-slate-700 bg-white p-3 rounded border border-slate-200 max-h-32 overflow-y-auto">
                            {log.response?.slice(0, 500)}...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
