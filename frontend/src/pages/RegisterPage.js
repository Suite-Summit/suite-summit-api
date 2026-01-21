import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Mountain, AlertCircle, Building2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'company'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'company' || roleParam === 'executive') {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Account created successfully!');
      
      // Redirect based on role
      if (user.role === 'company') {
        navigate('/company/intake');
      } else if (user.role === 'executive') {
        navigate('/executive/apply');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-mist flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <Mountain className="w-8 h-8 text-slate-900" />
          <span className="font-heading font-bold text-xl text-slate-900">Suite Summit</span>
        </Link>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-slate-200 shadow-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-heading text-2xl text-slate-900">Create your account</CardTitle>
            <CardDescription className="text-slate-600">Join Suite Summit today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-slate-700">I am a...</Label>
                <RadioGroup 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="company" id="company" className="peer sr-only" />
                    <Label
                      htmlFor="company"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50 cursor-pointer transition-all"
                      data-testid="register-role-company"
                    >
                      <Building2 className="w-6 h-6 mb-2 text-slate-700" />
                      <span className="font-medium text-slate-900">Company</span>
                      <span className="text-xs text-slate-500 mt-1">Looking for talent</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="executive" id="executive" className="peer sr-only" />
                    <Label
                      htmlFor="executive"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50 cursor-pointer transition-all"
                      data-testid="register-role-executive"
                    >
                      <Briefcase className="w-6 h-6 mb-2 text-slate-700" />
                      <span className="font-medium text-slate-900">Executive</span>
                      <span className="text-xs text-slate-500 mt-1">Offering expertise</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-slate-200 focus:ring-slate-900"
                  required
                  data-testid="register-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-slate-200 focus:ring-slate-900"
                  required
                  data-testid="register-email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-slate-200 focus:ring-slate-900"
                  required
                  minLength={6}
                  data-testid="register-password-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="text-slate-900 font-medium hover:underline" data-testid="register-login-link">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
