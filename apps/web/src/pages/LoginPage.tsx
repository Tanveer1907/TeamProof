import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] dark:bg-[#101A15] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 transition-colors relative font-sans">
      {/* Top Bar with Home link and Theme switch */}
      <div className="fixed top-6 left-6 right-6 flex items-center justify-between max-w-6xl mx-auto z-20">
        <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-[#52665A] dark:text-[#849A8B] hover:text-[#15966A] dark:hover:text-[#35B982] transition bg-white/80 dark:bg-[#17251D]/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#DFE9E1] dark:border-[#2D4234] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
          <span>Back to Home</span>
        </Link>
        <div className="bg-white/80 dark:bg-[#17251D]/80 backdrop-blur-sm p-1 rounded-full border border-[#DFE9E1] dark:border-[#2D4234] shadow-xs">
          <ThemeToggle />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-block group">
          <div className="w-14 h-14 rounded-2xl bg-[#15966A] dark:bg-[#35B982] mx-auto flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </Link>
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#172B21] dark:text-[#E8F3EB]">
          Sign in to TeamProof
        </h2>
        <p className="mt-2 text-sm text-[#52665A] dark:text-[#849A8B]">
          Academic Project Contribution Assessment Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-[#17251D] py-10 px-8 sm:px-12 shadow-lg border border-[#DFE9E1] dark:border-[#2D4234] rounded-3xl transition-colors">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#DC5555] dark:text-[#F07878] text-xs font-medium flex items-center gap-2.5 border border-red-200 dark:border-red-900/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider mb-1.5">
                University Email Address
              </label>
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-2 focus:ring-[#15966A]/20 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider">
                  Password
                </label>
                <NavLink to="/forgot-password" className="text-xs font-semibold text-[#15966A] dark:text-[#35B982] hover:underline">
                  Forgot password?
                </NavLink>
              </div>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-2 focus:ring-[#15966A]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#DFE9E1] dark:border-[#2D4234] text-center text-sm text-[#52665A] dark:text-[#849A8B]">
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
