import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitIntake } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Mountain, ArrowLeft, ArrowRight, Check, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 'company', title: 'Company Info', description: 'Tell us about your company' },
  { id: 'challenge', title: 'Your Challenge', description: 'What are you trying to solve?' },
  { id: 'role', title: 'Role & Scope', description: 'Define what you need' },
  { id: 'budget', title: 'Budget & Hours', description: 'Investment parameters' },
  { id: 'review', title: 'Review', description: 'Confirm your details' }
];

const CompanyIntake = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_stage: '',
    revenue_range: '',
    primary_challenge: '',
    desired_role: 'Fractional CFO',
    budget_range: '',
    desired_hours: '',
    additional_info: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.company_name && formData.company_stage && formData.revenue_range;
      case 1:
        return formData.primary_challenge;
      case 2:
        return formData.desired_role;
      case 3:
        return formData.budget_range && formData.desired_hours;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitIntake(formData);
      toast.success('Profile completed! Generating insights...');
      navigate('/company/insights');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit intake');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-slate-700">Company Name</Label>
              <Input
                id="company_name"
                placeholder="Acme Corp"
                value={formData.company_name}
                onChange={(e) => updateField('company_name', e.target.value)}
                className="border-slate-200"
                data-testid="intake-company-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_stage" className="text-slate-700">Company Stage</Label>
              <Select value={formData.company_stage} onValueChange={(v) => updateField('company_stage', v)}>
                <SelectTrigger className="border-slate-200" data-testid="intake-company-stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series-a">Series A</SelectItem>
                  <SelectItem value="series-b">Series B+</SelectItem>
                  <SelectItem value="growth">Growth Stage</SelectItem>
                  <SelectItem value="pe-backed">PE-Backed</SelectItem>
                  <SelectItem value="bootstrapped">Bootstrapped / Profitable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue_range" className="text-slate-700">Annual Revenue Range</Label>
              <Select value={formData.revenue_range} onValueChange={(v) => updateField('revenue_range', v)}>
                <SelectTrigger className="border-slate-200" data-testid="intake-revenue-range">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-revenue">Pre-Revenue</SelectItem>
                  <SelectItem value="0-500k">$0 - $500K</SelectItem>
                  <SelectItem value="500k-2m">$500K - $2M</SelectItem>
                  <SelectItem value="2m-10m">$2M - $10M</SelectItem>
                  <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                  <SelectItem value="50m+">$50M+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primary_challenge" className="text-slate-700">Primary Challenge</Label>
              <p className="text-sm text-slate-500 mb-3">What's the main reason you're looking for fractional leadership?</p>
              <Select value={formData.primary_challenge} onValueChange={(v) => updateField('primary_challenge', v)}>
                <SelectTrigger className="border-slate-200" data-testid="intake-primary-challenge">
                  <SelectValue placeholder="Select your primary challenge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash-flow">Cash Flow Management</SelectItem>
                  <SelectItem value="fundraising">Fundraising / Investor Relations</SelectItem>
                  <SelectItem value="financial-modeling">Financial Modeling & Forecasting</SelectItem>
                  <SelectItem value="cost-optimization">Cost Optimization</SelectItem>
                  <SelectItem value="scaling-finance">Scaling Finance Operations</SelectItem>
                  <SelectItem value="compliance">Compliance & Audit Prep</SelectItem>
                  <SelectItem value="strategic-planning">Strategic Planning</SelectItem>
                  <SelectItem value="ma-prep">M&A Preparation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="desired_role" className="text-slate-700">Desired Role</Label>
              <Select value={formData.desired_role} onValueChange={(v) => updateField('desired_role', v)}>
                <SelectTrigger className="border-slate-200" data-testid="intake-desired-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fractional CFO">Fractional CFO</SelectItem>
                  <SelectItem value="Fractional COO" disabled>Fractional COO (Coming Soon)</SelectItem>
                  <SelectItem value="Fractional CMO" disabled>Fractional CMO (Coming Soon)</SelectItem>
                  <SelectItem value="Fractional CTO" disabled>Fractional CTO (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-sm text-sky-900">
                <strong>Fractional CFO</strong> provides strategic financial leadership including cash management, financial planning, investor relations, and operational finance—without full-time overhead.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="budget_range" className="text-slate-700">Monthly Budget Range</Label>
              <Select value={formData.budget_range} onValueChange={(v) => updateField('budget_range', v)}>
                <SelectTrigger className="border-slate-200" data-testid="intake-budget-range">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3k-5k">$3,000 - $5,000/mo</SelectItem>
                  <SelectItem value="5k-10k">$5,000 - $10,000/mo</SelectItem>
                  <SelectItem value="10k-15k">$10,000 - $15,000/mo</SelectItem>
                  <SelectItem value="15k-25k">$15,000 - $25,000/mo</SelectItem>
                  <SelectItem value="25k+">$25,000+/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desired_hours" className="text-slate-700">Desired Hours per Month</Label>
              <Select value={formData.desired_hours} onValueChange={(v) => updateField('desired_hours', v)}>
                <SelectTrigger className="border-slate-200" data-testid="intake-desired-hours">
                  <SelectValue placeholder="Select hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10-20">10-20 hours/month</SelectItem>
                  <SelectItem value="20-40">20-40 hours/month</SelectItem>
                  <SelectItem value="40-60">40-60 hours/month</SelectItem>
                  <SelectItem value="60+">60+ hours/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additional_info" className="text-slate-700">Additional Information (Optional)</Label>
              <Textarea
                id="additional_info"
                placeholder="Any other context that would help us match you better..."
                value={formData.additional_info}
                onChange={(e) => updateField('additional_info', e.target.value)}
                className="border-slate-200 min-h-[100px]"
                data-testid="intake-additional-info"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
              <h3 className="font-heading font-semibold text-lg text-slate-900">Your Profile Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Company</p>
                  <p className="font-medium text-slate-900">{formData.company_name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Stage</p>
                  <p className="font-medium text-slate-900 capitalize">{formData.company_stage.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Revenue</p>
                  <p className="font-medium text-slate-900">{formData.revenue_range}</p>
                </div>
                <div>
                  <p className="text-slate-500">Challenge</p>
                  <p className="font-medium text-slate-900 capitalize">{formData.primary_challenge.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Role</p>
                  <p className="font-medium text-slate-900">{formData.desired_role}</p>
                </div>
                <div>
                  <p className="text-slate-500">Budget</p>
                  <p className="font-medium text-slate-900">{formData.budget_range}/mo</p>
                </div>
                <div>
                  <p className="text-slate-500">Hours</p>
                  <p className="font-medium text-slate-900">{formData.desired_hours} hrs/mo</p>
                </div>
              </div>
              {formData.additional_info && (
                <div>
                  <p className="text-slate-500 text-sm">Additional Info</p>
                  <p className="text-sm text-slate-700 mt-1">{formData.additional_info}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-mist">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="w-8 h-8 text-slate-900" />
            <span className="font-heading font-bold text-xl text-slate-900">Suite Summit</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} data-testid="intake-logout-btn">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Progress */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => (
              <div 
                key={s.id} 
                className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < step ? 'bg-slate-900 text-white' : 
                  i === step ? 'bg-slate-900 text-white' : 
                  'bg-slate-200 text-slate-500'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-slate-900' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(step / (STEPS.length - 1)) * 100} className="h-1" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="border-slate-200 shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-slate-900">{STEPS[step].title}</CardTitle>
            <CardDescription className="text-slate-600">{STEPS[step].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="border-slate-200"
                data-testid="intake-back-btn"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {step < STEPS.length - 1 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                  data-testid="intake-next-btn"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                  data-testid="intake-submit-btn"
                >
                  {loading ? 'Submitting...' : 'Get AI Insights'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyIntake;
