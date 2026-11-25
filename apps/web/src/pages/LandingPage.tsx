import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  Zap,
  Check,
  Target,
  BarChart3,
  Clock,
  AlertTriangle,
  UploadCloud,
  ListTodo,
  HelpCircle,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const LandingPage: React.FC = () => {
  const { isDark } = useTheme();
  const [activeNav, setActiveNav] = useState('Home');
  const [faqModalOpen, setFaqModalOpen] = useState(false);

  const scrollToSection = (id: string, name: string) => {
    setActiveNav(name);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] transition-colors duration-200 font-sans pt-20">
      {/* 1. NAVBAR - Fixed permanently at top */}
      <nav className="h-20 bg-white/95 dark:bg-[#17251D]/95 backdrop-blur-md border-b border-[#DFE9E1] dark:border-[#2D4234] px-6 lg:px-12 flex items-center justify-between fixed top-0 left-0 right-0 z-50 transition-colors shadow-xs">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#15966A] dark:bg-[#35B982] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-[#172B21] dark:text-[#E8F3EB] tracking-tight block leading-tight">
              TeamProof
            </span>
            <span className="text-[10px] font-bold text-[#52665A] dark:text-[#849A8B] tracking-widest uppercase block">
              ACADEMIC ASSESSMENT
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#EAF6EE] dark:bg-[#1E3025] p-1.5 rounded-full border border-[#DFE9E1] dark:border-[#2D4234]">
          {[
            { name: 'Home', id: 'home' },
            { name: 'Features', id: 'features' },
            { name: 'Workflow', id: 'workflow' },
            { name: 'Why TeamProof', id: 'why-teamproof' },
            { name: 'FAQ', id: 'faq' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => {
                if (item.id === 'faq') {
                  setFaqModalOpen(true);
                } else {
                  scrollToSection(item.id, item.name);
                }
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeNav === item.name
                  ? 'bg-[#15966A] dark:bg-[#35B982] text-white shadow-sm'
                  : 'text-[#52665A] dark:text-[#B0C4B5] hover:text-[#15966A] dark:hover:text-[#35B982]'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Right Actions: Theme Toggle + Sign In + Get Started */}
        <div className="flex items-center gap-3 sm:gap-5">
          <ThemeToggle />

          <div className="w-px h-5 bg-[#DFE9E1] dark:bg-[#2D4234] hidden sm:block"></div>

          <NavLink
            to="/login"
            className="text-xs font-semibold text-[#52665A] dark:text-[#B0C4B5] hover:text-[#15966A] dark:hover:text-[#35B982] transition px-2 py-1.5"
          >
            Sign In
          </NavLink>

          <NavLink
            to="/register"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-xs font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section
        id="home"
        className="relative pt-12 pb-20 px-6 lg:px-12 overflow-hidden bg-gradient-to-b from-[#D8F0E3]/60 via-[#F7FAF8] to-white dark:from-[#153B2D]/40 dark:via-[#101A15] dark:to-[#101A15]"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF6EE] dark:bg-[#1B3829] border border-[#15966A]/25 dark:border-[#35B982]/30 text-[#15966A] dark:text-[#35B982] text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidence-Based Project Collaboration</span>
            </div>

            {/* Headline with Playful Underline Accent */}
            <div className="relative">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#172B21] dark:text-[#E8F3EB] leading-[1.12]">
                Every contribution{' '}
                <span className="relative inline-block text-[#15966A] dark:text-[#35B982]">
                  deserves recognition.
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3.5 text-[#15966A] dark:text-[#35B982] opacity-90"
                    viewBox="0 0 300 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2.5 14.5C50.5 4.5 120.5 18 165.5 10C210.5 2 260.5 15.5 297.5 7"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#52665A] dark:text-[#84948A] leading-relaxed max-w-xl">
              A unified academic workspace connecting task planning, contribution evidence, GitHub activity, and transparent faculty evaluation.
            </p>

            {/* Single Get Started Button */}
            <div className="pt-2">
              <NavLink
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-sm font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4" />
              </NavLink>
            </div>

            {/* 3 Checklist Badges */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-7 pt-4 text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#15966A] dark:text-[#35B982] stroke-[3]" />
                <span>Track Contributions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#15966A] dark:text-[#35B982] stroke-[3]" />
                <span>Collaborate Transparently</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#15966A] dark:text-[#35B982] stroke-[3]" />
                <span>Faculty Ready</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Component-Based Interactive Dashboard Preview Card */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#15966A]/20 to-[#35B982]/10 rounded-3xl blur-2xl -z-10"></div>

            <div className="bg-white dark:bg-[#17251D] rounded-2xl border border-[#DFE9E1] dark:border-[#2D4234] shadow-2xl p-4 sm:p-5 transition-colors overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Mini Preview Sidebar */}
                <div className="hidden sm:flex flex-col justify-between w-48 bg-[#F2F8F4] dark:bg-[#101A15] p-3 rounded-xl border border-[#DFE9E1] dark:border-[#2D4234]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#DFE9E1] dark:border-[#2D4234]">
                      <div className="w-6 h-6 rounded-md bg-[#15966A] dark:bg-[#35B982] flex items-center justify-center text-white">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-[#172B21] dark:text-[#E8F3EB]">TeamProof</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#EAF6EE] dark:bg-[#1B3829] border border-[#15966A]/20 dark:border-[#35B982]/30">
                      <div className="text-[10px] font-bold text-[#15966A] dark:text-[#35B982]">CampusConnect</div>
                      <div className="text-[9px] text-[#52665A] dark:text-[#849A8B]">Team Atlas • 3 members</div>
                    </div>

                    <div className="space-y-1 text-[11px] font-medium text-[#52665A] dark:text-[#849A8B]">
                      <div className="px-2 py-1.5 rounded-md bg-[#15966A] dark:bg-[#35B982] text-white font-semibold flex items-center gap-2">
                        <ListTodo className="w-3 h-3" />
                        <span>Overview</span>
                      </div>
                      <div className="px-2 py-1 rounded-md hover:bg-[#EAF2EC] dark:hover:bg-[#1E3025] flex items-center gap-2">
                        <Layers className="w-3 h-3" />
                        <span>Task Board</span>
                      </div>
                      <div className="px-2 py-1 rounded-md hover:bg-[#EAF2EC] dark:hover:bg-[#1E3025] flex items-center gap-2">
                        <FileCheck2 className="w-3 h-3" />
                        <span>Evidence</span>
                      </div>
                      <div className="px-2 py-1 rounded-md hover:bg-[#EAF2EC] dark:hover:bg-[#1E3025] flex items-center gap-2">
                        <GitBranch className="w-3 h-3" />
                        <span>GitHub</span>
                      </div>
                      <div className="px-2 py-1 rounded-md hover:bg-[#EAF2EC] dark:hover:bg-[#1E3025] flex items-center gap-2">
                        <GraduationCap className="w-3 h-3" />
                        <span>Faculty Review</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#DFE9E1] dark:border-[#2D4234] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#15966A] dark:bg-[#35B982] text-white text-[9px] font-bold flex items-center justify-center">
                      AM
                    </div>
                    <div className="text-[10px] leading-tight truncate">
                      <div className="font-semibold text-[#172B21] dark:text-[#E8F3EB]">Aarav Mehta</div>
                      <div className="text-[#52665A] dark:text-[#849A8B] text-[9px]">Student • Team Atlas</div>
                    </div>
                  </div>
                </div>

                {/* Mini Preview Main Workspace */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DFE9E1] dark:border-[#2D4234]">
                    <div>
                      <h4 className="text-xs font-bold text-[#172B21] dark:text-[#E8F3EB] flex items-center gap-1.5">
                        <span>Good morning, Aarav</span>
                        <span>👋</span>
                      </h4>
                      <p className="text-[10px] text-[#52665A] dark:text-[#849A8B]">
                        Here's what's happening in CampusConnect.
                      </p>
                    </div>
                    <div className="px-2.5 py-1 rounded-md bg-[#15966A] dark:bg-[#35B982] text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                      <span>+ Add Contribution</span>
                    </div>
                  </div>

                  {/* 4 Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                    <div className="p-2.5 rounded-lg bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#52665A] dark:text-[#849A8B]">Total Tasks</span>
                        <ListTodo className="w-3 h-3 text-[#15966A] dark:text-[#35B982]" />
                      </div>
                      <div className="text-sm font-bold text-[#172B21] dark:text-[#E8F3EB] mt-1">4</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#52665A] dark:text-[#849A8B]">Verified</span>
                        <CheckCircle2 className="w-3 h-3 text-[#15966A] dark:text-[#35B982]" />
                      </div>
                      <div className="text-sm font-bold text-[#172B21] dark:text-[#E8F3EB] mt-1">3</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#52665A] dark:text-[#849A8B]">In Progress</span>
                        <Clock className="w-3 h-3 text-[#3985CF] dark:text-[#71B2EC]" />
                      </div>
                      <div className="text-sm font-bold text-[#172B21] dark:text-[#E8F3EB] mt-1">1</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#52665A] dark:text-[#849A8B]">Pending</span>
                        <Clock className="w-3 h-3 text-[#D69E36] dark:text-[#E7B95D]" />
                      </div>
                      <div className="text-sm font-bold text-[#172B21] dark:text-[#E8F3EB] mt-1">2</div>
                    </div>
                  </div>

                  {/* 2 Bottom Widgets: Progress Gauge & Upcoming Deadlines */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Donut Progress Card */}
                    <div className="p-3 rounded-lg bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                      <span className="text-[10px] font-bold text-[#172B21] dark:text-[#E8F3EB] block mb-2">
                        Contribution Progress
                      </span>
                      <div className="flex items-center justify-around gap-2">
                        <div className="relative w-14 h-14 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-[#DFE9E1] dark:text-[#2D4234]"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-[#15966A] dark:text-[#35B982]"
                              strokeDasharray="75, 100"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute font-bold text-xs text-[#172B21] dark:text-[#E8F3EB]">
                            75%
                          </span>
                        </div>
                        <div className="text-[10px] space-y-1 text-[#52665A] dark:text-[#849A8B]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#15966A] dark:bg-[#35B982]"></span>
                            <span>3 of 4 tasks</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#D69E36] dark:text-[#E7B95D]"></span>
                            <span>Verified work</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Deadlines Card */}
                    <div className="p-3 rounded-lg bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[#172B21] dark:text-[#E8F3EB]">
                          Upcoming Deadlines
                        </span>
                        <span className="text-[9px] font-semibold text-[#15966A] dark:text-[#35B982]">
                          View All
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex items-center gap-2 p-1 rounded bg-white dark:bg-[#17251D] border border-[#DFE9E1] dark:border-[#2D4234]">
                          <AlertTriangle className="w-3 h-3 text-[#DC5555] dark:text-[#F07878] shrink-0" />
                          <div className="min-w-0 flex-1 truncate">
                            <div className="font-semibold text-[#172B21] dark:text-[#E8F3EB] truncate">
                              Integration Test Task
                            </div>
                            <div className="text-[9px] text-[#84948A] dark:text-[#849A8B]">Due in 2 days</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-1 rounded bg-white dark:bg-[#17251D] border border-[#DFE9E1] dark:border-[#2D4234]">
                          <Clock className="w-3 h-3 text-[#D69E36] dark:text-[#E7B95D] shrink-0" />
                          <div className="min-w-0 flex-1 truncate">
                            <div className="font-semibold text-[#172B21] dark:text-[#E8F3EB] truncate">
                              Event listing layout
                            </div>
                            <div className="text-[9px] text-[#84948A] dark:text-[#849A8B]">Due in 5 days</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HIGHLIGHTS / 4-FEATURE PILLARS BAR */}
      <section id="features" className="py-12 bg-white dark:bg-[#17251D] border-y border-[#DFE9E1] dark:border-[#2D4234] px-6 lg:px-12 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234] flex items-start gap-4 transition hover:border-[#15966A] dark:hover:border-[#35B982]">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] flex items-center justify-center shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB]">Not Just Code</h3>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1">
                Track design, research, docs & more with multi-disciplinary evidence.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234] flex items-start gap-4 transition hover:border-[#15966A] dark:hover:border-[#35B982]">
            <div className="w-10 h-10 rounded-xl bg-[#D8F0E3] dark:bg-[#214B36] text-[#15966A] dark:text-[#35B982] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB]">Team Verified</h3>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1">
                Peer-reviewed contributions eliminate free-riding and ambiguity.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234] flex items-start gap-4 transition hover:border-[#15966A] dark:hover:border-[#35B982]">
            <div className="w-10 h-10 rounded-xl bg-[#EEF6FD] dark:bg-[#152C3F] text-[#3985CF] dark:text-[#71B2EC] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB]">Faculty Ready</h3>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1">
                Structured, evidence-backed review gives professors true context.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234] flex items-start gap-4 transition hover:border-[#15966A] dark:hover:border-[#35B982]">
            <div className="w-10 h-10 rounded-xl bg-[#FEF7EC] dark:bg-[#332714] text-[#D69E36] dark:text-[#E7B95D] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB]">Simple & Powerful</h3>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1">
                All in one academic workspace built specifically for universities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW SECTION (5-STEP PROCESS) */}
      <section id="workflow" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto text-center space-y-12">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172B21] dark:text-[#E8F3EB] tracking-tight">
            The{' '}
            <span className="relative inline-block text-[#15966A] dark:text-[#35B982]">
              TeamProof Workflow
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#15966A] dark:text-[#35B982] opacity-90"
                viewBox="0 0 200 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path d="M2 10C40 3 100 13 140 7C170 3 195 8 198 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#52665A] dark:text-[#849A8B] mt-3 max-w-xl mx-auto">
            A structured and transparent process from planning to assessment.
          </p>
        </div>

        {/* 5-Step Cards Connected in Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-3 items-stretch">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col justify-between text-left hover:border-[#15966A] dark:hover:border-[#35B982] transition group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ListTodo className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB] mb-1.5">
                1. Plan & Assign
              </h3>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] leading-relaxed">
                Create projects, organize milestones, and assign tasks with clear criteria.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-end text-[#15966A] dark:text-[#35B982]">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col justify-between text-left hover:border-[#15966A] dark:hover:border-[#35B982] transition group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EEF6FD] dark:bg-[#152C3F] text-[#3985CF] dark:text-[#71B2EC] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB] mb-1.5">
                2. Contribute
              </h3>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] leading-relaxed">
                Submit evidence like code, designs, research, or documentation.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-end text-[#3985CF] dark:text-[#71B2EC]">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col justify-between text-left hover:border-[#15966A] dark:hover:border-[#35B982] transition group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FEF7EC] dark:bg-[#332714] text-[#D69E36] dark:text-[#E7B95D] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB] mb-1.5">
                3. Review
              </h3>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] leading-relaxed">
                Get teammate verification to ensure genuine contributions.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-end text-[#D69E36] dark:text-[#E7B95D]">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col justify-between text-left hover:border-[#15966A] dark:hover:border-[#35B982] transition group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB] mb-1.5">
                4. Summarize
              </h3>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] leading-relaxed">
                Generate AI-assisted drafts that synthesize evidence and activity.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-end text-[#15966A] dark:text-[#35B982]">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col justify-between text-left hover:border-[#15966A] dark:hover:border-[#35B982] transition group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#D8F0E3] dark:bg-[#214B36] text-[#15966A] dark:text-[#35B982] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB] mb-1.5">
                5. Assess
              </h3>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] leading-relaxed">
                Faculty reviews the team's work with complete context.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-end text-[#15966A] dark:text-[#35B982]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. "WHY CHOOSE TEAMPROOF?" SECTION */}
      <section id="why-teamproof" className="py-20 bg-white dark:bg-[#17251D] border-y border-[#DFE9E1] dark:border-[#2D4234] px-6 lg:px-12 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Visual Academic Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-tr from-[#EAF6EE] via-[#F2F8F4] to-[#F7FAF8] dark:from-[#153B2D] dark:via-[#17251D] dark:to-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234] shadow-lg flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#15966A] dark:bg-[#35B982] flex items-center justify-center text-white shadow-xl mb-6">
                <GraduationCap className="w-10 h-10" />
              </div>

              <div className="w-full bg-white dark:bg-[#17251D] p-4 rounded-2xl border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm space-y-2.5 text-left mb-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#172B21] dark:text-[#E8F3EB]">
                  <span>Faculty Assessment Ledger</span>
                  <span className="text-[#15966A] dark:text-[#35B982] text-[10px] bg-[#EAF6EE] dark:bg-[#1B3829] px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#52665A] dark:text-[#849A8B]">
                  <CheckCircle2 className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
                  <span>Individual contribution weighted</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#52665A] dark:text-[#849A8B]">
                  <CheckCircle2 className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
                  <span>Peer verification cross-checked</span>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#15966A] dark:text-[#35B982]">
                Built for Human Academic Judgment
              </span>
            </div>
          </div>

          {/* Right: 2x2 Feature Grid */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172B21] dark:text-[#E8F3EB] tracking-tight">
                Why Choose TeamProof?
              </h2>
              <p className="text-sm text-[#52665A] dark:text-[#849A8B] mt-2">
                Designed to bridge the gap between team collaboration and fair grading.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB]">Fair & Transparent</h3>
                  <p className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1">
                    Recognize individual effort accurately across every milestone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB]">Evidence-Driven</h3>
                  <p className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1">
                    Backed by verifiable code, architectural designs, and research files.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB]">
                    Multi-Disciplinary Support
                  </h3>
                  <p className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1">
                    Works seamlessly for code, design, research, testing, and more.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB]">Academic Trust</h3>
                  <p className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1">
                    Designed for student teams, course coordinators, and faculty reviewers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION (CTA) BANNER */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#15966A] via-[#117A55] to-[#0D6848] text-white p-8 sm:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="space-y-2 max-w-2xl relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Start managing your academic projects the right way.
            </h2>
            <p className="text-sm sm:text-base text-[#D8F0E3]">
              Collaborate, contribute, and get the recognition you deserve.
            </p>
          </div>

          <NavLink
            to="/register"
            className="px-6 py-3.5 rounded-xl bg-white text-[#15966A] hover:bg-[#F2F8F4] text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition transform hover:scale-105 shrink-0 inline-flex items-center gap-2 relative z-10"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-white dark:bg-[#17251D] border-t border-[#DFE9E1] dark:border-[#2D4234] py-10 px-6 lg:px-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#15966A] dark:bg-[#35B982] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-[#172B21] dark:text-[#E8F3EB] tracking-tight block leading-tight">
                TeamProof
              </span>
              <span className="text-[9px] font-bold text-[#52665A] dark:text-[#849A8B] tracking-widest uppercase block">
                ACADEMIC ASSESSMENT
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#52665A] dark:text-[#B0C4B5]">
            <button onClick={() => scrollToSection('home', 'Home')} className="hover:text-[#15966A] dark:hover:text-[#35B982] transition">
              Home
            </button>
            <button onClick={() => scrollToSection('features', 'Features')} className="hover:text-[#15966A] dark:hover:text-[#35B982] transition">
              Features
            </button>
            <button onClick={() => scrollToSection('workflow', 'Workflow')} className="hover:text-[#15966A] dark:hover:text-[#35B982] transition">
              Workflow
            </button>
            <button onClick={() => scrollToSection('why-teamproof', 'Why TeamProof')} className="hover:text-[#15966A] dark:hover:text-[#35B982] transition">
              Why TeamProof
            </button>
            <button onClick={() => setFaqModalOpen(true)} className="hover:text-[#15966A] dark:hover:text-[#35B982] transition">
              FAQ
            </button>
          </div>

          <div className="text-xs text-[#84948A] dark:text-[#849A8B] text-center sm:text-right">
            © 2026 TeamProof. All rights reserved.
          </div>
        </div>
      </footer>

      {/* FAQ MODAL */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#17251D] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#DFE9E1] dark:border-[#2D4234] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#DFE9E1] dark:border-[#2D4234]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#15966A] dark:text-[#35B982]" />
                <h3 className="font-bold text-base text-[#172B21] dark:text-[#E8F3EB]">
                  Frequently Asked Questions
                </h3>
              </div>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="text-[#84948A] hover:text-[#172B21] dark:text-[#849A8B] dark:hover:text-[#E8F3EB] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-left text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                <h4 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB] mb-1">
                  Does TeamProof automatically compute student grades?
                </h4>
                <p className="text-[#52665A] dark:text-[#849A8B] leading-relaxed">
                  No. TeamProof strictly adheres to the core principle of supporting human academic judgment. It organizes verified work, files, and Git events into transparent evidence trails, but never replaces the professor's grading evaluation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                <h4 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB] mb-1">
                  Can a student verify their own submitted evidence?
                </h4>
                <p className="text-[#52665A] dark:text-[#849A8B] leading-relaxed">
                  No. Academic integrity rules strictly prevent self-verification. Only designated teammates or faculty reviewers can mark evidence as Verified or request changes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                <h4 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB] mb-1">
                  What types of contributions can be submitted?
                </h4>
                <p className="text-[#52665A] dark:text-[#849A8B] leading-relaxed">
                  TeamProof values non-code contributions equally with code development. Submissions can include System Architecture, Research Documents, Testing & QA reports, Figma UI/UX designs, and GitHub pull requests.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7FAF8] dark:bg-[#101A15] border border-[#DFE9E1] dark:border-[#2D4234]">
                <h4 className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB] mb-1">
                  How does the Dark Mode setting work?
                </h4>
                <p className="text-[#52665A] dark:text-[#849A8B] leading-relaxed">
                  Your theme preference set on the home page toggle is saved in your browser and automatically carries across the Sign In, Register, and Dashboard workspaces.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DFE9E1] dark:border-[#2D4234] flex justify-end">
              <button
                onClick={() => setFaqModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LandingPage;
