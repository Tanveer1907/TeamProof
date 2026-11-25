import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  KeyRound,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  // Profile edit form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);

    try {
      await updateProfile(name, bio);
      setProfileSuccess('Profile details saved successfully.');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#172B21] dark:text-[#F1F5F3] tracking-tight">
          Account Profile & Settings
        </h1>
        <p className="text-sm text-[#52665A] dark:text-[#858F8C] mt-0.5">
          Manage your personal identity, bio, and academic account security.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-[#1B2022] rounded-2xl border border-[#DFE9E1] dark:border-[#30383A] p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-[#15966A] dark:bg-[#15966A] text-white font-bold text-2xl flex items-center justify-center shadow-md">
          {user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-lg font-bold text-[#172B21] dark:text-[#F1F5F3]">{user?.name}</h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#52665A] dark:text-[#858F8C]">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 capitalize font-medium text-[#15966A] dark:text-[#35B982]">
              <Shield className="w-3.5 h-3.5" />
              <span>{user?.role?.replace('_', ' ')}</span>
            </span>
          </div>
          <p className="text-xs text-[#84948A] dark:text-[#858F8C] pt-1 italic">
            {user?.bio || 'No personal bio added yet.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Edit Profile Form */}
        <div className="bg-white dark:bg-[#1B2022] rounded-2xl border border-[#DFE9E1] dark:border-[#30383A] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DFE9E1] dark:border-[#30383A]">
            <UserIcon className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
            <h3 className="text-sm font-bold text-[#172B21] dark:text-[#F1F5F3]">Edit Profile Information</h3>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-lg bg-[#EAF6EE] dark:bg-[#133827] text-[#15966A] dark:text-[#35B982] text-xs flex items-center gap-2 border border-[#DFE9E1] dark:border-[#30383A]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#DC5555] dark:text-[#F07878] text-xs flex items-center gap-2 border border-red-200 dark:border-red-900/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-[#F2F8F4] dark:bg-[#22292B] text-[#84948A] dark:text-[#858F8C] cursor-not-allowed opacity-80"
              />
              <span className="text-[10px] text-[#84948A] dark:text-[#858F8C] mt-0.5 block">
                Primary university email cannot be changed directly.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                User Role (Read-only)
              </label>
              <input
                type="text"
                disabled
                value={user?.role?.toUpperCase() || ''}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-[#F2F8F4] dark:bg-[#22292B] text-[#84948A] dark:text-[#858F8C] cursor-not-allowed opacity-80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                Short Bio / Academic Specialty
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 5th Semester Computer Science student specializing in backend architecture..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#15966A] hover:bg-[#117A55] dark:bg-[#15966A] dark:hover:bg-[#4AC993] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-[#1B2022] rounded-2xl border border-[#DFE9E1] dark:border-[#30383A] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DFE9E1] dark:border-[#30383A]">
            <KeyRound className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
            <h3 className="text-sm font-bold text-[#172B21] dark:text-[#F1F5F3]">Security & Password</h3>
          </div>

          {pwSuccess && (
            <div className="p-3 rounded-lg bg-[#EAF6EE] dark:bg-[#133827] text-[#15966A] dark:text-[#35B982] text-xs flex items-center gap-2 border border-[#DFE9E1] dark:border-[#30383A]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#DC5555] dark:text-[#F07878] text-xs flex items-center gap-2 border border-red-200 dark:border-red-900/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#84948A] dark:text-[#858F8C] hover:text-[#172B21] dark:hover:text-[#F1F5F3] transition p-0.5 focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                New Password * (Min. 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#84948A] dark:text-[#858F8C] hover:text-[#172B21] dark:hover:text-[#F1F5F3] transition p-0.5 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#22292B] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#84948A] dark:text-[#858F8C] hover:text-[#172B21] dark:hover:text-[#F1F5F3] transition p-0.5 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={pwSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#15966A] hover:bg-[#117A55] dark:bg-[#15966A] dark:hover:bg-[#4AC993] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{pwSaving ? 'Updating...' : 'Change Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
