import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateAIInsights, getCompanyProfile } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Mountain, ArrowRight, Sparkles, Target, Clock, TrendingUp, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AIInsights = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState(null);
  const [company, setCompany] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [companyData, insightData] = await Promise.all([
        getCompanyProfile(),
        generateAIInsights()
      ]);
      setCompany(companyData);
      setInsight(insightData);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Please complete your company profile first');
        navigate('/company/intake');
      } else {
        toast.error('Failed to load insights');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-mist flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Generating your personalized insights...</p>
          <p className="text-sm text-slate-500 mt-2">Our AI is analyzing your profile</p>
        </div>
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
            <Link to="/company/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} data-testid="insights-logout-btn">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Summit View Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Summit View
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
            Your Path to the Summit
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Based on your profile, here's our recommendation for {company?.company_name || 'your company'}.
          </p>
        </div>

        {/* Insight Cards */}
        <div className="space-y-6">
          {/* Recommended Role */}
          <Card className="border-slate-200 shadow-card overflow-hidden">
            <div className="bg-slate-900 px-6 py-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-ice-blue" />
                <h2 className="font-heading font-semibold text-lg text-white">Recommended Role</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-2xl font-heading font-bold text-slate-900" data-testid="insight-recommended-role">
                {insight?.recommended_role || 'Fractional CFO'}
              </p>
            </CardContent>
          </Card>

          {/* Engagement Scope */}
          <Card className="border-slate-200 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-slate-700" />
                <h2 className="font-heading font-semibold text-lg text-slate-900">Suggested Engagement</h2>
              </div>
              <p className="text-slate-700" data-testid="insight-engagement-scope">
                {insight?.engagement_scope || 'Loading...'}
              </p>
            </CardContent>
          </Card>

          {/* Expected Outcomes */}
          <Card className="border-slate-200 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-slate-700" />
                <h2 className="font-heading font-semibold text-lg text-slate-900">Expected Outcomes (90 Days)</h2>
              </div>
              <ul className="space-y-3" data-testid="insight-expected-outcomes">
                {(insight?.expected_outcomes || []).map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-slate-700">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Explanation */}
          <Card className="border-slate-200 shadow-card bg-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-slate-700" />
                <h2 className="font-heading font-semibold text-lg text-slate-900">Why This Fits</h2>
              </div>
              <p className="text-slate-700" data-testid="insight-explanation">
                {insight?.explanation || 'Loading...'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link to="/company/matches">
            <Button 
              size="lg" 
              className="bg-slate-900 text-white hover:bg-slate-800 px-8"
              data-testid="view-matches-btn"
            >
              View Matched Executives
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            Ready to find your ideal fractional executive
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
