import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatchedExecutives, createIntroRequest } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Mountain, LogOut, Briefcase, Building2, Calendar, CheckCircle, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

const MatchedExecutives = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [executives, setExecutives] = useState([]);
  const [selectedExec, setSelectedExec] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadExecutives();
  }, []);

  const loadExecutives = async () => {
    try {
      const data = await getMatchedExecutives();
      setExecutives(data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load executives');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestIntro = async () => {
    if (!selectedExec) return;
    setSending(true);
    try {
      await createIntroRequest(selectedExec.id, message);
      toast.success('Introduction request sent!');
      setDialogOpen(false);
      setMessage('');
      setSelectedExec(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const executiveImages = [
    'https://images.unsplash.com/photo-1767175620484-1ed37931a0d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxjb25maWRlbnQlMjBidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0JTIwZ3JleSUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzY4OTU0OTQ0fDA&ixlib=rb-4.1.0&q=85&w=200',
    'https://images.unsplash.com/photo-1704627363842-a169b9743309?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxjb25maWRlbnQlMjBidXNpbmVzcyUyMGdvbWFuJTIwcG9ydHJhaXQlMjBncmV5JTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3Njg5NTQ5NDd8MA&ixlib=rb-4.1.0&q=85&w=200'
  ];

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
            <Link to="/company/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link to="/company/insights">
              <Button variant="ghost" size="sm">AI Insights</Button>
            </Link>
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">Matched Executives</h1>
          <p className="text-slate-600">
            Vetted fractional executives matched to your company's needs.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : executives.length === 0 ? (
          <Card className="border-slate-200 shadow-card">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">No Executives Available Yet</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Our team is actively reviewing applications. Check back soon for matched executives.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executives.map((exec, index) => (
              <Card 
                key={exec.id} 
                className="border-slate-200 shadow-card hover:shadow-hover transition-all duration-300 card-lift overflow-hidden"
                data-testid={`executive-card-${index}`}
              >
                <CardContent className="p-0">
                  {/* Profile Header */}
                  <div className="bg-slate-50 p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <img 
                        src={executiveImages[index % executiveImages.length]}
                        alt={exec.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                      />
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-slate-900">{exec.name}</h3>
                        <p className="text-sm text-slate-600">{exec.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Content */}
                  <div className="p-6 space-y-4">
                    {/* Industries */}
                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Building2 className="w-4 h-4" />
                        <span>Industries</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exec.industries.slice(0, 3).map((ind, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Outcomes */}
                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Key Outcomes</span>
                      </div>
                      <ul className="space-y-1">
                        {exec.measurable_outcomes.slice(0, 2).map((outcome, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-sky-500 mt-1">•</span>
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Engagement & Availability */}
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {exec.engagement_size}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {exec.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="px-6 pb-6">
                    <Dialog open={dialogOpen && selectedExec?.id === exec.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (!open) setSelectedExec(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-slate-900 text-white hover:bg-slate-800"
                          onClick={() => setSelectedExec(exec)}
                          data-testid={`request-intro-btn-${index}`}
                        >
                          Request Introduction
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-heading">Request Introduction</DialogTitle>
                          <DialogDescription>
                            Send an introduction request to {selectedExec?.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="message">Message (Optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Briefly describe what you're looking for..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="min-h-[100px]"
                              data-testid="intro-request-message"
                            />
                          </div>
                          <Button 
                            onClick={handleRequestIntro} 
                            disabled={sending}
                            className="w-full bg-slate-900 text-white hover:bg-slate-800"
                            data-testid="send-intro-request-btn"
                          >
                            {sending ? 'Sending...' : 'Send Request'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchedExecutives;
