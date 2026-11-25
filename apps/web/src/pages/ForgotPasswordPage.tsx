import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-[#52665A] dark:text-[#849A8B]">
          Enter your university email to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-[#17251D] py-10 px-8 sm:px-12 shadow-lg border border-[#DFE9E1] dark:border-[#2D4234] rounded-3xl transition-colors">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-[#15966A] dark:text-[#35B982] mx-auto" />
              <h3 className="font-bold text-base text-[#172B21] dark:text-[#E8F3EB]">Check your inbox</h3>
              <p className="text-sm text-[#52665A] dark:text-[#849A8B]">
                If an account exists for <strong className="text-[#172B21] dark:text-[#E8F3EB]">{email}</strong>, a password reset link has been dispatched.
              </p>
              <div className="pt-4">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#15966A] dark:text-[#35B982] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to login</span>
                </NavLink>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-sm font-bold shadow-md transition"
              >
                Send Reset Link
              </button>

              <div className="text-center pt-4 border-t border-[#DFE9E1] dark:border-[#2D4234]">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52665A] dark:text-[#849A8B] hover:text-[#15966A] dark:hover:text-[#35B982]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </NavLink>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
