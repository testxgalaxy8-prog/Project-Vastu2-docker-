import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Clock,
  Youtube,
  Twitter,
  Facebook,
  Instagram,
  MapPin,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  MessageSquare,
  Building2,
  Sparkles,
} from 'lucide-react';

export interface SiteContactSettings {
  id?: number;
  primaryPhone: string;
  secondaryPhone: string | null;
  primaryEmail: string;
  consultationEmail: string | null;
  whatsappNumber: string | null;
  whatsappNotice: string | null;
  consultationTimings: string | null;
  appointmentNotice: string | null;
  youtubeUrl: string | null;
  youtubeHandle: string | null;
  twitterUrl: string | null;
  twitterHandle: string | null;
  facebookUrl?: string | null;
  facebookHandle?: string | null;
  instagramUrl?: string | null;
  instagramHandle?: string | null;
  officeAddress: string | null;
  collaborationNotice: string | null;
  adsensePublisherId?: string | null;
  adsenseEnabled?: boolean;
  adsenseAutoAds?: boolean;
  updatedAt?: string;
}

interface ContactSettingsManagerProps {
  userRole: 'admin' | 'editor' | 'viewer';
  onNotification?: (msg: string) => void;
}

export const ContactSettingsManager: React.FC<ContactSettingsManagerProps> = ({
  userRole,
  onNotification,
}) => {
  const [formData, setFormData] = useState<SiteContactSettings>({
    primaryPhone: '',
    secondaryPhone: '',
    primaryEmail: '',
    consultationEmail: '',
    whatsappNumber: '',
    whatsappNotice: '',
    consultationTimings: '',
    appointmentNotice: '',
    youtubeUrl: '',
    youtubeHandle: '',
    twitterUrl: '',
    twitterHandle: '',
    facebookUrl: '',
    facebookHandle: '',
    instagramUrl: '',
    instagramHandle: '',
    officeAddress: '',
    collaborationNotice: '',
    adsensePublisherId: 'ca-pub-9697854430800000',
    adsenseEnabled: true,
    adsenseAutoAds: false,
  });

  const [initialData, setInitialData] = useState<SiteContactSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canEdit = userRole === 'admin' || userRole === 'editor';

  // Load live contact settings from backend
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings/contact');
      if (!res.ok) {
        throw new Error(`Failed to load contact settings: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.settings) {
        const s = data.settings;
        const mapped: SiteContactSettings = {
          id: s.id,
          primaryPhone: s.primaryPhone || s.primary_phone || '',
          secondaryPhone: s.secondaryPhone || s.secondary_phone || '',
          primaryEmail: s.primaryEmail || s.primary_email || '',
          consultationEmail: s.consultationEmail || s.consultation_email || '',
          whatsappNumber: s.whatsappNumber || s.whatsapp_number || '',
          whatsappNotice: s.whatsappNotice || s.whatsapp_notice || '',
          consultationTimings: s.consultationTimings || s.consultation_timings || '',
          appointmentNotice: s.appointmentNotice || s.appointment_notice || '',
          youtubeUrl: s.youtubeUrl || s.youtube_url || '',
          youtubeHandle: s.youtubeHandle || s.youtube_handle || '',
          twitterUrl: s.twitterUrl || s.twitter_url || '',
          twitterHandle: s.twitterHandle || s.twitter_handle || '',
          facebookUrl: s.facebookUrl || s.facebook_url || '',
          facebookHandle: s.facebookHandle || s.facebook_handle || '',
          instagramUrl: s.instagramUrl || s.instagram_url || '',
          instagramHandle: s.instagramHandle || s.instagram_handle || '',
          officeAddress: s.officeAddress || s.office_address || '',
          collaborationNotice: s.collaborationNotice || s.collaboration_notice || '',
          adsensePublisherId: s.adsensePublisherId || s.adsense_publisher_id || 'ca-pub-9697854430800000',
          adsenseEnabled: s.adsenseEnabled !== undefined ? Boolean(s.adsenseEnabled) : (s.adsense_enabled !== undefined ? Boolean(s.adsense_enabled) : true),
          adsenseAutoAds: s.adsenseAutoAds !== undefined ? Boolean(s.adsenseAutoAds) : (s.adsense_auto_ads !== undefined ? Boolean(s.adsense_auto_ads) : false),
          updatedAt: s.updatedAt || s.updated_at,
        };
        setFormData(mapped);
        setInitialData(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field: keyof SiteContactSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setError('You have viewer role only. Modifications require editor or admin role.');
      return;
    }

    if (!formData.primaryPhone.trim()) {
      setError('Primary phone number is required.');
      return;
    }
    if (!formData.primaryEmail.trim()) {
      setError('Primary email address is required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/settings/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update contact settings');
      }

      setInitialData(formData);
      setSuccessMessage('Contact details successfully saved to database and live on website!');
      if (onNotification) {
        onNotification('Contact details updated successfully');
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Database error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-8 h-8 text-[#C51E28] animate-spin" />
        <p className="font-serif text-sm text-stone-600">Loading current website contact details from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Marcellus',serif]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DEC8] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-['Cinzel',serif] text-2xl font-bold text-[#2A1515]">
              Admin Contact Details & Channels
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live on Website
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Modify institutional phone numbers, consultation desk emails, operational timings, and social knowledge channels (YouTube, Instagram, Facebook, X/Twitter).
            All modifications persist directly in the PostgreSQL database and immediately reflect on the public website.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF6EE] text-stone-700 text-xs font-serif border border-[#D5C2B5] transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A81620] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save & Publish Live'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout: Form on Left, Real-time Website Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Card 1: Telephony & WhatsApp */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs space-y-4 text-[#2A1515]">
            <div className="flex items-center gap-2 border-b border-[#E8DEC8] pb-3">
              <Phone className="w-4 h-4 text-[#C51E28]" />
              <h3 className="font-['Cinzel',serif] text-sm font-bold text-[#2A1515]">
                Direct Telephony & WhatsApp
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Primary Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.primaryPhone}
                  onChange={(e) => handleChange('primaryPhone', e.target.value)}
                  placeholder="+91 98200 18272"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Secondary / Consultation Desk Phone
                </label>
                <input
                  type="text"
                  value={formData.secondaryPhone || ''}
                  onChange={(e) => handleChange('secondaryPhone', e.target.value)}
                  placeholder="+91 98200 45678"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  WhatsApp Direct Number
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  placeholder="+919820018272"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  WhatsApp Blueprint Sharing Notice
                </label>
                <input
                  type="text"
                  value={formData.whatsappNotice || ''}
                  onChange={(e) => handleChange('whatsappNotice', e.target.value)}
                  placeholder="✦ WhatsApp Available for Blueprint Sharing"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Institutional Email Channels */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs space-y-4 text-[#2A1515]">
            <div className="flex items-center gap-2 border-b border-[#E8DEC8] pb-3">
              <Mail className="w-4 h-4 text-[#167A68]" />
              <h3 className="font-['Cinzel',serif] text-sm font-bold text-[#2A1515]">
                Institutional Email Channels
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Primary Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.primaryEmail}
                  onChange={(e) => handleChange('primaryEmail', e.target.value)}
                  placeholder="contact@vasturitam.com"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Consultation Desk Email
                </label>
                <input
                  type="email"
                  value={formData.consultationEmail || ''}
                  onChange={(e) => handleChange('consultationEmail', e.target.value)}
                  placeholder="consultation@vasturitam.com"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Timings & Prior Appointments */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs space-y-4 text-[#2A1515]">
            <div className="flex items-center gap-2 border-b border-[#E8DEC8] pb-3">
              <Clock className="w-4 h-4 text-[#F97316]" />
              <h3 className="font-['Cinzel',serif] text-sm font-bold text-[#2A1515]">
                Operational Timings & Appointment Policy
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Consultation Timings (Hours & Days)
                </label>
                <input
                  type="text"
                  value={formData.consultationTimings || ''}
                  onChange={(e) => handleChange('consultationTimings', e.target.value)}
                  placeholder="Monday – Saturday: 10:00 AM – 6:30 PM (IST)"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Prior Appointment Notice
                </label>
                <input
                  type="text"
                  value={formData.appointmentNotice || ''}
                  onChange={(e) => handleChange('appointmentNotice', e.target.value)}
                  placeholder="Prior appointment required for in-depth architectural floor plan audit."
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Official Social Knowledge Channels (YouTube, Instagram, Facebook, X/Twitter) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs space-y-4 text-[#2A1515]">
            <div className="flex items-center gap-2 border-b border-[#E8DEC8] pb-3">
              <Sparkles className="w-4 h-4 text-[#C51E28]" />
              <h3 className="font-['Cinzel',serif] text-sm font-bold text-[#2A1515]">
                Official Social Channels & Knowledge Desks
              </h3>
            </div>

            {/* YouTube */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  <Youtube className="w-3.5 h-3.5 text-[#C51E28]" />
                  <span>YouTube Channel URL</span>
                </label>
                <input
                  type="url"
                  value={formData.youtubeUrl || ''}
                  onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                  placeholder="https://youtube.com/@vasturitam"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  YouTube Display Handle
                </label>
                <input
                  type="text"
                  value={formData.youtubeHandle || ''}
                  onChange={(e) => handleChange('youtubeHandle', e.target.value)}
                  placeholder="@VastuRitam"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  <Instagram className="w-3.5 h-3.5 text-[#D82A5F]" />
                  <span>Instagram Profile URL</span>
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/vasturitam"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#D82A5F] focus:ring-1 focus:ring-[#D82A5F]/30 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Instagram Display Handle
                </label>
                <input
                  type="text"
                  value={formData.instagramHandle || ''}
                  onChange={(e) => handleChange('instagramHandle', e.target.value)}
                  placeholder="@vasturitam"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#D82A5F] focus:ring-1 focus:ring-[#D82A5F]/30 shadow-xs"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Facebook Page / Profile URL</span>
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/vasturitam"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2]/30 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Facebook Display Handle
                </label>
                <input
                  type="text"
                  value={formData.facebookHandle || ''}
                  onChange={(e) => handleChange('facebookHandle', e.target.value)}
                  placeholder="@VastuRitam"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2]/30 shadow-xs"
                />
              </div>
            </div>

            {/* X / Twitter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  <Twitter className="w-3.5 h-3.5 text-[#167A68]" />
                  <span>X / Twitter Profile URL</span>
                </label>
                <input
                  type="url"
                  value={formData.twitterUrl || ''}
                  onChange={(e) => handleChange('twitterUrl', e.target.value)}
                  placeholder="https://x.com/vasturitam"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#167A68] focus:ring-1 focus:ring-[#167A68]/30 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  X / Twitter Display Handle
                </label>
                <input
                  type="text"
                  value={formData.twitterHandle || ''}
                  onChange={(e) => handleChange('twitterHandle', e.target.value)}
                  placeholder="@VastuRitam"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#167A68] focus:ring-1 focus:ring-[#167A68]/30 shadow-xs"
                />
              </div>
            </div>

            {/* Location & Collaboration */}
            <div className="space-y-4 pt-2 border-t border-[#E8DEC8]">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Sanctuary & Research Office Location
                </label>
                <input
                  type="text"
                  value={formData.officeAddress || ''}
                  onChange={(e) => handleChange('officeAddress', e.target.value)}
                  placeholder="Vastu Ritam Research & Vedic Architecture Sanctuary, Pune / Mumbai, Maharashtra, Bharat"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Architect & Structural Engineer Collaboration Notice
                </label>
                <textarea
                  rows={2}
                  value={formData.collaborationNotice || ''}
                  onChange={(e) => handleChange('collaborationNotice', e.target.value)}
                  placeholder="Collaborations welcome from registered Architects (COA), Civil Structural Engineers, and Researchers."
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]/30 resize-none shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Google AdSense & Monetization */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs space-y-4 text-[#2A1515]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_#2563EB]" />
                <h3 className="font-['Cinzel',serif] text-sm font-bold text-[#2A1515] uppercase tracking-wider">
                  Google AdSense & Publisher Monetization
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                Official Integration
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Google AdSense Publisher ID (ca-pub-...)
                </label>
                <input
                  type="text"
                  value={formData.adsensePublisherId || ''}
                  onChange={(e) => handleChange('adsensePublisherId', e.target.value)}
                  placeholder="ca-pub-9697854430800000"
                  disabled={!canEdit || saving}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-xs"
                />
                <p className="text-[10px] text-stone-500 font-serif mt-1">
                  Used by all active AdSense placements (Leaderboards, In-Article units, Sticky Footer).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8]">
                  <input
                    type="checkbox"
                    id="adsenseEnabledCheck"
                    checked={formData.adsenseEnabled ?? true}
                    onChange={(e) => handleChange('adsenseEnabled', e.target.checked)}
                    disabled={!canEdit || saving}
                    className="w-4 h-4 rounded border-stone-300 text-[#C51E28] focus:ring-[#C51E28] cursor-pointer"
                  />
                  <label htmlFor="adsenseEnabledCheck" className="text-xs text-stone-800 font-serif cursor-pointer">
                    <span className="font-bold block text-[#2A1515]">Enable Google AdSense</span>
                    <span className="text-[10px] text-stone-500">Serve Google Ads in designated placements</span>
                  </label>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8]">
                  <input
                    type="checkbox"
                    id="adsenseAutoAdsCheck"
                    checked={formData.adsenseAutoAds ?? false}
                    onChange={(e) => handleChange('adsenseAutoAds', e.target.checked)}
                    disabled={!canEdit || saving}
                    className="w-4 h-4 rounded border-stone-300 text-[#C51E28] focus:ring-[#C51E28] cursor-pointer"
                  />
                  <label htmlFor="adsenseAutoAdsCheck" className="text-xs text-stone-800 font-serif cursor-pointer">
                    <span className="font-bold block text-[#2A1515]">AdSense Auto-Ads</span>
                    <span className="text-[10px] text-stone-500">Let Google automatically place responsive units</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          {canEdit && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF6EE] text-stone-700 text-xs font-serif border border-[#D5C2B5] transition-colors cursor-pointer shadow-xs"
              >
                Reset Changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A81620] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save & Publish Live'}</span>
              </button>
            </div>
          )}
        </form>

        {/* Right Column: Live Website Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="font-['Cinzel',serif] text-xs font-bold text-[#2A1515] flex items-center gap-1.5 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-[#C51E28]" />
              <span>Live Website Preview</span>
            </span>
            <span className="text-[10px] font-mono text-stone-500">Updates in real-time</span>
          </div>

          {/* 1. Contact Page Direct Channels Card Preview */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-stone-600 tracking-wider font-bold">
              1. Contact Page Direct Channels Card
            </span>
            <div className="rounded-2xl p-5 border-2 border-[var(--color-border)] shadow-md space-y-4 bg-[#FFFDF9] text-[#2A1515]">
              <h4 className="font-['Cinzel_Decorative'] text-sm font-black text-[#2A1515] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-orange)] inline-block" />
                <span>Direct Channels</span>
              </h4>

              {/* Phone Preview */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6EE] border border-[var(--color-border)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0 font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[var(--color-primary)] font-bold block">
                    Mobile Number
                  </span>
                  <div className="font-['Marcellus'] text-sm font-bold text-[#2A1515] truncate">
                    {formData.primaryPhone || '+91 98200 18272'}
                  </div>
                  {formData.secondaryPhone && (
                    <div className="font-['Marcellus'] text-xs text-stone-600 truncate">
                      {formData.secondaryPhone} (Consultation Desk)
                    </div>
                  )}
                  {formData.whatsappNotice && (
                    <span className="text-[10px] text-[var(--color-secondary)] font-serif block pt-0.5 font-medium">
                      {formData.whatsappNotice}
                    </span>
                  )}
                </div>
              </div>

              {/* Email Preview */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6EE] border border-[var(--color-border)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center text-white shrink-0 font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[var(--color-secondary)] font-bold block">
                    Email Address
                  </span>
                  <div className="font-['Marcellus'] text-sm font-bold text-[#2A1515] truncate">
                    {formData.primaryEmail || 'contact@vasturitam.com'}
                  </div>
                  {formData.consultationEmail && (
                    <div className="font-['Marcellus'] text-xs text-stone-600 truncate">
                      {formData.consultationEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Channels Preview - 4 Channels */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--color-border)]">
                {/* YouTube */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF6EE] border border-[var(--color-border)] text-[#2A1515]">
                  <Youtube className="w-3.5 h-3.5 text-[#C51E28] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono uppercase block text-stone-500 font-bold">YouTube</span>
                    <span className="text-[10px] font-serif block truncate">{formData.youtubeHandle || '@VastuRitam'}</span>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF6EE] border border-[var(--color-border)] text-[#2A1515]">
                  <Instagram className="w-3.5 h-3.5 text-[#D82A5F] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono uppercase block text-stone-500 font-bold">Instagram</span>
                    <span className="text-[10px] font-serif block truncate">{formData.instagramHandle || '@vasturitam'}</span>
                  </div>
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF6EE] border border-[var(--color-border)] text-[#2A1515]">
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono uppercase block text-stone-500 font-bold">Facebook</span>
                    <span className="text-[10px] font-serif block truncate">{formData.facebookHandle || '@VastuRitam'}</span>
                  </div>
                </div>

                {/* X */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF6EE] border border-[var(--color-border)] text-[#2A1515]">
                  <Twitter className="w-3.5 h-3.5 text-[var(--color-secondary)] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono uppercase block text-stone-500 font-bold">X</span>
                    <span className="text-[10px] font-serif block truncate">{formData.twitterHandle || '@VastuRitam'}</span>
                  </div>
                </div>
              </div>

              {/* Timing Preview */}
              {formData.consultationTimings && (
                <div className="pt-2 border-t border-[var(--color-border)] flex items-start gap-2 text-xs font-['Marcellus'] text-stone-600">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-accent-orange)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2A1515] block text-[11px]">Consultation Timings:</strong>
                    <span className="text-[10px]">{formData.consultationTimings}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Sacred Footer Preview */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono uppercase text-stone-600 tracking-wider font-bold">
              2. Website Footer Preview
            </span>
            <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8] text-xs font-['Marcellus'] space-y-2 text-stone-800 shadow-xs">
              <div className="font-['Cinzel_Decorative'] text-xs uppercase tracking-wider text-[#C51E28] font-bold border-b border-[#E8DEC8] pb-1.5">
                Contact & Channels
              </div>
              <div className="flex items-center gap-2 text-xs truncate">
                <Phone className="w-3.5 h-3.5 text-[var(--color-secondary)] shrink-0" />
                <span>{formData.primaryPhone || '+91 98200 18272'} {formData.secondaryPhone ? `/ ${formData.secondaryPhone}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-xs truncate">
                <Mail className="w-3.5 h-3.5 text-[var(--color-secondary)] shrink-0" />
                <span>{formData.primaryEmail || 'contact@vasturitam.com'}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] pt-1 border-t border-[#E8DEC8] text-stone-600">
                <span>YT: {formData.youtubeHandle || '@VastuRitam'}</span>
                <span>·</span>
                <span>IG: {formData.instagramHandle || '@vasturitam'}</span>
                <span>·</span>
                <span>FB: {formData.facebookHandle || '@VastuRitam'}</span>
              </div>
              {formData.collaborationNotice && (
                <p className="text-[10px] text-stone-600 pt-1 border-t border-[#E8DEC8] leading-relaxed">
                  {formData.collaborationNotice}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
