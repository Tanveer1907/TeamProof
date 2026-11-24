import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  FileCheck2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Layers,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col text-[#242438]">
      {/* Navigation */}
      <nav className="h-20 bg-white border-b border-[#E1E4EC] px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7654DC] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl text-[#242438] tracking-tight">TeamProof</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-[#62677A] tracking-wider uppercase">
              • Academic Assessment
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-[#62677A] hover:text-[#7654DC] transition"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/register"
            className="px-4 py-2 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-semibold shadow-sm transition"
          >
            Get Started
          </NavLink>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0EAFF] border border-[#7654DC]/20 text-[#7654DC] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Evidence-Based Academic Project Collaboration</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#242438] leading-tight">
          Every contribution <br />
          <span className="text-[#7654DC]">deserves recognition.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#62677A] max-w-2xl mx-auto leading-relaxed">
          A unified academic workspace connecting task planning, non-code design, documentation, GitHub activity, and transparent faculty evaluation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <NavLink
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#7654DC] hover:bg-[#6543C5] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Demo Application</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
          <NavLink
            to="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#E1E4EC] hover:bg-gray-50 text-[#242438] text-sm font-semibold shadow-sm transition"
          >
            Create Free Account
          </NavLink>
        </div>
      </header>

      {/* 5-Step Workflow Section (from CE-1 Slide 5) */}
      <section className="py-16 bg-white border-y border-[#E1E4EC] px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-[#242438]">The TeamProof Workflow</h2>
            <p className="text-xs text-[#62677A] mt-1">
              One shared workspace for tasks, contribution evidence, and project reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '1. Plan', title: 'Plan & Assign', desc: 'Create projects, organize milestones, and assign tasks with explicit acceptance criteria.' },
              { step: '2. Contribute', title: 'Submit Evidence', desc: 'Connect files, research, or GitHub activity to tasks as tangible proof of contribution.' },
              { step: '3. Review', title: 'Teammate Review', desc: 'Peer verification prevents free-riding while ensuring individual effort is validated.' },
              { step: '4. Summarize', title: 'AI-Assisted Draft', desc: 'Synthesizes verified evidence into structured summaries for evaluation review.' },
              { step: '5. Assess', title: 'Faculty Assessment', desc: 'Faculty maintain final grading authority empowered by transparent audit trails.' },
            ].map((st, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#F7F8FC] border border-[#E1E4EC] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#7654DC] uppercase tracking-wider">{st.step}</span>
                  <h3 className="font-bold text-sm text-[#242438] mt-2 mb-1">{st.title}</h3>
                  <p className="text-xs text-[#62677A] leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Highlights */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E1E4EC] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0EAFF] text-[#7654DC] flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#242438]">Evidence, Not Assumptions</h3>
            <p className="text-xs text-[#62677A] leading-relaxed">
              Eliminate ambiguous group project marks. Document UI wireframes, documentation, testing, and deployment alongside code.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E1E4EC] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0EAFF] text-[#7654DC] flex items-center justify-center font-bold">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#242438]">Contextual GitHub Work</h3>
            <p className="text-xs text-[#62677A] leading-relaxed">
              Commit counts alone do not measure contribution quality. Connect PRs and commits directly to tasks and written rationales.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E1E4EC] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0EAFF] text-[#7654DC] flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#242438]">Human-Led Faculty Judgment</h3>
            <p className="text-xs text-[#62677A] leading-relaxed">
              Automated summaries assist without replacing human discretion. Faculty make all final evaluation and grading decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-[#E1E4EC] text-center text-xs text-[#62677A]">
        <p className="font-semibold text-[#242438]">TeamProof — Every contribution deserves recognition.</p>
        <p className="text-[11px] mt-1 text-[#8E94A5]">
          Back End Engineering-II Project (24CSE0315) • Chitkara University, Punjab, India
        </p>
      </footer>
    </div>
  );
};
