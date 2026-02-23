import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Mountain, Users, Brain, CheckCircle, Shield, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-mist">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Mountain className="w-8 h-8 text-slate-900" />
              <span className="font-heading font-bold text-xl text-slate-900">Suite Summit</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900" data-testid="nav-login-btn">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-slate-900 text-white hover:bg-slate-800" data-testid="nav-register-btn">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 lg:px-12 overflow-hidden">
        {/* Abstract Mountain Background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-96 text-slate-100" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,224L60,234.7C120,245,240,267,360,261.3C480,256,600,224,720,213.3C840,203,960,213,1080,229.3C1200,245,1320,267,1380,277.3L1440,288L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
          <div className="absolute top-20 right-10 w-64 h-64 bg-sky-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-40 left-10 w-48 h-48 bg-sky-50 rounded-full blur-2xl opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 text-left">
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-tight animate-fade-in">
                Fractional C-suite leadership,{' '}
                <span className="text-ice-blue">elevated.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-xl animate-fade-in animate-delay-100">
                AI-guided matching for CFOs and senior executives. Built for growing companies who need strategic leadership without full-time commitment.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in animate-delay-200">
                <Link to="/register?role=company">
                  <Button 
                    size="lg" 
                    className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
                    data-testid="hero-find-executive-btn"
                  >
                    Find a Fractional Executive
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/register?role=executive">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-slate-200 text-slate-900 hover:bg-slate-50 px-8 py-6 text-base font-medium rounded-lg w-full sm:w-auto"
                    data-testid="hero-apply-executive-btn"
                  >
                    Apply as an Executive
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 animate-fade-in animate-delay-300">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-sky-100 to-slate-100 rounded-2xl blur-xl opacity-50"></div>
                <img 
                  src="https://images.unsplash.com/photo-1654783912259-659d94fff000?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMHdoaXRlJTIwYmx1ZSUyMG1vdW50YWluJTIwM2QlMjByZW5kZXJ8ZW58MHx8fHwxNzY4OTU0ODU0fDA&ixlib=rb-4.1.0&q=85"
                  alt="Abstract Summit"
                  className="relative w-full rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summit Line Accent */}
      <div className="summit-line max-w-xl mx-auto"></div>

      {/* Value Props */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
              Why Suite Summit?
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl">
              We connect growing companies with vetted fractional executives through intelligent matching—not job boards or staffing chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Matching',
                description: 'Our intelligent system analyzes your needs and matches you with executives who have the right experience for your specific challenges.'
              },
              {
                icon: Shield,
                title: 'Vetted Executives',
                description: 'Every executive is manually reviewed and approved. We verify experience, check references, and ensure quality.'
              },
              {
                icon: TrendingUp,
                title: 'Outcome-Focused',
                description: 'We measure success in results, not hours. Our executives are measured by the metrics that matter to your business.'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-50 border border-slate-100 rounded-xl p-8 hover:border-slate-200 hover:shadow-hover transition-all duration-300 card-lift"
              >
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 lg:px-12 bg-slate-mist">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
                Your path to the summit
              </h2>
              <p className="mt-4 text-slate-600">
                A streamlined process designed to find you the right leadership match, fast.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Complete Your Profile', description: 'Tell us about your company stage, challenges, and what you\'re looking for.' },
                  { step: '02', title: 'Get AI Insights', description: 'Receive personalized recommendations on role, scope, and expected outcomes.' },
                  { step: '03', title: 'Review Matches', description: 'Browse vetted executives matched to your specific needs.' },
                  { step: '04', title: 'Request Introductions', description: 'Connect with executives who are right for your team.' }
                ].map((item, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                      <span className="font-mono text-sm text-white font-medium">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg text-slate-900">{item.title}</h3>
                      <p className="text-slate-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-12">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
              Available Roles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 text-white rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-ice-blue" />
                <span className="text-sm font-medium text-ice-blue uppercase tracking-wide">Available Now</span>
              </div>
              <h3 className="font-heading font-bold text-2xl">Fractional CFO</h3>
              <p className="mt-3 text-slate-300">Strategic financial leadership for growing companies. Cash flow, fundraising, financial modeling, and more.</p>
            </div>
            
            {['Fractional COO', 'Fractional CMO', 'Fractional CTO', 'Fractional CHRO'].map((role, index) => (
              <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-8 opacity-60">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Coming Soon</span>
                </div>
                <h3 className="font-heading font-semibold text-xl text-slate-700">{role}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute bottom-0 w-full h-48 text-slate-800" viewBox="0 0 1440 160" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,64L80,74.7C160,85,320,107,480,112C640,117,800,107,960,90.7C1120,75,1280,53,1360,42.7L1440,32L1440,160L1360,160C1280,160,1120,160,960,160C800,160,640,160,480,160C320,160,160,160,80,160L0,160Z"></path>
          </svg>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-6">
            Ready to reach the summit?
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
            Join hundreds of companies who have found their ideal fractional executive through Suite Summit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=company">
              <Button 
                size="lg" 
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-base font-medium rounded-lg"
                data-testid="cta-find-executive-btn"
              >
                Find Your Executive
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Mountain className="w-6 h-6 text-white" />
              <span className="font-heading font-bold text-lg text-white">Suite Summit</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400 text-sm">
              <span>© 2024 Suite Summit. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
