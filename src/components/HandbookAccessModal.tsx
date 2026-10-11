import React, { useState } from 'react';
import { BookOpen, X, Mail, Phone, User, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface HandbookItem {
  id: string | number;
  title: string;
  subtitle?: string;
  targetAudience?: string;
  pages?: number;
  topics?: string[];
  summary?: string;
}

interface HandbookAccessModalProps {
  handbook: HandbookItem;
  isOpen: boolean;
  onClose: () => void;
  onAccessGranted: (token: string, handbook: HandbookItem) => void;
}

export const HandbookAccessModal: React.FC<HandbookAccessModalProps> = ({
  handbook,
  isOpen,
  onClose,
  onAccessGranted,
}) => {
  const { isLight } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    setErrorMessage(null);

    // Email validation
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com)');
      return false;
    }

    // Phone validation (minimum 10 digits)
    const digitsOnly = phone.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length < 10 || digitsOnly.length > 15) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await fetch('/api/handbooks/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handbookId: handbook.id,
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          fullName: fullName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to unlock handbook access');
      }

      // Save token in session storage for convenient browsing
      try {
        sessionStorage.setItem(`vr_hb_token_${handbook.id}`, data.token);
      } catch {}

      onAccessGranted(data.token, handbook);
    } catch (err: any) {
      console.error('Error requesting handbook access:', err);
      setErrorMessage(err.message || 'Unable to verify details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 ${
          isLight
            ? 'bg-[#FFFDF9] border-[#EBDCD5] text-stone-900'
            : 'bg-[#1C1214] border-[#44262E] text-stone-100'
        }`}
      >
        {/* Top Decorative Brand Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--color-primary,#C51E28)] via-[var(--color-accent-orange,#F97316)] to-[var(--color-secondary,#167A68)]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-colors cursor-pointer ${
            isLight
              ? 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-7">
          {/* Header Monogram & Title */}
          <div className="flex items-start gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C51E28] to-[#8E1118] text-white flex items-center justify-center shrink-0 shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {handbook.targetAudience || 'Architects & Homeowners'}
                </span>
                {handbook.pages && (
                  <span className="text-[10px] font-serif text-stone-500">
                    · {handbook.pages} Folio Pages
                  </span>
                )}
              </div>
              <h3 className="font-['Cinzel_Decorative',serif] text-lg sm:text-xl font-bold leading-tight">
                {handbook.title}
              </h3>
              {handbook.subtitle && (
                <p className="font-['Marcellus',serif] text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                  {handbook.subtitle}
                </p>
              )}
            </div>
          </div>

          <div
            className={`p-3 rounded-xl mb-5 text-xs font-['Marcellus'] border ${
              isLight
                ? 'bg-[#FAF6EE] border-[#E8DEC8] text-stone-700'
                : 'bg-[#2A181C] border-[#44262E] text-stone-300'
            }`}
          >
            <p className="flex items-center gap-1.5 font-medium text-[var(--color-primary,#C51E28)]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Free Academic & Professional Access</span>
            </p>
            <p className="text-[11px] mt-0.5 text-stone-500 dark:text-stone-400">
              Please enter your contact details below to unlock direct reading access to this authoritative Vastu treatise.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-serif font-bold text-stone-700 dark:text-stone-300 mb-1">
                Full Name <span className="font-normal text-stone-400">(Optional / Title)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ar. Rajesh Sharma"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#C51E28)] ${
                    isLight
                      ? 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400'
                      : 'bg-stone-900/60 border-stone-700 text-stone-100 placeholder:text-stone-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-serif font-bold text-stone-700 dark:text-stone-300 mb-1">
                Email Address <span className="text-[var(--color-primary,#C51E28)]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. architect@firm.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#C51E28)] ${
                    isLight
                      ? 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400'
                      : 'bg-stone-900/60 border-stone-700 text-stone-100 placeholder:text-stone-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-serif font-bold text-stone-700 dark:text-stone-300 mb-1">
                Mobile Number <span className="text-[var(--color-primary,#C51E28)]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98200 18272 or 9820018272"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#C51E28)] ${
                    isLight
                      ? 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400'
                      : 'bg-stone-900/60 border-stone-700 text-stone-100 placeholder:text-stone-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Enter your 10-digit mobile number for verified access tokens.
              </p>
            </div>

            {/* Privacy notice */}
            <div className="pt-1 flex items-start gap-2 text-[11px] text-stone-500 dark:text-stone-400 font-['Marcellus']">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Your privacy is respected. Contact details are securely archived for scholarly research distribution only.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-4 py-2.5 rounded-xl text-xs font-serif font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'border-stone-300 text-stone-600 hover:bg-stone-100'
                    : 'border-stone-700 text-stone-400 hover:bg-stone-800'
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-gradient-to-r from-[var(--color-primary,#C51E28)] to-[#8E1118] hover:from-[#B94E2C] hover:to-[var(--color-primary,#C51E28)] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock & Read Handbook</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
