import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#172B21] dark:text-[#F1F5F3]">
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-[#52665A] dark:text-[#858F8C]">
          Enter your university email to receive recovery instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1B2022] py-8 px-6 sm:px-8 shadow-lg border border-[#DFE9E1] dark:border-[#30383A] rounded-2xl transition-colors">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-[#15966A] dark:text-[#35B982] mx-auto" />
              <h3 className="font-bold text-base text-[#172B21] dark:text-[#F1F5F3]">Check your inbox</h3>
              <p className="text-xs text-[#52665A] dark:text-[#858F8C]">
                If an account exists for <strong className="text-[#172B21] dark:text-[#F1F5F3]">{email}</strong>, a password reset link has been dispatched.
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
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#15966A] dark:hover:bg-[#4AC993] text-white text-sm font-bold shadow-md transition"
              >
                Send Reset Link
              </button>

              <div className="text-center pt-4 border-t border-[#DFE9E1] dark:border-[#30383A]">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52665A] dark:text-[#858F8C] hover:text-[#15966A] dark:hover:text-[#35B982]"
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
