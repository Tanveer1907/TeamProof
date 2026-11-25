import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-[#F2F8F4] dark:hover:bg-[#1E3025] transition-colors cursor-pointer group shrink-0 ${className}`}
    >
      <Sun
        className={`w-4 h-4 transition-colors shrink-0 ${
          !isDark ? 'text-[#D69E36]' : 'text-[#84948A] dark:text-[#849A8B]'
        }`}
      />
      <div
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
          isDark ? 'bg-[#35B982]' : 'bg-[#DFE9E1]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
            isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      <Moon
        className={`w-4 h-4 transition-colors shrink-0 ${
          isDark ? 'text-[#35B982]' : 'text-[#84948A] dark:text-[#849A8B]'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
