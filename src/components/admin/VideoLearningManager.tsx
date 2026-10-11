import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Plus,
  Play,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Upload,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  X,
  Filter,
  RefreshCw,
  FolderOpen,
  Compass,
  Check,
} from 'lucide-react';
import { parseAndValidateVideoUrl, SupportedVideoProvider } from '../../lib/videoUtils';

export interface VideoItem {
  id: number;
  title: string;
  slug: string;
  categoryId: number | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  topicId: number | null;
  topicName?: string | null;
  topicSlug?: string | null;
  videoUrl: string;
  videoProvider: SupportedVideoProvider | string;
  thumbnailUrl: string;
  description: string;
  status: 'draft' | 'published' | 'unpublished';
  displayOrder: number;
  duration?: string | null;
  instructor?: string | null;
  createdBy?: number | null;
  creatorName?: string | null;
  embedUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VideoLearningManagerProps {
  categoriesList: Array<{ id: number; name: string; slug: string }>;
  topicsList: Array<{ id: number; name: string; slug: string }>;
  userRole?: string;
  onNotification: (message: string) => void;
}

export const VideoLearningManager: React.FC<VideoLearningManagerProps> = ({
  categoriesList,
  topicsList,
  userRole = 'editor',
  onNotification,
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'unpublished'>('all');
  const [providerFilter, setProviderFilter] = useState<'all' | 'youtube' | 'vimeo'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview Modal
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    topicId: '',
    videoUrl: '',
    thumbnailUrl: '',
    description: '',
    status: 'draft' as 'draft' | 'published' | 'unpublished',
    duration: '',
    instructor: 'Vastu Ritam Research Fellowship',
    displayOrder: 0,
  });

  // URL Validation State for the modal
  const [urlValidation, setUrlValidation] = useState<{
    valid: boolean;
    provider: SupportedVideoProvider | null;
    embedUrl: string | null;
    error?: string;
  }>({
    valid: false,
    provider: null,
    embedUrl: null,
  });

  // Thumbnail upload file input ref & uploading state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Fetch videos from API
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/videos');
      if (!res.ok) {
        throw new Error(`Failed to load videos (HTTP ${res.status})`);
      }
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err: any) {
      console.error('Error loading video archives:', err);
      setError(err.message || 'Failed to fetch video catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Live validate video URL whenever it changes in form
  useEffect(() => {
    if (!formData.videoUrl.trim()) {
      setUrlValidation({ valid: false, provider: null, embedUrl: null });
      return;
    }
    const result = parseAndValidateVideoUrl(formData.videoUrl);
    setUrlValidation({
      valid: result.valid,
      provider: result.provider,
      embedUrl: result.embedUrl,
      error: result.error,
    });
  }, [formData.videoUrl]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      categoryId: categoriesList[0]?.id ? String(categoriesList[0].id) : '',
      topicId: topicsList[0]?.id ? String(topicsList[0].id) : '',
      videoUrl: '',
      thumbnailUrl: '/hero-sanctuary.jpg',
      description: '',
      status: 'published',
      duration: '',
      instructor: 'Vastu Ritam Fellowship',
      displayOrder: videos.length + 1,
    });
    setThumbnailPreview('/hero-sanctuary.jpg');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (video: VideoItem) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      categoryId: video.categoryId ? String(video.categoryId) : '',
      topicId: video.topicId ? String(video.topicId) : '',
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      description: video.description,
      status: video.status,
      duration: video.duration || '',
      instructor: video.instructor || 'Vastu Ritam Fellowship',
      displayOrder: video.displayOrder || 0,
    });
    setThumbnailPreview(video.thumbnailUrl);
    setIsModalOpen(true);
  };

  // Handle Thumbnail File Upload (JPG, JPEG, PNG, WebP)
  const handleThumbnailFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Only image files (JPG, JPEG, PNG, WebP) are allowed for video thumbnails.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Thumbnail image must be smaller than 5MB.');
      return;
    }

    try {
      setIsUploadingThumbnail(true);

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          setThumbnailPreview(base64Data);

          const res = await fetch('/api/admin/upload-thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              mimeType: file.type,
              base64Data,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to upload thumbnail');
          }

          const data = await res.json();
          setFormData((prev) => ({ ...prev, thumbnailUrl: data.url }));
          setThumbnailPreview(data.url);
          onNotification(`Thumbnail uploaded successfully: ${file.name}`);
        } catch (err: any) {
          console.error('Thumbnail upload error:', err);
          alert(err.message || 'Failed to process thumbnail upload');
        } finally {
          setIsUploadingThumbnail(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingThumbnail(false);
      alert(err.message || 'Error reading thumbnail file');
    }
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (overrideStatus?: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      alert('Please enter a video title');
      return;
    }
    if (!formData.videoUrl.trim()) {
      alert('Please enter an external video link (YouTube or Vimeo)');
      return;
    }

    const validation = parseAndValidateVideoUrl(formData.videoUrl);
    if (!validation.valid || !validation.provider) {
      alert(validation.error || 'Invalid video link. Only YouTube and Vimeo links are supported.');
      return;
    }

    if (!formData.thumbnailUrl.trim()) {
      alert('Please provide or upload a thumbnail image for the video');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a short description of the video');
      return;
    }

    const finalStatus = overrideStatus || formData.status;

    try {
      setIsSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        videoUrl: validation.normalizedUrl || formData.videoUrl.trim(),
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
        topicId: formData.topicId ? parseInt(formData.topicId, 10) : null,
        thumbnailUrl: formData.thumbnailUrl.trim(),
        description: formData.description.trim(),
        status: finalStatus,
        duration: formData.duration.trim() || null,
        instructor: formData.instructor.trim() || 'Vastu Ritam Research Fellowship',
        displayOrder: parseInt(String(formData.displayOrder), 10) || 0,
      };

      if (editingVideo) {
        // Update existing
        const res = await fetch(`/api/admin/videos/${editingVideo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update video');
        }
        onNotification(`Updated video: "${payload.title}" (${finalStatus})`);
      } else {
        // Create new
        const res = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save new video');
        }
        onNotification(`Saved new video: "${payload.title}" (${finalStatus})`);
      }

      setIsModalOpen(false);
      await fetchVideos();
    } catch (err: any) {
      console.error('Error saving video:', err);
      alert(err.message || 'Failed to save video record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Publish / Unpublish Status
  const handleToggleStatus = async (video: VideoItem) => {
    const nextStatus = video.status === 'published' ? 'unpublished' : 'published';
    try {
      const res = await fetch(`/api/admin/videos/${video.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, status: nextStatus } : v))
      );
      onNotification(
        nextStatus === 'published'
          ? `Published: "${video.title}" is now visible on public site!`
          : `Unpublished: "${video.title}" hidden from public site`
      );
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  // Delete Video
  const handleDeleteVideo = async (video: VideoItem) => {
    if (
      !confirm(
        `Are you sure you want to delete the video record "${video.title}"?\n\n(This only removes the metadata link. The external video on ${video.videoProvider.toUpperCase()} will NOT be affected.)`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete video');

      setVideos((prev) => prev.filter((v) => v.id !== video.id));
      onNotification(`Deleted video record: "${video.title}"`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete video');
    }
  };

  // Filtered list
  const filteredVideos = videos.filter((video) => {
    if (statusFilter !== 'all' && video.status !== statusFilter) return false;
    if (providerFilter !== 'all' && video.videoProvider.toLowerCase() !== providerFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(q);
      const matchDesc = video.description.toLowerCase().includes(q);
      const matchInstructor = video.instructor?.toLowerCase().includes(q);
      const matchTopic = video.topicName?.toLowerCase().includes(q);
      const matchCategory = video.categoryName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchInstructor && !matchTopic && !matchCategory) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Core Philosophy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E88A16]/20 border border-[#E88A16]/40 text-[#E88A16]">
              <Video className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-['Cinzel',serif] text-xl sm:text-2xl font-bold text-amber-200 flex items-center gap-2">
                <span>Gyan Kosh → Video Learning Management</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  External Provider CMS
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Manage scholarly lectures, courtyard thermodynamics analyses, and Vedic Shastra documentaries.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A72C] to-[#E88A16] hover:from-[#E88A16] hover:to-[#B45309] text-[#1A0608] font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(232,138,22,0.4)] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Video</span>
        </button>
      </div>

      {/* Strict Architectural Architecture Banner */}
      <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] text-[#2A1515] text-xs font-serif leading-relaxed flex items-start gap-3 shadow-xs">
        <Sparkles className="w-4 h-4 text-[#C51E28] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#2A1515]">
            External Video Hosting Principle (Zero Server Bandwidth & Zero File Storage):
          </p>
          <p className="text-stone-600">
            The website strictly does <strong>NOT</strong> upload, store, process, or host actual video files. Videos are hosted externally on{' '}
            <strong>YouTube</strong> or <strong>Vimeo</strong>. The database only stores metadata and safe embed links. Only thumbnail images are stored on the server.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-[#2A1515]">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, scholar, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder-stone-400 focus:outline-none focus:border-[#C51E28]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#D5C2B5]">
            <Filter className="w-3 h-3 text-stone-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-[#2A1515] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses ({videos.length})</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>

          {/* Provider Filter */}
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#D5C2B5]">
            <Video className="w-3 h-3 text-stone-500" />
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as any)}
              className="bg-transparent text-[#2A1515] focus:outline-none cursor-pointer"
            >
              <option value="all">All Providers</option>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchVideos}
          title="Refresh video catalog"
          className="p-2 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#2A1515] border border-[#D5C2B5] transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Video Management Table */}
      <div className="rounded-2xl border border-[#E8DEC8] bg-[#FFFDF9] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-stone-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#C51E28]" />
            <span className="font-serif">Loading Video Archives from Database...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-red-500" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchVideos}
              className="px-4 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 border border-red-300 text-xs text-red-800 mt-2 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <Video className="w-10 h-10 text-stone-400 mx-auto" />
            <p className="font-serif text-sm">No video records found matching your filters.</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#C51E28] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Video</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2A1515]">
              <thead className="bg-[#FAF6EE] text-[#4A3535] font-serif uppercase tracking-wider text-[10px] border-b border-[#E8DEC8]">
                <tr>
                  <th className="py-3 px-4">Thumbnail</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Topic / Category</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">External Link</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Updated Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DEC8]">
                {filteredVideos.map((video) => {
                  const isYt = video.videoProvider.toLowerCase() === 'youtube';
                  const isVimeo = video.videoProvider.toLowerCase() === 'vimeo';

                  return (
                    <tr
                      key={video.id}
                      className="hover:bg-[#FAF6EE]/70 transition-colors group"
                    >
                      {/* Thumbnail Preview with Play Overlay */}
                      <td className="py-3 px-4 align-top w-28">
                        <div
                          onClick={() => setPreviewVideo(video)}
                          title="Click to preview video playback"
                          className="relative aspect-video w-24 rounded-lg overflow-hidden border border-amber-900/70 bg-stone-900 shadow-sm group/thumb cursor-pointer shrink-0"
                        >
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute('src', '/hero-sanctuary.jpg');
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                            <div className="w-7 h-7 rounded-full bg-[#E88A16] text-[#2D1B14] flex items-center justify-center shadow-lg">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </div>
                          {video.duration && (
                            <span className="absolute bottom-1 right-1 bg-black/80 text-amber-200 text-[9px] px-1 py-0.2 rounded font-mono">
                              {video.duration}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title & Short Description */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <div className="space-y-1">
                          <p className="font-['Cinzel',serif] font-bold text-amber-100 text-sm leading-snug line-clamp-2">
                            {video.title}
                          </p>
                          <p className="text-[11px] text-stone-400 line-clamp-2 font-['Marcellus']">
                            {video.description}
                          </p>
                          {video.instructor && (
                            <span className="inline-block text-[10px] text-[#D4A72C] font-serif">
                              ✦ {video.instructor}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Topic & Category Badges */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div className="space-y-1">
                          {video.topicName ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-700/60 text-amber-300 text-[10px] font-serif">
                              <Compass className="w-2.5 h-2.5" />
                              <span>{video.topicName}</span>
                            </span>
                          ) : (
                            <span className="text-stone-500 text-[10px] italic">No Topic</span>
                          )}
                          <br />
                          {video.categoryName ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2D1B14] border border-amber-900/60 text-stone-300 text-[10px]">
                              <FolderOpen className="w-2.5 h-2.5 text-[#D4A72C]" />
                              <span>{video.categoryName}</span>
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Video Provider Badge */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        {isYt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-950/80 border border-red-700/70 text-red-200 text-[10px] font-bold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span>YouTube</span>
                          </span>
                        ) : isVimeo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-700/70 text-sky-200 text-[10px] font-bold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            <span>Vimeo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[10px]">
                            {video.videoProvider}
                          </span>
                        )}
                      </td>

                      {/* Video Link */}
                      <td className="py-3 px-4 align-top max-w-[140px] truncate">
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D4A72C] hover:text-amber-100 flex items-center gap-1 truncate font-mono text-[10px] underline decoration-amber-600/40"
                          title={video.videoUrl}
                        >
                          <span className="truncate">{video.videoUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        {video.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Published</span>
                          </span>
                        ) : video.status === 'draft' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700 text-[10px] font-bold">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Draft</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px]">
                            <EyeOff className="w-3 h-3 text-stone-500" />
                            <span>Unpublished</span>
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 align-top whitespace-nowrap text-stone-400 font-mono text-[10px]">
                        {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-4 align-top whitespace-nowrap text-stone-400 font-mono text-[10px]">
                        {video.updatedAt ? new Date(video.updatedAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Preview Playback */}
                          <button
                            onClick={() => setPreviewVideo(video)}
                            title="Preview video player"
                            className="p-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 transition-colors cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* 2. Edit */}
                          <button
                            onClick={() => handleOpenEditModal(video)}
                            title="Edit video metadata"
                            className="p-1.5 rounded-lg bg-[#2D1B14] hover:bg-[#3D251C] text-stone-300 hover:text-amber-200 border border-amber-900/60 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Publish / Unpublish */}
                          <button
                            onClick={() => handleToggleStatus(video)}
                            title={video.status === 'published' ? 'Unpublish video' : 'Publish video to public site'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              video.status === 'published'
                                ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700'
                                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-600'
                            }`}
                          >
                            {video.status === 'published' ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* 4. Delete */}
                          <button
                            onClick={() => handleDeleteVideo(video)}
                            title="Delete video record"
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          ADD / EDIT VIDEO MODAL
          Strict Form adhering to specifications:
          1. Video Title
          2. Topic / Category
          3. Video Link (URL input, YouTube/Vimeo validation badge)
          4. Thumbnail Upload (file picker JPG, JPEG, PNG, WebP + image preview)
          5. Short Description
          6. Publication Status (Draft, Published, Unpublished)
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#FAF6EE] border-2 border-[#D5C2B5] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 text-[#2A1515]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
              <div>
                <h3 className="font-['Cinzel',serif] text-xl font-bold text-[#2A1515] flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#C51E28]" />
                  <span>{editingVideo ? 'Edit Video Metadata' : 'Add New Video'}</span>
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Host your video on YouTube or Vimeo, and paste the external URL below.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
              {/* 1. Video Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-stone-700 flex items-center justify-between">
                  <span>1. Video Title *</span>
                  <span className="text-[10px] text-stone-500 font-sans">e.g. Understanding the Five Elements in Vaastu</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Understanding the Five Elements in Vaastu"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder-stone-400 focus:outline-none focus:border-[#C51E28] text-sm"
                />
              </div>

              {/* 2. Topic & Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Topic Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-serif font-bold text-stone-700 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#C51E28]" />
                    <span>2. Topic (Gyan Kosh Entity)</span>
                  </label>
                  <select
                    value={formData.topicId}
                    onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] focus:outline-none focus:border-[#C51E28] text-xs cursor-pointer"
                  >
                    <option value="">-- Select Canonical Topic --</option>
                    {topicsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (/topic/{t.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-serif font-bold text-stone-700 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-[#167A68]" />
                    <span>Category</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] focus:outline-none focus:border-[#C51E28] text-xs cursor-pointer"
                  >
                    <option value="">-- Select Category --</option>
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Video Link Input with Real-Time Validation & Provider Detection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-serif font-bold text-stone-700">
                    3. Video Link (External URL) *
                  </label>
                  {/* Provider Recognition Badge */}
                  {urlValidation.valid ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{urlValidation.provider === 'youtube' ? 'YouTube Identified ✓' : 'Vimeo Identified ✓'}</span>
                    </span>
                  ) : formData.videoUrl.trim() ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-50 border border-red-300 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      <span>Unsupported link format</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500">YouTube or Vimeo link</span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX or https://vimeo.com/XXXXXXXX"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-[#2A1515] placeholder-stone-400 focus:outline-none text-sm font-mono ${
                      urlValidation.valid
                        ? 'border-emerald-600'
                        : formData.videoUrl.trim()
                        ? 'border-red-600'
                        : 'border-[#D5C2B5] focus:border-[#C51E28]'
                    }`}
                  />
                </div>

                {urlValidation.error && formData.videoUrl.trim() && (
                  <p className="text-[11px] text-red-600 font-serif">{urlValidation.error}</p>
                )}

                {/* Optional Live Video Preview if URL is valid */}
                {urlValidation.valid && urlValidation.embedUrl && (
                  <div className="mt-3 p-3 rounded-2xl bg-white border border-[#E8DEC8] space-y-2 shadow-xs">
                    <p className="text-[11px] font-serif text-[#C51E28] font-bold flex items-center gap-1">
                      <Play className="w-3 h-3 text-[#C51E28]" />
                      <span>Live Video Confirmation Preview:</span>
                    </p>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#E8DEC8] shadow-inner">
                      <iframe
                        src={urlValidation.embedUrl}
                        title="Video Preview"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Thumbnail Upload with Preview (JPG, JPEG, PNG, WebP) */}
              <div className="space-y-2 p-4 rounded-2xl bg-white border border-[#E8DEC8] shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-serif font-bold text-stone-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#C51E28]" />
                    <span>4. Thumbnail Upload *</span>
                  </label>
                  <span className="text-[10px] text-stone-500 font-mono">
                    Supported: JPG, JPEG, PNG, WebP (&lt;5MB)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail Preview Box */}
                  <div className="relative aspect-video w-44 rounded-xl overflow-hidden bg-[#FAF6EE] border-2 border-dashed border-[#D5C2B5] flex items-center justify-center shrink-0 shadow-xs">
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-cover"
                        onError={() => setThumbnailPreview('/hero-sanctuary.jpg')}
                      />
                    ) : (
                      <div className="text-center p-2 text-stone-500">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">No Thumbnail</span>
                      </div>
                    )}
                    {isUploadingThumbnail && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button & URL Field */}
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailFileSelect}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingThumbnail}
                      className="w-full py-2 px-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F2E7D5] border border-[#D5C2B5] text-[#2A1515] text-xs font-serif font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#C51E28]" />
                      <span>{isUploadingThumbnail ? 'Uploading Image...' : 'Upload Image from Computer'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider">or Image URL:</span>
                      <input
                        type="text"
                        value={formData.thumbnailUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, thumbnailUrl: e.target.value });
                          setThumbnailPreview(e.target.value);
                        }}
                        placeholder="/hero-sanctuary.jpg or https://..."
                        className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-[#D5C2B5] text-[#2A1515] text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Short Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-stone-700">
                  5. Short Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Learn how the five elements influence the energy and balance of a space according to traditional Vaastu principles."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] placeholder-stone-400 focus:outline-none focus:border-[#C51E28] text-xs font-['Marcellus'] leading-relaxed"
                />
              </div>

              {/* 6. Publication Status & Metadata (Duration, Scholar) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-serif font-bold text-stone-700">
                    6. Publication Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] focus:outline-none focus:border-[#C51E28] text-xs cursor-pointer font-bold"
                  >
                    <option value="published">🟢 Published (Live on Site)</option>
                    <option value="draft">🟡 Draft (Admin Only)</option>
                    <option value="unpublished">⚪ Unpublished (Hidden)</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-xs font-serif text-stone-700">
                    Duration (e.g. 28:40)
                  </label>
                  <input
                    type="text"
                    placeholder="28:40"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] text-xs font-mono"
                  />
                </div>

                {/* Instructor / Scholar */}
                <div className="space-y-1">
                  <label className="text-xs font-serif text-stone-700">
                    Scholar / Speaker
                  </label>
                  <input
                    type="text"
                    placeholder="Vastu Ritam Fellowship"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8DEC8]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-serif transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitForm('draft')}
                  className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-serif font-bold transition-all cursor-pointer"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitForm('published')}
                  className="px-6 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{editingVideo ? 'Update Video Record' : 'Save & Publish Video'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIDEO PLAYBACK PREVIEW MODAL
          Uses safe official YouTube/Vimeo embed without downloading video file
          ========================================================================= */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-[#FAF6EE] border-2 border-[#D5C2B5] rounded-3xl shadow-2xl overflow-hidden space-y-4 p-6 text-[#2A1515]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <div>
                <span className="text-[10px] font-serif uppercase tracking-wider text-[#C51E28] font-bold">
                  Scholarly Video Player Preview · {previewVideo.videoProvider.toUpperCase()}
                </span>
                <h3 className="font-['Cinzel',serif] text-lg font-bold text-[#2A1515]">
                  {previewVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Iframe Player */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-[#D5C2B5]">
              {previewVideo.embedUrl ? (
                <iframe
                  src={previewVideo.embedUrl}
                  title={previewVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                  <p className="text-sm font-serif">Could not generate embed player for this video link.</p>
                  <a
                    href={previewVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#D4A72C] underline flex items-center gap-1"
                  >
                    <span>Open directly on {previewVideo.videoProvider}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Details Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-stone-400">
              <div className="space-y-0.5">
                <p className="text-stone-300 font-serif">{previewVideo.description}</p>
                {previewVideo.instructor && (
                  <p className="text-[11px] text-[#D4A72C]">✦ {previewVideo.instructor}</p>
                )}
              </div>
              <a
                href={previewVideo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#2D1B14] hover:bg-[#3D251C] text-[#D4A72C] hover:text-amber-100 border border-amber-900/80 flex items-center gap-1.5 font-serif transition-colors"
              >
                <span>Watch on {previewVideo.videoProvider}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
