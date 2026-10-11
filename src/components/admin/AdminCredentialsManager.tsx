import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import type { AdminUser } from './AdminLayout';

interface AdminCredentialsManagerProps {
  currentUser: AdminUser;
  onUpdateCurrentUser: (user: AdminUser) => void;
  onNotification: (msg: string) => void;
}

export const AdminCredentialsManager: React.FC<AdminCredentialsManagerProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onNotification,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState(currentUser.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Please enter your current password to authorize this credential change.');
      return;
    }

    const emailTrimmed = newEmail.trim().toLowerCase();
    const hasEmailChange = emailTrimmed !== currentUser.email.toLowerCase();
    const hasPasswordChange = Boolean(newPassword);

    if (!hasEmailChange && !hasPasswordChange) {
      setErrorMsg('No changes detected. Please specify a new email or new password.');
      return;
    }

    if (hasPasswordChange) {
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation password do not match.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/change-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newEmail: hasEmailChange ? emailTrimmed : undefined,
          newPassword: hasPasswordChange ? newPassword : undefined,
          confirmPassword: hasPasswordChange ? confirmPassword : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update credentials');
      }

      setSuccessMsg(
        'Credentials updated successfully! Your new email and password are now required on next login. Default credentials have been permanently superseded.'
      );
      onNotification('Login email and password updated successfully!');

      if (data.user) {
        onUpdateCurrentUser(data.user);
      }

      // Clear sensitive fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-500">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Cinzel',serif] text-2xl font-bold text-stone-900 dark:text-amber-200">
              Admin Login & Security Credentials
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Change your login email and password. Default credentials will be permanently disabled upon modification.
            </p>
          </div>
        </div>
      </div>

      {/* Strict Security Policy Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#1C0F0A] border border-amber-300 dark:border-amber-800/80 text-xs text-stone-800 dark:text-amber-100/90 space-y-1.5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Strict Authorization Policy (No Public Signup)</span>
        </div>
        <p className="leading-relaxed text-stone-700 dark:text-stone-300">
          Access to this CMS console is strictly restricted to pre-authorized personnel. Public self-registration and signup pages are permanently disabled.
          Once you update your email and password here, the login screen will never reveal or accept default credentials.
        </p>
      </div>

      {/* Current Account Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1E110A] border border-stone-200 dark:border-amber-900/60 shadow-sm space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
          Active Authenticated Authority
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-serif pt-1">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-amber-950">
            <span className="block text-[10px] text-stone-500 uppercase">Current Email</span>
            <span className="font-bold text-stone-900 dark:text-amber-100 font-mono text-sm">
              {currentUser.email}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-amber-950">
            <span className="block text-[10px] text-stone-500 uppercase">Assigned Role</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              {currentUser.role}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-amber-950">
            <span className="block text-[10px] text-stone-500 uppercase">Access Status</span>
            <span className="font-bold text-stone-800 dark:text-amber-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Full Management Authority</span>
            </span>
          </div>
        </div>
      </div>

      {/* Credential Update Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-[#1A0E08] border-2 border-amber-400/80 dark:border-amber-500/50 shadow-xl space-y-5 text-sm">
        <h3 className="font-['Cinzel',serif] text-base font-bold text-stone-900 dark:text-amber-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Update Login Email & Password</span>
        </h3>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section 1: Verification */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-[#25150D] border border-amber-200 dark:border-amber-900/60 space-y-2">
          <label className="block text-xs font-serif font-bold text-amber-950 dark:text-amber-200">
            1. Current Password (Required for Authorization) *
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              required
              placeholder="Enter your existing password to confirm identity"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-white dark:bg-[#150A05] border border-stone-300 dark:border-amber-900/80 text-stone-900 dark:text-amber-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 text-xs font-mono"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Section 2: New Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-serif font-bold text-stone-800 dark:text-amber-200 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Login Email Address</span>
          </label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="e.g. admin@vasturitam.com"
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25150D] border border-stone-300 dark:border-amber-900/80 text-stone-900 dark:text-amber-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 text-xs font-mono"
          />
          <p className="text-[11px] text-stone-500">
            This email will be required every time you sign in to the CMS console.
          </p>
        </div>

        {/* Section 3: New Password & Confirmation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-serif font-bold text-stone-800 dark:text-amber-200">
              3. New Password (Optional)
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Leave blank to keep existing password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25150D] border border-stone-300 dark:border-amber-900/80 text-stone-900 dark:text-amber-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-stone-400">Minimum 6 characters</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-serif font-bold text-stone-800 dark:text-amber-200">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!newPassword}
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25150D] border border-stone-300 dark:border-amber-900/80 text-stone-900 dark:text-amber-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 text-xs font-mono disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-stone-200 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-serif">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Default credentials will be overwritten upon saving.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Save & Activate New Credentials</span>
          </button>
        </div>
      </form>
    </div>
  );
};
