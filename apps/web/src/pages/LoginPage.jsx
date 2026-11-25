import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setDemoCredentials = (userEmail) => {
    setEmail(userEmail);
    setPassword('DemoPass123!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] dark:bg-[#111416] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors relative font-sans">
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block group">
          <div className="w-12 h-12 rounded-2xl bg-[#15966A] dark:bg-[#15966A] mx-auto flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#172B21] dark:text-[#F1F5F3]">
          Sign in to TeamProof
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#52665A] dark:text-[#858F8C]">
          Academic Project Contribution Assessment Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1B2022] py-8 px-6 sm:px-8 shadow-lg border border-[#DFE9E1] dark:border-[#30383A] rounded-2xl transition-colors">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#DC5555] dark:text-[#F07878] text-xs font-medium flex items-center gap-2.5 border border-red-200 dark:border-red-900/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#172B21] dark:text-[#F1F5F3] uppercase tracking-wider mb-1.5">
                University Email Address
              </label>
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] placeholder-[#84948A] dark:placeholder-[#858F8C] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-2 focus:ring-[#15966A]/20 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#172B21] dark:text-[#F1F5F3] uppercase tracking-wider">
                  Password
                </label>
                <NavLink to="/forgot-password" className="text-xs font-semibold text-[#15966A] dark:text-[#35B982] hover:underline">
                  Forgot password?
                </NavLink>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] placeholder-[#84948A] dark:placeholder-[#858F8C] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-2 focus:ring-[#15966A]/20 transition"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#15966A] dark:hover:bg-[#4AC993] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demonstration Switcher */}
          <div className="mt-6 pt-5 border-t border-[#DFE9E1] dark:border-[#30383A]">
            <span className="text-[10px] font-bold text-[#84948A] dark:text-[#858F8C] uppercase tracking-wider block mb-2.5 text-center">
              Quick Test Accounts (Password: DemoPass123!)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('aarav@teamproof.edu')}
                className="p-2 border border-[#DFE9E1] dark:border-[#30383A] rounded-xl hover:border-[#15966A] dark:hover:border-[#35B982] text-left transition bg-[#F7FAF8] dark:bg-[#22292B] dark:hover:bg-[#2A3234] cursor-pointer"
              >
                <div className="font-bold text-[#172B21] dark:text-[#F1F5F3] truncate">Aarav Mehta</div>
                <div className="text-[10px] text-[#52665A] dark:text-[#858F8C] truncate">Student Lead • Atlas</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('nisha@teamproof.edu')}
                className="p-2 border border-[#DFE9E1] dark:border-[#30383A] rounded-xl hover:border-[#15966A] dark:hover:border-[#35B982] text-left transition bg-[#F7FAF8] dark:bg-[#22292B] dark:hover:bg-[#2A3234] cursor-pointer"
              >
                <div className="font-bold text-[#172B21] dark:text-[#F1F5F3] truncate">Nisha Rao</div>
                <div className="text-[10px] text-[#52665A] dark:text-[#858F8C] truncate">Student Contributor</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('rohan@teamproof.edu')}
                className="p-2 border border-[#DFE9E1] dark:border-[#30383A] rounded-xl hover:border-[#15966A] dark:hover:border-[#35B982] text-left transition bg-[#F7FAF8] dark:bg-[#22292B] dark:hover:bg-[#2A3234] cursor-pointer"
              >
                <div className="font-bold text-[#172B21] dark:text-[#F1F5F3] truncate">Rohan Verma</div>
                <div className="text-[10px] text-[#52665A] dark:text-[#858F8C] truncate">Student Contributor</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('faculty@teamproof.edu')}
                className="p-2 border border-[#DFE9E1] dark:border-[#30383A] rounded-xl hover:border-[#15966A] dark:hover:border-[#35B982] text-left transition bg-[#F7FAF8] dark:bg-[#22292B] dark:hover:bg-[#2A3234] cursor-pointer"
              >
                <div className="font-bold text-[#172B21] dark:text-[#F1F5F3] truncate">Dr. Neelam Kumari</div>
                <div className="text-[10px] text-[#15966A] dark:text-[#35B982] font-semibold truncate">Faculty Reviewer</div>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-[#52665A] dark:text-[#858F8C]">
            Don't have an account yet?{' '}
            <NavLink to="/register" className="font-bold text-[#15966A] dark:text-[#35B982] hover:underline ml-1">
              Create student account
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
