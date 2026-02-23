import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applyAsExecutive } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Mountain, LogOut, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const ExecutiveApplication = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: 'Fractional CFO',
    years_experience: '',
    industries: [],
    engagement_size: '',
    linkedin_url: '',
    case_example: '',
    measurable_outcomes: ['', '', ''],
    availability: '',
    willing_to_travel: false,
    open_to_remote: true,
    hourly_rate_range: '',
    reference_name: '',
    reference_email: '',
    attestation_confirmed: false
  });
  const [newIndustry, setNewIndustry] = useState('');

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addIndustry = () => {
    if (newIndustry && !formData.industries.includes(newIndustry)) {
      updateField('industries', [...formData.industries, newIndustry]);
      setNewIndustry('');
    }
  };

  const removeIndustry = (industry) => {
    updateField('industries', formData.industries.filter(i => i !== industry));
  };

  const updateOutcome = (index, value) => {
    const newOutcomes = [...formData.measurable_outcomes];
    newOutcomes[index] = value;
    updateField('measurable_outcomes', newOutcomes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.attestation_confirmed) {
      setError('You must confirm the attestation to proceed');
      setLoading(false);
      return;
    }

    if (formData.industries.length === 0) {
      setError('Please add at least one industry');
      setLoading(false);
      return;
    }

    try {
      const applicationData = {
        ...formData,
        years_experience: parseInt(formData.years_experience),
        measurable_outcomes: formData.measurable_outcomes.filter(o => o.trim() !== ''),
        // Only include reference fields if they have values
        reference_name: formData.reference_name?.trim() || null,
        reference_email: formData.reference_email?.trim() || null
      };
      
      await applyAsExecutive(applicationData);
      toast.success('Application submitted! Pending admin approval.');
      navigate('/executive/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.detail;
      if (typeof errorMessage === 'string') {
        setError(errorMessage);
      } else if (Array.isArray(errorMessage)) {
        setError(errorMessage.map(e => e.msg || e).join(', '));
      } else {
        setError('Application failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const industryOptions = [
    'SaaS / Software', 'E-commerce', 'Healthcare', 'Fintech', 'Manufacturing',
    'Professional Services', 'Real Estate', 'Consumer Goods', 'Media & Entertainment',
    'Education', 'Energy', 'Logistics', 'Agriculture', 'Non-Profit'
  ];

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
            <Button variant="ghost" size="sm" onClick={logout} data-testid="exec-logout-btn">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">Executive Application</h1>
          <p className="text-slate-600">Join Suite Summit's network of vetted fractional executives.</p>
        </div>

        <Card className="border-slate-200 shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-slate-900">Your Profile</CardTitle>
            <CardDescription>Applications are reviewed and approved by our team.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700">Role</Label>
                <Select value={formData.title} onValueChange={(v) => updateField('title', v)}>
                  <SelectTrigger className="border-slate-200" data-testid="exec-title">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fractional CFO">Fractional CFO</SelectItem>
                    <SelectItem value="Fractional COO" disabled>Fractional COO (Coming Soon)</SelectItem>
                    <SelectItem value="Fractional CMO" disabled>Fractional CMO (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="years_experience" className="text-slate-700">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min="1"
                  placeholder="15"
                  value={formData.years_experience}
                  onChange={(e) => updateField('years_experience', e.target.value)}
                  className="border-slate-200"
                  required
                  data-testid="exec-years-experience"
                />
              </div>

              {/* Industries */}
              <div className="space-y-2">
                <Label className="text-slate-700">Industries</Label>
                <div className="flex gap-2">
                  <Select value={newIndustry} onValueChange={setNewIndustry}>
                    <SelectTrigger className="border-slate-200 flex-1" data-testid="exec-industry-select">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addIndustry} className="bg-slate-900" data-testid="exec-add-industry">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.industries.map((ind) => (
                    <span key={ind} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {ind}
                      <button type="button" onClick={() => removeIndustry(ind)} className="text-slate-500 hover:text-slate-700">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Engagement Size */}
              <div className="space-y-2">
                <Label htmlFor="engagement_size" className="text-slate-700">Typical Engagement Size</Label>
                <Select value={formData.engagement_size} onValueChange={(v) => updateField('engagement_size', v)}>
                  <SelectTrigger className="border-slate-200" data-testid="exec-engagement-size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10-20 hrs/month">10-20 hrs/month</SelectItem>
                    <SelectItem value="20-40 hrs/month">20-40 hrs/month</SelectItem>
                    <SelectItem value="40-60 hrs/month">40-60 hrs/month</SelectItem>
                    <SelectItem value="60+ hrs/month">60+ hrs/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="text-slate-700">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin_url}
                  onChange={(e) => updateField('linkedin_url', e.target.value)}
                  className="border-slate-200"
                  required
                  data-testid="exec-linkedin"
                />
              </div>

              {/* Case Example */}
              <div className="space-y-2">
                <Label htmlFor="case_example" className="text-slate-700">Brief Case Example</Label>
                <Textarea
                  id="case_example"
                  placeholder="Describe a key engagement where you delivered measurable results..."
                  value={formData.case_example}
                  onChange={(e) => updateField('case_example', e.target.value)}
                  className="border-slate-200 min-h-[120px]"
                  required
                  data-testid="exec-case-example"
                />
              </div>

              {/* Measurable Outcomes */}
              <div className="space-y-2">
                <Label className="text-slate-700">Top 3 Measurable Outcomes</Label>
                <p className="text-xs text-slate-500">Specific metrics from past engagements</p>
                {[0, 1, 2].map((index) => (
                  <Input
                    key={index}
                    placeholder={`e.g., "Reduced burn rate by 30%" or "Closed $5M Series A"`}
                    value={formData.measurable_outcomes[index]}
                    onChange={(e) => updateOutcome(index, e.target.value)}
                    className="border-slate-200"
                    data-testid={`exec-outcome-${index}`}
                  />
                ))}
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label htmlFor="availability" className="text-slate-700">Current Availability</Label>
                <Select value={formData.availability} onValueChange={(v) => updateField('availability', v)}>
                  <SelectTrigger className="border-slate-200" data-testid="exec-availability">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediately Available">Immediately Available</SelectItem>
                    <SelectItem value="Available in 2 weeks">Available in 2 weeks</SelectItem>
                    <SelectItem value="Available in 1 month">Available in 1 month</SelectItem>
                    <SelectItem value="Limited Availability">Limited Availability</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Travel & Remote Work */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-slate-700">Willing to Travel?</Label>
                  <RadioGroup 
                    value={formData.willing_to_travel ? "yes" : "no"} 
                    onValueChange={(v) => updateField('willing_to_travel', v === "yes")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="travel-yes" data-testid="exec-travel-yes" />
                      <Label htmlFor="travel-yes" className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="travel-no" data-testid="exec-travel-no" />
                      <Label htmlFor="travel-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700">Open to Remote?</Label>
                  <RadioGroup 
                    value={formData.open_to_remote ? "yes" : "no"} 
                    onValueChange={(v) => updateField('open_to_remote', v === "yes")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="remote-yes" data-testid="exec-remote-yes" />
                      <Label htmlFor="remote-yes" className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="remote-no" data-testid="exec-remote-no" />
                      <Label htmlFor="remote-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Reference (Optional) */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Reference (Optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference_name" className="text-slate-600 text-sm">Name</Label>
                    <Input
                      id="reference_name"
                      placeholder="John Smith"
                      value={formData.reference_name}
                      onChange={(e) => updateField('reference_name', e.target.value)}
                      className="border-slate-200"
                      data-testid="exec-reference-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference_email" className="text-slate-600 text-sm">Email</Label>
                    <Input
                      id="reference_email"
                      placeholder="john@company.com"
                      value={formData.reference_email}
                      onChange={(e) => updateField('reference_email', e.target.value)}
                      className="border-slate-200"
                      data-testid="exec-reference-email"
                    />
                  </div>
                </div>
              </div>

              {/* Attestation */}
              <div className="flex items-start gap-3 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <Checkbox
                  id="attestation"
                  checked={formData.attestation_confirmed}
                  onCheckedChange={(checked) => updateField('attestation_confirmed', checked)}
                  data-testid="exec-attestation"
                />
                <Label htmlFor="attestation" className="text-sm text-sky-900 cursor-pointer">
                  I confirm that I am available for fractional work and am not representing myself as a full-time placement candidate.
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
                disabled={loading}
                data-testid="exec-submit-btn"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveApplication;
