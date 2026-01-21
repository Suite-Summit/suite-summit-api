import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCompanyProfile, getCompanyIntroRequests } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Mountain, LogOut, ArrowRight, Building2, Target, Clock, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [introRequests, setIntroRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, requestsData] = await Promise.all([
        getCompanyProfile().catch(() => null),
        getCompanyIntroRequests().catch(() => [])
      ]);
      setProfile(profileData);
      setIntroRequests(requestsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
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
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="w-8 h-8 text-slate-900" />
            <span className="font-heading font-bold text-xl text-slate-900">Suite Summit</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} data-testid="company-logout-btn">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">
            Welcome back{profile ? `, ${profile.company_name}` : ''}
          </h1>
          <p className="text-slate-600">Manage your executive search from your dashboard.</p>
        </div>

        {!profile ? (
          <Card className="border-slate-200 shadow-card">
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">Complete Your Profile</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Tell us about your company to get personalized AI insights and matched executives.
              </p>
              <Link to="/company/intake">
                <Button className="bg-slate-900 text-white hover:bg-slate-800" data-testid="start-intake-btn">
                  Start Intake
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/company/insights" className="block">
                  <Card className="border-slate-200 shadow-card hover:shadow-hover transition-all card-lift h-full">
                    <CardContent className="p-6">
                      <Target className="w-8 h-8 text-sky-500 mb-4" />
                      <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">AI Insights</h3>
                      <p className="text-sm text-slate-600">View your personalized recommendations</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/company/matches" className="block">
                  <Card className="border-slate-200 shadow-card hover:shadow-hover transition-all card-lift h-full">
                    <CardContent className="p-6">
                      <FileText className="w-8 h-8 text-sky-500 mb-4" />
                      <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">Matched Executives</h3>
                      <p className="text-sm text-slate-600">Browse and request introductions</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Intro Requests */}
              <Card className="border-slate-200 shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Your Introduction Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {introRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">No introduction requests yet</p>
                      <Link to="/company/matches">
                        <Button variant="link" className="mt-2">Browse executives</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {introRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{request.executive_name || 'Executive'}</p>
                            <p className="text-sm text-slate-600">{request.executive_title || 'Fractional CFO'}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Company Profile Summary */}
            <div className="lg:col-span-1">
              <Card className="border-slate-200 shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Company</p>
                    <p className="font-medium text-slate-900">{profile.company_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Stage</p>
                    <p className="font-medium text-slate-900 capitalize">{profile.company_stage?.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Revenue</p>
                    <p className="font-medium text-slate-900">{profile.revenue_range}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Challenge</p>
                    <p className="font-medium text-slate-900 capitalize">{profile.primary_challenge?.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Looking For</p>
                    <p className="font-medium text-slate-900">{profile.desired_role}</p>
                  </div>
                  <Link to="/company/intake">
                    <Button variant="outline" className="w-full mt-4 border-slate-200">
                      Update Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
