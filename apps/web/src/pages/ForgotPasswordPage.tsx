import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#7654DC] mx-auto flex items-center justify-center text-white shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#242438]">
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-[#62677A]">
          Enter your university email to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E1E4EC] rounded-2xl sm:px-10">
          {submitted ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#16865C] mx-auto" />
              <h3 className="font-bold text-sm text-[#242438]">Check your inbox</h3>
              <p className="text-xs text-[#62677A]">
                If an account exists for {email}, a password reset link has been dispatched.
              </p>
              <div className="pt-4">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7654DC] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to login</span>
                </NavLink>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#242438] mb-1">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="aarav@teamproof.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-bold shadow-sm transition"
              >
                Send Reset Link
              </button>

              <div className="text-center pt-2">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#62677A] hover:text-[#7654DC]"
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
