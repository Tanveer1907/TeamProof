import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] dark:bg-[#111416] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 transition-colors relative font-sans">
      {/* Top Bar with Home link and Theme switch */}
      <div className="fixed top-6 left-6 right-6 flex items-center justify-between max-w-6xl mx-auto z-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-[#52665A] dark:text-[#A5AFAB] hover:text-[#15966A] dark:hover:text-[#35B982] transition bg-white/80 dark:bg-[#171C1E]/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#DFE9E1] dark:border-[#30383A] shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
          <span>Back to Home</span>
        </Link>
        <div className="bg-white/80 dark:bg-[#171C1E]/80 backdrop-blur-sm p-1 rounded-full border border-[#DFE9E1] dark:border-[#30383A] shadow-xs">
          <ThemeToggle />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mt-2">
        <Link to="/" className="inline-block group">
          <div className="w-11 h-11 rounded-2xl bg-[#15966A] dark:bg-[#15966A] mx-auto flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#172B21] dark:text-[#F1F5F3]">
          Register for TeamProof
        </h2>
        <p className="mt-1 text-xs text-[#52665A] dark:text-[#858F8C]">
          Join your academic team workspace and record verified evidence
        </p>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1B2022] py-6 px-6 sm:px-8 shadow-lg border border-[#DFE9E1] dark:border-[#30383A] rounded-2xl transition-colors">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#DC5555] dark:text-[#F07878] text-xs font-medium flex items-center gap-2 border border-red-200 dark:border-red-900/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#172B21] dark:text-[#F1F5F3] uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] placeholder-[#84948A] dark:placeholder-[#858F8C] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-2 focus:ring-[#15966A]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B21] dark:text-[#F1F5F3] uppercase tracking-wider mb-1">
                University Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] placeholder-[#84948A] dark:placeholder-[#858F8C] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-2 focus:ring-[#15966A]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B21] dark:text-[#F1F5F3] uppercase tracking-wider mb-1">
                Password * (Min. 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2 text-sm rounded-xl border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] placeholder-[#84948A] dark:placeholder-[#858F8C] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-2 focus:ring-[#15966A]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#84948A] dark:text-[#858F8C] hover:text-[#172B21] dark:hover:text-[#F1F5F3] transition p-0.5 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#F2F8F4] dark:bg-[#22292B] rounded-xl border border-[#DFE9E1] dark:border-[#30383A] text-xs text-[#52665A] dark:text-[#858F8C]">
              New registrations join as <strong>Student Contributors</strong>. Faculty reviewers are provisioned through institution onboarding.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-6 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#15966A] dark:hover:bg-[#4AC993] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#DFE9E1] dark:border-[#30383A] text-center text-xs text-[#52665A] dark:text-[#858F8C]">
            Already have an account?{' '}
            <NavLink to="/login" className="font-bold text-[#15966A] dark:text-[#35B982] hover:underline ml-1">
              Sign in
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
