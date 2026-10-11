import React, { useEffect, useState } from 'react';
import { Sparkles, Search, Layers, Compass, ArrowRight } from 'lucide-react';
import { FolioReveal } from './FolioReveal';
import { AdBanner } from './AdBanner';

interface TopicItem {
  id: number;
  name: string;
  slug: string;
  sanskritName: string | null;
  entityType: string;
  summary: string;
  imageUrl: string | null;
}

interface TopicsListProps {
  onNavigate: (path: string) => void;
}

export const TopicsList: React.FC<TopicsListProps> = ({ onNavigate }) => {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadTopics() {
      try {
        setLoading(true);
        const res = await fetch('/api/topics');
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics || []);
        }
      } catch (err) {
        console.error('Failed to load topics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
    document.title = 'Canonical Topics & Vedic Entities | Vastu Ritam';
  }, []);

  const filterTypes = [
    { id: 'all', label: 'All Canonical Entities' },
    { id: 'deity', label: 'Cosmic Deities (Devatas)' },
    { id: 'energy_zone', label: 'Energy Zones & Padas' },
    { id: 'concept', label: 'Metaphysical Principles' },
    { id: 'shastra', label: 'Ancient Treatises' },
  ];

  const filteredTopics = topics.filter((t) => {
    const matchesType = selectedType === 'all' || t.entityType === selectedType;
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.sanskritName && t.sanskritName.includes(searchQuery)) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#EDE0C8] text-[#22160D] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <FolioReveal>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-serif uppercase tracking-widest text-amber-800 font-bold bg-amber-200/80 px-3 py-1 rounded-full border border-amber-400">
              Vedic Ontological Knowledgebase
            </span>
            <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl font-black text-[#1A0F0A] mt-4 mb-4">
              Canonical Entities & Shastric Topics
            </h1>
            <p className="font-['Marcellus'] text-sm sm:text-base text-stone-700 leading-relaxed">
              Explore the structured cosmic entities, devatas, energy padas, and metaphysical principles presiding over sacred Vedic architecture—persisted directly in PostgreSQL.
            </p>
          </div>
        </FolioReveal>

        {/* Ad Banner */}
        <div className="mb-10">
          <AdBanner placement="HEADER" />
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#FAF4E6] border border-amber-300 shadow-sm mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search entities by English name, Devanagari Sanskrit or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-amber-50/80 border border-amber-300 text-stone-900 placeholder:text-stone-500 font-serif text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-200">
            {filterTypes.map((ft) => (
              <button
                key={ft.id}
                onClick={() => setSelectedType(ft.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                  selectedType === ft.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-100/70 hover:bg-amber-200 text-amber-950'
                }`}
              >
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-['Cinzel'] text-amber-900">Querying PostgreSQL Entity Matrix...</p>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF4E6] rounded-3xl border border-amber-300 p-8">
            <Compass className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="font-['Cinzel'] text-lg font-bold text-stone-800">No Matching Entities</h3>
            <p className="font-['Marcellus'] text-xs text-stone-600 mt-1">Try refining your search keyword or classification filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((top) => (
              <div
                key={top.id}
                onClick={() => onNavigate(`/topic/${top.slug}`)}
                className="p-6 rounded-3xl bg-[#FAF4E6] border border-amber-300 shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] uppercase font-serif tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950">
                      {top.entityType.replace('_', ' ')}
                    </span>
                    {top.sanskritName && (
                      <span className="font-['Rozha_One'] text-lg text-amber-800">
                        {top.sanskritName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-['Cinzel',serif] text-xl font-bold text-stone-950 group-hover:text-amber-800 transition-colors mb-2">
                    {top.name}
                  </h3>

                  <p className="font-['Marcellus'] text-xs text-stone-700 leading-relaxed line-clamp-3 mb-4">
                    {top.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-200 flex items-center justify-between text-xs font-serif font-bold text-amber-900">
                  <span className="font-mono text-[11px] text-stone-500">/topic/{top.slug}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Entity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
