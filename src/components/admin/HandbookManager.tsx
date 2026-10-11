import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Upload,
  FileText,
  Users,
  Search,
  Download,
  Trash2,
  Edit,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Layers,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  Loader2,
  HardDrive,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { HandbookViewerModal } from '../HandbookViewerModal';
import { HandbookItem } from '../HandbookAccessModal';

export interface AdminHandbookItem extends HandbookItem {
  slug: string;
  pdfFileName?: string | null;
  pdfFilePath?: string | null;
  pdfFileSizeBytes?: number | null;
  isPublished: boolean;
  displayOrder: number;
  leadsCount: number;
  hasPdf: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HandbookLeadItem {
  id: number;
  handbookId: string;
  handbookTitle: string;
  fullName?: string | null;
  email: string;
  phone: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

interface HandbookManagerProps {
  onNotification: (msg: string) => void;
  userRole?: string;
}

export const HandbookManager: React.FC<HandbookManagerProps> = ({
  onNotification,
  userRole = 'editor',
}) => {
  const { isLight } = useTheme();

  // Active Tab: 'handbooks' | 'leads'
  const [activeSubTab, setActiveSubTab] = useState<'handbooks' | 'leads'>('handbooks');

  // Handbooks state
  const [handbooks, setHandbooks] = useState<AdminHandbookItem[]>([]);
  const [loadingHandbooks, setLoadingHandbooks] = useState(true);
  const [handbookError, setHandbookError] = useState<string | null>(null);

  // Leads state
  const [leads, setLeads] = useState<HandbookLeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadHandbookFilter, setLeadHandbookFilter] = useState('all');
  const [leadStats, setLeadStats] = useState({ totalLeads: 0, uniqueEmails: 0, uniquePhones: 0 });

  // PDF Viewer Modal State (Admin preview)
  const [previewHandbook, setPreviewHandbook] = useState<HandbookItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Upload PDF Modal State
  const [uploadModalHandbook, setUploadModalHandbook] = useState<AdminHandbookItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit / Create Handbook Modal State
  const [editModalHandbook, setEditModalHandbook] = useState<Partial<AdminHandbookItem> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [topicInput, setTopicInput] = useState('');

  // Delete Confirm Modal State
  const [deleteHandbookTarget, setDeleteHandbookTarget] = useState<AdminHandbookItem | null>(null);

  // 1. Fetch Handbooks
  const fetchHandbooks = async () => {
    try {
      setLoadingHandbooks(true);
      setHandbookError(null);
      const res = await fetch('/api/admin/handbooks');
      if (!res.ok) throw new Error('Failed to load handbooks');
      const data = await res.json();
      setHandbooks(data.handbooks || []);
    } catch (err: any) {
      console.error('Error loading handbooks:', err);
      setHandbookError(err.message || 'Unable to retrieve handbooks');
    } finally {
      setLoadingHandbooks(false);
    }
  };

  // 2. Fetch Leads
  const fetchLeads = async () => {
    try {
      setLoadingLeads(true);
      const url = new URL('/api/admin/handbook-leads', window.location.origin);
      if (leadHandbookFilter !== 'all') {
        url.searchParams.set('handbookId', leadHandbookFilter);
      }
      if (leadSearchQuery.trim()) {
        url.searchParams.set('search', leadSearchQuery.trim());
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load client leads');
      const data = await res.json();
      setLeads(data.leads || []);
      if (data.stats) setLeadStats(data.stats);
    } catch (err: any) {
      console.error('Error loading leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchHandbooks();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'leads') {
      fetchLeads();
    }
  }, [activeSubTab, leadHandbookFilter, leadSearchQuery]);

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only valid standard PDF (.pdf) documents are accepted.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError(`File exceeds maximum permitted size of 50MB (size: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
      return;
    }

    setSelectedFile(file);
  };

  // Upload or replace PDF
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalHandbook || !selectedFile) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
      reader.readAsDataURL(selectedFile);
      const base64Data = await base64Promise;

      const res = await fetch(`/api/admin/handbooks/${uploadModalHandbook.id}/upload-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          mimeType: selectedFile.type || 'application/pdf',
          base64Data,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload PDF document');

      onNotification(`PDF for "${uploadModalHandbook.title}" uploaded and published successfully`);
      setUploadModalHandbook(null);
      setSelectedFile(null);
      fetchHandbooks();
    } catch (err: any) {
      console.error('Error uploading handbook PDF:', err);
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Save / Update Handbook Metadata
  const handleSaveHandbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalHandbook || !editModalHandbook.title?.trim()) return;

    try {
      setIsEditing(true);
      const isNew = !editModalHandbook.id;
      const url = isNew ? '/api/admin/handbooks' : `/api/admin/handbooks/${editModalHandbook.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editModalHandbook),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save handbook');

      onNotification(isNew ? 'New handbook treatise created successfully' : 'Handbook updated successfully');
      setEditModalHandbook(null);
      fetchHandbooks();
    } catch (err: any) {
      alert(err.message || 'Error saving handbook');
    } finally {
      setIsEditing(false);
    }
  };

  // Delete Handbook
  const handleDeleteHandbook = async () => {
    if (!deleteHandbookTarget) return;
    try {
      const res = await fetch(`/api/admin/handbooks/${deleteHandbookTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete handbook');
      onNotification(`Handbook "${deleteHandbookTarget.title}" deleted`);
      setDeleteHandbookTarget(null);
      fetchHandbooks();
    } catch (err: any) {
      alert(err.message || 'Error deleting handbook');
    }
  };

  // Delete Lead Record
  const handleDeleteLead = async (leadId: number) => {
    if (!confirm('Are you sure you want to remove this client lead contact record?')) return;
    try {
      const res = await fetch(`/api/admin/handbook-leads/${leadId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete lead');
      onNotification('Client contact record deleted');
      fetchLeads();
    } catch (err: any) {
      alert(err.message || 'Error deleting lead');
    }
  };

  // Export Leads to CSV
  const handleExportCsv = () => {
    window.open('/api/admin/handbook-leads/export', '_blank');
  };

  // Helper formatting file size
  const formatBytes = (bytes?: number | null) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Tab Navigation */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-stone-200 shadow-xs' : 'bg-[#1C1214] border-[#44262E] shadow-md'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200/60 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Gyan Kosh · Document Vault
              </span>
            </div>
            <h1 className="font-['Cinzel_Decorative',serif] text-xl sm:text-2xl font-bold flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-[var(--color-primary,#C51E28)]" />
              <span>Handbook Management & Client Leads</span>
            </h1>
            <p className="font-['Marcellus',serif] text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
              Upload, replace, and govern classical Vastu PDF monographs. Monitor verified client access requests and export contact leads for architectural collaboration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeSubTab === 'handbooks') fetchHandbooks();
                else fetchLeads();
              }}
              title="Refresh Data"
              className={`p-2.5 rounded-xl border text-xs font-serif transition-colors cursor-pointer flex items-center gap-1.5 ${
                isLight ? 'border-stone-200 text-stone-700 hover:bg-stone-50' : 'border-stone-700 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {activeSubTab === 'handbooks' && (
              <button
                onClick={() => {
                  setEditModalHandbook({
                    title: '',
                    subtitle: '',
                    targetAudience: 'Architects & Homeowners',
                    pages: 40,
                    topics: [],
                    summary: '',
                    isPublished: true,
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary,#C51E28)] to-[#8E1118] text-white text-xs font-serif font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Handbook</span>
              </button>
            )}

            {activeSubTab === 'leads' && (
              <button
                onClick={handleExportCsv}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white text-xs font-serif font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Leads (CSV)</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtabs Switcher */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => setActiveSubTab('handbooks')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'handbooks'
                ? 'bg-[var(--color-primary,#C51E28)] text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manage Handbooks & PDFs ({handbooks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'leads'
                ? 'bg-[var(--color-primary,#C51E28)] text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Access Leads ({leadStats.totalLeads || leads.length})</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: HANDBOOKS REPOSITORY & PDF VAULT
          ===================================================================== */}
      {activeSubTab === 'handbooks' && (
        <div className="space-y-4">
          {loadingHandbooks ? (
            <div className="p-12 text-center text-stone-500 font-serif flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary,#C51E28)]" />
              <span>Loading classical handbooks repository...</span>
            </div>
          ) : handbookError ? (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <span>{handbookError}</span>
            </div>
          ) : handbooks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-stone-500 font-serif">
              <BookOpen className="w-10 h-10 mx-auto text-stone-400 mb-2" />
              <p className="font-bold text-sm">No handbooks currently catalogued</p>
              <p className="text-xs text-stone-400 mt-1">Click "Add New Handbook" above to create the first publication.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {handbooks.map((hb) => (
                <div
                  key={hb.id}
                  className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all ${
                    isLight ? 'bg-white border-stone-200/80' : 'bg-[#1C1214] border-[#44262E]'
                  }`}
                >
                  <div className="p-5 space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 truncate">
                        {hb.targetAudience}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          hb.isPublished
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20'
                        }`}
                      >
                        {hb.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="font-['Cinzel_Decorative',serif] text-base font-bold leading-snug line-clamp-2">
                        {hb.title}
                      </h3>
                      {hb.subtitle && (
                        <p className="font-['Marcellus',serif] text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-1 italic">
                          {hb.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Summary */}
                    <p className="font-['Marcellus',serif] text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                      {hb.summary}
                    </p>

                    {/* PDF Storage Status */}
                    <div
                      className={`p-2.5 rounded-xl text-xs font-mono border flex items-center justify-between ${
                        hb.hasPdf
                          ? isLight
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300'
                          : isLight
                          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                          : 'bg-amber-950/20 border-amber-900/50 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <HardDrive className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {hb.pdfFileName || 'Default Generated PDF'}
                        </span>
                      </div>
                      <span className="shrink-0 font-bold">
                        {formatBytes(hb.pdfFileSizeBytes)}
                      </span>
                    </div>

                    {/* Leads Count Stat */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-serif pt-1">
                      <span>Folios: {hb.pages} Pages</span>
                      <span className="font-bold text-[var(--color-primary,#C51E28)]">
                        {hb.leadsCount} Client Leads Captured
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div
                    className={`px-4 py-3 border-t flex items-center justify-between gap-1.5 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#23171A] border-[#44262E]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {/* Preview PDF */}
                      <button
                        onClick={() => {
                          setPreviewHandbook(hb);
                          setIsPreviewOpen(true);
                        }}
                        title="Preview PDF Document"
                        className={`p-2 rounded-lg border text-xs font-serif font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          isLight
                            ? 'border-stone-300 text-stone-700 hover:bg-stone-200/60'
                            : 'border-stone-700 text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      {/* Upload / Replace PDF */}
                      <button
                        onClick={() => {
                          setUploadModalHandbook(hb);
                          setSelectedFile(null);
                          setUploadError(null);
                        }}
                        title="Upload or Replace PDF File"
                        className="p-2 rounded-lg bg-[var(--color-primary,#C51E28)] text-white text-xs font-serif font-bold hover:bg-[#8E1118] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload PDF</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit Details */}
                      <button
                        onClick={() => {
                          setEditModalHandbook({ ...hb });
                          setTopicInput('');
                        }}
                        title="Edit Handbook Metadata"
                        className={`p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete (Admin only) */}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => setDeleteHandbookTarget(hb)}
                          title="Delete Handbook"
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: CLIENT ACCESS LEADS / CONTACT LOGS
          ===================================================================== */}
      {activeSubTab === 'leads' && (
        <div className="space-y-4">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-white border-stone-200' : 'bg-[#1C1214] border-[#44262E]'
              }`}
            >
              <div>
                <p className="text-xs font-serif text-stone-500">Total Leads Captured</p>
                <p className="text-2xl font-bold font-['Cinzel',serif] text-[var(--color-primary,#C51E28)] mt-0.5">
                  {leadStats.totalLeads}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary,#C51E28)]/10 text-[var(--color-primary,#C51E28)] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-white border-stone-200' : 'bg-[#1C1214] border-[#44262E]'
              }`}
            >
              <div>
                <p className="text-xs font-serif text-stone-500">Unique Email Inquiries</p>
                <p className="text-2xl font-bold font-['Cinzel',serif] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {leadStats.uniqueEmails}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-white border-stone-200' : 'bg-[#1C1214] border-[#44262E]'
              }`}
            >
              <div>
                <p className="text-xs font-serif text-stone-500">Verified Mobile Contacts</p>
                <p className="text-2xl font-bold font-['Cinzel',serif] text-amber-600 dark:text-amber-400 mt-0.5">
                  {leadStats.uniquePhones}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isLight ? 'bg-white border-stone-200' : 'bg-[#1C1214] border-[#44262E]'
            }`}
          >
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={leadSearchQuery}
                onChange={(e) => setLeadSearchQuery(e.target.value)}
                placeholder="Search leads by name, email, phone..."
                className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#C51E28)] ${
                  isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-700'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={leadHandbookFilter}
                onChange={(e) => setLeadHandbookFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-serif transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#C51E28)] ${
                  isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-700'
                }`}
              >
                <option value="all">All Handbooks</option>
                {handbooks.map((h) => (
                  <option key={h.id} value={String(h.id)}>
                    {h.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl border text-xs font-serif font-bold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Leads Table */}
          <div
            className={`rounded-2xl border overflow-hidden shadow-xs ${
              isLight ? 'bg-white border-stone-200' : 'bg-[#1C1214] border-[#44262E]'
            }`}
          >
            {loadingLeads ? (
              <div className="p-12 text-center text-stone-500 font-serif flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary,#C51E28)]" />
                <span>Loading verified client contact records...</span>
              </div>
            ) : leads.length === 0 ? (
              <div className="p-12 text-center text-stone-500 font-serif">
                <Users className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                <p className="font-bold text-sm">No client leads logged yet</p>
                <p className="text-xs text-stone-400 mt-1">
                  When website visitors request to read handbooks, their contact submissions will be captured here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      className={`border-b font-['Cinzel',serif] uppercase text-[11px] font-bold ${
                        isLight ? 'bg-stone-50 text-stone-600 border-stone-200' : 'bg-[#23171A] text-stone-400 border-[#44262E]'
                      }`}
                    >
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Mobile Number</th>
                      <th className="py-3 px-4">Handbook Requested</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800 font-['Marcellus',serif]">
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className={`hover:bg-stone-50/80 dark:hover:bg-stone-900/40 transition-colors ${
                          isLight ? 'text-stone-800' : 'text-stone-200'
                        }`}
                      >
                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap text-[11px] text-stone-500 font-mono">
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 font-bold">
                          {lead.fullName || <span className="text-stone-400 italic">Not Provided</span>}
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 font-mono">
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-[var(--color-primary,#C51E28)] hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            <span>{lead.email}</span>
                          </a>
                        </td>

                        {/* Mobile Phone */}
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          <a
                            href={`tel:${lead.phone}`}
                            className="hover:underline flex items-center gap-1 text-emerald-700 dark:text-emerald-400"
                          >
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{lead.phone}</span>
                          </a>
                        </td>

                        {/* Handbook Requested */}
                        <td className="py-3 px-4">
                          <span className="font-['Cinzel_Decorative'] font-bold text-[11px]">
                            {lead.handbookTitle}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            title="Delete Lead"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: UPLOAD / REPLACE PDF
          ===================================================================== */}
      {uploadModalHandbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
              isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-[#1C1214] border-[#44262E] text-stone-100'
            }`}
          >
            <button
              onClick={() => {
                if (!isUploading) setUploadModalHandbook(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-['Cinzel_Decorative',serif] text-lg font-bold flex items-center gap-2 mb-1">
              <Upload className="w-5 h-5 text-[var(--color-primary,#C51E28)]" />
              <span>Upload / Replace Handbook PDF</span>
            </h3>
            <p className="font-['Marcellus',serif] text-xs text-stone-500 mb-4 line-clamp-1">
              Target Handbook: <strong>{uploadModalHandbook.title}</strong>
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* File Dropzone / Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                  selectedFile
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : isLight
                    ? 'border-stone-300 hover:border-[var(--color-primary,#C51E28)] bg-stone-50'
                    : 'border-stone-700 hover:border-[var(--color-primary,#C51E28)] bg-stone-900/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <FileText className="w-10 h-10 mx-auto text-[var(--color-primary,#C51E28)] mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="font-bold text-xs font-mono text-emerald-600 dark:text-emerald-400">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {formatBytes(selectedFile.size)} · Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-xs font-serif">Click to Select PDF File</p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Standard PDF documents up to 50MB
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-stone-500 font-['Marcellus']">
                ✦ The uploaded PDF is protected in server vault storage and streamed directly to clients upon mobile validation.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalHandbook(null)}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-xs font-serif border border-stone-300 dark:border-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-5 py-2 rounded-xl bg-[var(--color-primary,#C51E28)] text-white text-xs font-serif font-bold shadow-md hover:bg-[#8E1118] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading & Validating...</span>
                    </>
                  ) : (
                    <span>Publish PDF to Vault</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: EDIT OR CREATE HANDBOOK METADATA
          ===================================================================== */}
      {editModalHandbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-[#1C1214] border-[#44262E] text-stone-100'
            }`}
          >
            <button
              onClick={() => setEditModalHandbook(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-['Cinzel_Decorative',serif] text-lg font-bold mb-1">
              {editModalHandbook.id ? 'Edit Handbook Treatise' : 'Catalog New Handbook'}
            </h3>
            <p className="font-['Marcellus',serif] text-xs text-stone-500 mb-4">
              Enter academic classification, target readership, and curriculum modules.
            </p>

            <form onSubmit={handleSaveHandbook} className="space-y-3.5 text-xs font-serif">
              <div>
                <label className="block font-bold mb-1">Handbook Title *</label>
                <input
                  type="text"
                  required
                  value={editModalHandbook.title || ''}
                  onChange={(e) => setEditModalHandbook({ ...editModalHandbook, title: e.target.value })}
                  placeholder="e.g. Vastu for Contemporary Architects"
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-700'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Subtitle / Sub-header</label>
                <input
                  type="text"
                  value={editModalHandbook.subtitle || ''}
                  onChange={(e) => setEditModalHandbook({ ...editModalHandbook, subtitle: e.target.value })}
                  placeholder="e.g. A Field Guide to Seamless CAD & BIM Integration"
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-700'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={editModalHandbook.targetAudience || ''}
                    onChange={(e) => setEditModalHandbook({ ...editModalHandbook, targetAudience: e.target.value })}
                    placeholder="e.g. Architects & Urban Planners"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Estimated Folio Pages</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={editModalHandbook.pages || 40}
                    onChange={(e) => setEditModalHandbook({ ...editModalHandbook, pages: parseInt(e.target.value, 10) || 40 })}
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-700'
                    }`}
                  />
                </div>
              </div>

              {/* Topics / Curriculum modules */}
              <div>
                <label className="block font-bold mb-1">Curriculum Topics & Modules</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Add a topic (e.g. Solar Vector Mapping)..."
                    className={`flex-1 px-3 py-2 rounded-xl border ${
                      isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-700'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (topicInput.trim()) {
                          const list = editModalHandbook.topics || [];
                          setEditModalHandbook({ ...editModalHandbook, topics: [...list, topicInput.trim()] });
                          setTopicInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (topicInput.trim()) {
                        const list = editModalHandbook.topics || [];
                        setEditModalHandbook({ ...editModalHandbook, topics: [...list, topicInput.trim()] });
                        setTopicInput('');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {(editModalHandbook.topics || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border text-[11px] flex items-center gap-1 font-mono"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const list = (editModalHandbook.topics || []).filter((_, i) => i !== idx);
                          setEditModalHandbook({ ...editModalHandbook, topics: list });
                        }}
                        className="text-stone-400 hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Executive Summary / Overview</label>
                <textarea
                  rows={3}
                  value={editModalHandbook.summary || ''}
                  onChange={(e) => setEditModalHandbook({ ...editModalHandbook, summary: e.target.value })}
                  placeholder="Brief synopsis of what readers will learn from this treatise..."
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isLight ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-700'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hb-published"
                  checked={editModalHandbook.isPublished !== false}
                  onChange={(e) => setEditModalHandbook({ ...editModalHandbook, isPublished: e.target.checked })}
                  className="rounded cursor-pointer"
                />
                <label htmlFor="hb-published" className="font-bold cursor-pointer">
                  Publish to Gyan Kosh Repository (Visible to visitors)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditModalHandbook(null)}
                  disabled={isEditing}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-5 py-2 rounded-xl bg-[var(--color-primary,#C51E28)] text-white font-bold shadow-md hover:bg-[#8E1118] transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Handbook</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: DELETE CONFIRMATION
          ===================================================================== */}
      {deleteHandbookTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
              isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-[#1C1214] border-[#44262E] text-stone-100'
            }`}
          >
            <h4 className="font-['Cinzel_Decorative',serif] text-base font-bold text-red-600 mb-2">
              Confirm Delete Handbook
            </h4>
            <p className="font-['Marcellus',serif] text-xs text-stone-500 mb-4">
              Are you sure you want to permanently delete "<strong>{deleteHandbookTarget.title}</strong>" and its stored PDF file from the repository?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteHandbookTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-serif border border-stone-300 dark:border-stone-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteHandbook}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-serif font-bold hover:bg-red-700 cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded PDF Viewer Modal for Admin Preview */}
      <HandbookViewerModal
        handbook={previewHandbook}
        token="admin_preview_authorized"
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewHandbook(null);
        }}
      />
    </div>
  );
};
