import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#7654DC] mx-auto flex items-center justify-center text-white shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#242438]">
          Register for TeamProof
        </h2>
        <p className="mt-1 text-xs text-[#62677A]">
          Join your university project team and record evidence
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
              <label className="block text-xs font-semibold text-[#242438] mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Tanveer Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#242438] mb-1">University Email</label>
              <input
                type="email"
                required
                placeholder="tanveer@chitkara.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#242438] mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#242438] mb-1">Academic Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC] bg-white text-[#242438]"
              >
                <option value="student">Student / Team Contributor</option>
                <option value="project_owner">Student Project Owner</option>
                <option value="faculty">Faculty Member / Reviewer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'Register'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#62677A]">
            Already have an account?{' '}
            <NavLink to="/login" className="font-semibold text-[#7654DC] hover:underline">
              Sign in
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
