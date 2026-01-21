import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getExecutiveProfile, getExecutiveIntroRequests, respondToIntroRequest, updateExecutiveAvailability } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Mountain, LogOut, Clock, Building2, CheckCircle, XCircle, Loader2, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [introRequests, setIntroRequests] = useState([]);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, requestsData] = await Promise.all([
        getExecutiveProfile().catch(() => null),
        getExecutiveIntroRequests().catch(() => [])
      ]);
      setProfile(profileData);
      setIntroRequests(requestsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (value) => {
    try {
      await updateExecutiveAvailability(value);
      setProfile(prev => ({ ...prev, availability: value }));
      toast.success('Availability updated');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleRespond = async (requestId, response) => {
    setRespondingTo(requestId);
    try {
      await respondToIntroRequest(requestId, response);
      setIntroRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: response } : req
      ));
      toast.success(`Request ${response}`);
    } catch (error) {
      toast.error('Failed to respond');
    } finally {
      setRespondingTo(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-slate-900 text-white',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
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
            <Button variant="ghost" size="sm" onClick={logout} data-testid="exec-dash-logout-btn">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-slate-600">Manage your executive profile and introduction requests.</p>
        </div>

        {!profile ? (
          <Card className="border-slate-200 shadow-card">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">Complete Your Application</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Submit your application to join Suite Summit's network of vetted fractional executives.
              </p>
              <Link to="/executive/apply">
                <Button className="bg-slate-900 text-white hover:bg-slate-800" data-testid="start-application-btn">
                  Start Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Alert */}
              {profile.status === 'pending' && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Application Pending Review</p>
                      <p className="text-sm text-yellow-700">Your profile is being reviewed by our team. You'll be notified once approved.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile.status === 'rejected' && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Application Not Approved</p>
                      <p className="text-sm text-red-700">Please contact support for more information.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Introduction Requests */}
              <Card className="border-slate-200 shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Introduction Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {introRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">No introduction requests yet</p>
                      <p className="text-sm text-slate-500 mt-1">Companies will reach out once they see your profile.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {introRequests.map((request) => (
                        <div key={request.id} className="p-4 bg-slate-50 rounded-lg space-y-3" data-testid={`intro-request-${request.id}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{request.company_name || 'Company'}</p>
                              <p className="text-sm text-slate-600">
                                {request.company_stage && <span className="capitalize">{request.company_stage.replace('-', ' ')}</span>}
                                {request.primary_challenge && <span> • {request.primary_challenge.replace('-', ' ')}</span>}
                              </p>
                            </div>
                            {request.status === 'pending' ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending Response</Badge>
                            ) : request.status === 'accepted' ? (
                              <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Declined</Badge>
                            )}
                          </div>
                          {request.message && (
                            <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">
                              "{request.message}"
                            </p>
                          )}
                          {request.status === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                className="bg-slate-900 text-white hover:bg-slate-800"
                                onClick={() => handleRespond(request.id, 'accepted')}
                                disabled={respondingTo === request.id}
                                data-testid={`accept-request-${request.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-200"
                                onClick={() => handleRespond(request.id, 'declined')}
                                disabled={respondingTo === request.id}
                                data-testid={`decline-request-${request.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Profile */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-slate-200 shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-lg">Your Profile</CardTitle>
                    {getStatusBadge(profile.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Role</p>
                    <p className="font-medium text-slate-900">{profile.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Experience</p>
                    <p className="font-medium text-slate-900">{profile.years_experience} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Industries</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.industries?.map((ind, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Engagement Size</p>
                    <p className="font-medium text-slate-900">{profile.engagement_size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Availability</p>
                    <Select value={profile.availability} onValueChange={handleAvailabilityChange}>
                      <SelectTrigger className="border-slate-200" data-testid="update-availability">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediately Available">Immediately Available</SelectItem>
                        <SelectItem value="Available in 2 weeks">Available in 2 weeks</SelectItem>
                        <SelectItem value="Available in 1 month">Available in 1 month</SelectItem>
                        <SelectItem value="Limited Availability">Limited Availability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Key Outcomes */}
              <Card className="border-slate-200 shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Key Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {profile.measurable_outcomes?.map((outcome, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
