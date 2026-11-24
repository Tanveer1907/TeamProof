import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('aarav@teamproof.edu');
  const [password, setPassword] = useState('DemoPass123!');
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

  const setDemoCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('DemoPass123!');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#7654DC] mx-auto flex items-center justify-center text-white shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#242438]">
          Sign in to TeamProof
        </h2>
        <p className="mt-1 text-xs text-[#62677A]">
          Academic Project Contribution Assessment Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E1E4EC] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-[#D94B4B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#242438] mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#242438]">Password</label>
                <NavLink to="/forgot-password" className="text-[11px] text-[#7654DC] hover:underline">
                  Forgot password?
                </NavLink>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Switcher Buttons */}
          <div className="mt-6 pt-5 border-t border-[#E1E4EC]">
            <span className="text-[11px] font-semibold text-[#8E94A5] uppercase tracking-wider block mb-2 text-center">
              Quick Demonstration Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setDemoCredentials('aarav@teamproof.edu')}
                className="p-2 border border-[#E1E4EC] rounded-lg hover:border-[#7654DC] text-left transition"
              >
                <div className="font-bold text-[#242438]">Aarav Mehta</div>
                <div className="text-gray-500">Student • Team Atlas</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('nisha@teamproof.edu')}
                className="p-2 border border-[#E1E4EC] rounded-lg hover:border-[#7654DC] text-left transition"
              >
                <div className="font-bold text-[#242438]">Nisha Rao</div>
                <div className="text-gray-500">Student • Team Atlas</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('rohan@teamproof.edu')}
                className="p-2 border border-[#E1E4EC] rounded-lg hover:border-[#7654DC] text-left transition"
              >
                <div className="font-bold text-[#242438]">Rohan Shah</div>
                <div className="text-gray-500">Student • Team Atlas</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('faculty@teamproof.edu')}
                className="p-2 border border-[#E1E4EC] rounded-lg hover:border-[#7654DC] text-left transition"
              >
                <div className="font-bold text-[#242438]">Dr. Neelam</div>
                <div className="text-[#7654DC] font-semibold">Faculty Reviewer</div>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-[#62677A]">
            Don't have an account?{' '}
            <NavLink to="/register" className="font-semibold text-[#7654DC] hover:underline">
              Create account
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
