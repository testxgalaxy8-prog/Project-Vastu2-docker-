import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Eye,
  Sliders,
  ExternalLink,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  RotateCcw,
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { BrandName } from '../BrandName';
import { VastuRitamLogo } from '../VastuRitamLogo';

interface WebsiteLogoManagerProps {
  userRole?: string;
  onNotification: (msg: string) => void;
}

export const WebsiteLogoManager: React.FC<WebsiteLogoManagerProps> = ({
  userRole = 'admin',
  onNotification,
}) => {
  const { logoUrl, updateLogoUrl, refreshSettings } = useSiteSettings();

  const [currentLogo, setCurrentLogo] = useState<string>(logoUrl || '/trademark-logo.jpg');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(logoUrl || '/trademark-logo.jpg');
  const [urlInput, setUrlInput] = useState<string>('');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Aspect ratio and dimension metrics
  const [dimensions, setDimensions] = useState<{ width: number; height: number; ratio: string } | null>(null);

  // Preview context controls
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logoUrl) {
      setCurrentLogo(logoUrl);
      setPreviewUrl(logoUrl);
    }
  }, [logoUrl]);

  // Compute natural dimensions and aspect ratio of preview image
  useEffect(() => {
    if (!previewUrl) return;
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const ratioVal = h > 0 ? (w / h).toFixed(2) : '1.00';
      let ratioName = `${ratioVal} : 1`;
      if (Math.abs(w / h - 1) < 0.05) ratioName = '1:1 (Square / Emblem)';
      else if (Math.abs(w / h - 1.78) < 0.1) ratioName = '16:9 (Widescreen)';
      else if (w / h > 2) ratioName = `${ratioVal}:1 (Horizontal Banner)`;

      setDimensions({ width: w, height: h, ratio: ratioName });
    };
    img.onerror = () => {
      setDimensions(null);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSaveSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleApplyUrl = () => {
    setErrorMessage(null);
    setSaveSuccess(false);
    if (!urlInput.trim()) {
      setErrorMessage('Please enter an image URL.');
      return;
    }
    setSelectedFile(null);
    setPreviewUrl(urlInput.trim());
  };

  const handleResetToDefault = () => {
    if (!window.confirm('Are you sure you want to revert the website logo to the default canonical Vastu Ritam trademark logo?')) {
      return;
    }
    setSelectedFile(null);
    setUrlInput('');
    setPreviewUrl('/trademark-logo.jpg');
    setErrorMessage(null);
    setSaveSuccess(false);
  };

  const handleSaveLogo = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      let finalUrl = previewUrl;

      // Case 1: Uploading a new local file via Base64 endpoint
      if (selectedFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(selectedFile);
        const base64Data = await base64Promise;

        const uploadRes = await fetch('/api/admin/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            base64Data,
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload logo file to server');
        }

        finalUrl = uploadData.logoUrl || uploadData.url;
      } else {
        // Case 2: Saving a direct URL or default logo
        const saveRes = await fetch('/api/admin/settings/logo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ logoUrl: previewUrl }),
        });

        const saveData = await saveRes.json();
        if (!saveRes.ok) {
          throw new Error(saveData.error || 'Failed to update website logo setting');
        }

        finalUrl = saveData.logoUrl || previewUrl;
      }

      // Update state and context
      setCurrentLogo(finalUrl);
      setPreviewUrl(finalUrl);
      setSelectedFile(null);
      updateLogoUrl(finalUrl);
      await refreshSettings();

      setSaveSuccess(true);
      onNotification('Website Logo successfully updated! The public website is now live with the new logo.');
    } catch (err: any) {
      console.error('Error saving logo:', err);
      setErrorMessage(err.message || 'Failed to save logo setting');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-serif">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-900/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-400 font-bold">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Vastu Purusha Emblem & Logo Management</span>
          </div>
          <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold text-amber-200 mt-1">
            Emblem & Website Logo Settings
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl font-['Marcellus']">
            Upload, preview, replace, and save the official Vastu Purusha emblem and website logo image. The saved image automatically updates everywhere the logo is displayed across the platform—including the “Our Emblem · Our Identity” section, top navigation header, footer, and medallions.
          </p>
        </div>

        {/* Quick Reset Button */}
        <button
          onClick={handleResetToDefault}
          type="button"
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-[#D5C2B5] bg-white text-[#2A1515] hover:bg-[#FAF6EE] text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          title="Reset to default canonical trademark logo"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C51E28]" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 flex items-center gap-3 shadow-xs animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Logo Published!</span> Your new website logo is now active and immediately visible to all visitors across every page of the public platform.
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-800 flex items-center gap-3 shadow-xs animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-xs sm:text-sm">{errorMessage}</div>
        </div>
      )}

      {/* Two Column Layout: Left Column Upload Form, Right Column Real-Time Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (6 cols): Upload & Configuration */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Logo Source Selection */}
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <span className="text-xs uppercase font-bold text-[#2A1515] tracking-wider">
                Logo Source
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D5C2B5] shadow-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-[#C51E28] text-white shadow-xs'
                      : 'text-stone-600 hover:text-[#C51E28]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('url')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    inputMode === 'url'
                      ? 'bg-[#C51E28] text-white shadow-xs'
                      : 'text-stone-600 hover:text-[#C51E28]'
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>

            {/* Mode 1: File Upload */}
            {inputMode === 'upload' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#D5C2B5] hover:border-[#C51E28] rounded-2xl p-6 sm:p-8 text-center bg-white hover:bg-[#FAF6EE] transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FDF2F4] border border-[#FBCFE8] text-[#C51E28] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#2A1515] block">
                      Click to Browse or Drag Logo Here
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-1">
                      Supports PNG, SVG, JPG, WebP (Max 5MB)
                    </span>
                  </div>
                  {selectedFile && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F4] border border-[#FBCFE8] text-[#C51E28] text-xs font-mono font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Direct Image URL */}
            {inputMode === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-mono text-stone-600 uppercase font-bold">
                  Image Public or Asset URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="e.g. /custom-logo.png or https://example.com/logo.png"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder:text-stone-400 text-xs font-mono focus:outline-none focus:border-[#C51E28]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white text-xs font-bold font-mono cursor-pointer transition-colors shadow-xs"
                  >
                    Load
                  </button>
                </div>
              </div>
            )}

            {/* Logo Specifications & Aspect Ratio Card */}
            {dimensions && (
              <div className="rounded-xl bg-white border border-[#E8DEC8] p-4 space-y-2 text-xs font-mono shadow-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Natural Dimensions:</span>
                  <span className="text-[#2A1515] font-bold">
                    {dimensions.width}px × {dimensions.height}px
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Aspect Ratio:</span>
                  <span className="text-[#2A1515] font-bold">{dimensions.ratio}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Aspect Preservation:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Guaranteed (object-contain)
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveLogo}
                disabled={isSaving}
                className="flex-1 py-3 px-6 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving & Publishing Logo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save & Publish Website Logo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Multi-Context Live Previews */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C51E28]" />
                <span className="text-xs uppercase font-bold text-[#2A1515] tracking-wider">
                  Live Context Preview
                </span>
              </div>

              {/* Theme & Viewport Toggle */}
              <div className="flex items-center gap-2">
                {/* Light/Dark Toggle */}
                <button
                  type="button"
                  onClick={() => setPreviewTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
                  className="p-1.5 rounded-lg bg-white border border-[#D5C2B5] text-[#2A1515] hover:bg-[#FAF6EE] cursor-pointer shadow-xs"
                  title="Toggle Light / Dark Preview"
                >
                  {previewTheme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Desktop/Mobile Toggle */}
                <button
                  type="button"
                  onClick={() => setPreviewViewport((prev) => (prev === 'desktop' ? 'mobile' : 'desktop'))}
                  className="p-1.5 rounded-lg bg-white border border-[#D5C2B5] text-[#2A1515] hover:bg-[#FAF6EE] cursor-pointer shadow-xs"
                  title="Toggle Desktop / Mobile Bar Preview"
                >
                  {previewViewport === 'desktop' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Context 1: Navigation Bar Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                1. Top Navigation Bar ({previewViewport === 'desktop' ? 'Desktop 72px' : 'Mobile 64px'})
              </span>
              <div
                className={`rounded-xl border p-3 sm:p-4 transition-colors duration-200 ${
                  previewTheme === 'light'
                    ? 'bg-[#FFFAF5] border-[#EBDCD5] text-[#2A1515]'
                    : 'bg-[#1A0F0F] border-[#44262E] text-[#FFF6F7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Logo Component with custom url prop */}
                  <VastuRitamLogo
                    variant="horizontal"
                    size={previewViewport === 'desktop' ? 44 : 38}
                    customLogoUrl={previewUrl}
                  />

                  {/* Mock Nav Elements */}
                  <div className="hidden sm:flex items-center gap-3 text-xs opacity-70">
                    <span className="hover:text-amber-600 cursor-pointer">Gyan Kosh</span>
                    <span className="hover:text-amber-600 cursor-pointer">Discover</span>
                    <span className="px-3 py-1 rounded-lg bg-[#C51E28] text-white font-bold text-[11px]">
                      Consult
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Context 2: Sacred Circular Emblem Variant */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                2. Emblem Variant (Hero Badge & Footer Medallion)
              </span>
              <div
                className={`rounded-xl border p-4 sm:p-6 flex items-center justify-center gap-6 transition-colors duration-200 ${
                  previewTheme === 'light'
                    ? 'bg-[#FFFAF5] border-[#EBDCD5]'
                    : 'bg-[#1A0F0F] border-[#44262E]'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <VastuRitamLogo variant="emblem" size={60} customLogoUrl={previewUrl} />
                  <span className="text-[10px] font-mono text-stone-500">60px Emblem</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <VastuRitamLogo variant="emblem" size={80} customLogoUrl={previewUrl} />
                  <span className="text-[10px] font-mono text-stone-500">80px Large</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <VastuRitamLogo variant="emblem" size={44} customLogoUrl={previewUrl} />
                  <span className="text-[10px] font-mono text-stone-500">44px Compact</span>
                </div>
              </div>
            </div>

            {/* Context 3: Full Trademark Lockup Variant */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                3. Full Lockup Variant
              </span>
              <div
                className={`rounded-xl border p-4 flex items-center justify-center transition-colors duration-200 ${
                  previewTheme === 'light'
                    ? 'bg-[#FFFAF5] border-[#EBDCD5]'
                    : 'bg-[#1A0F0F] border-[#44262E]'
                }`}
              >
                <div className="max-w-[200px] w-full">
                  <VastuRitamLogo variant="full" size={160} customLogoUrl={previewUrl} />
                </div>
              </div>
            </div>

            {/* Context 4: Our Emblem · Our Identity Section Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                4. “Our Emblem · Our Identity” Interactive Section Preview
              </span>
              <div
                className={`rounded-xl border p-4 transition-colors duration-200 ${
                  previewTheme === 'light'
                    ? 'bg-gradient-to-br from-[#FFFDFB] via-[#FFF9F5] to-[#FDF4F5] border-[#EBDCD5] text-[#2A1515]'
                    : 'bg-gradient-to-br from-[#1C1317] via-[#24151B] to-[#141C1A] border-[#44262E] text-zinc-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-white bg-[var(--color-primary,#C51E28)] px-2.5 py-0.5 rounded-full mb-1">
                    Section Preview
                  </span>
                  <div className="w-32 h-32 rounded-2xl bg-white p-2 border border-[#EBDCD5] shadow-md flex items-center justify-center overflow-hidden my-2">
                    <img
                      src={previewUrl}
                      alt="Our Emblem Preview"
                      className="w-full h-full object-contain filter contrast-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.endsWith('/trademark-logo.jpg')) {
                          target.src = '/trademark-logo.jpg';
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs font-['Cinzel_Decorative'] font-bold">
                    Official Trademark & Epistemological Model
                  </span>
                  <span className="text-[10px] text-stone-500 font-serif mt-0.5">
                    Synchronizes automatically to public “Our Emblem” section upon saving
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
