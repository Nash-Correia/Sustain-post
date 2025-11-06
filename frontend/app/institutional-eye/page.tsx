'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArticleCard } from '@/components/institutional-eye/ArticleCard';
import { ArticleModal } from '@/components/institutional-eye/ArticleModal';
import {
  Button,
  Select,
  SelectItem,
  useDisclosure,
  Spinner,
  Skeleton,
} from '@nextui-org/react';

interface Tag { name: string; slug: string; }
interface Article {
  id: number; title: string; slug: string;
  publication_date: string; content: string;
  tags: Tag[]; external_link?: string; main_image?: string | null;
}
interface PaginatedResponse {
  count: number; next: string | null; previous: string | null; results: Article[];
}

export default function InstitutionalEyePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const years = useMemo(() => ['2025', '2024', '2023', '2022'], []);

  async function getArticles() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.append('category', 'INSTITUTIONAL_EYE');
    if (selectedYear) params.append('publication_date__year', selectedYear);
    if (selectedTag) params.append('tags__slug', selectedTag);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/?${params.toString()}`
      );
      if (!res.ok) throw new Error('Failed to fetch articles');
      const data: PaginatedResponse = await res.json();
      setArticles(data.results);
    } catch (e) {
      setError('Could not load articles. Please try again.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function getTags() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tags/`);
      const data = await res.json();
      setTags(data.results || data);
    } catch {
      // soft-fail; tags just won’t show
    }
  }

  useEffect(() => { void getTags(); }, []);
  useEffect(() => { void getArticles(); }, [selectedYear, selectedTag]);

  const handleClearFilters = () => {
    setSelectedYear('');
    setSelectedTag('');
  };

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
    onOpen();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Institutional Eye
        </h1>
        <p className="mt-2 text-base md:text-lg text-gray-600">
          Our commentary on governance and ESG.
        </p>
      </header>

      {/* Sticky Filter Bar */}
      <section
        className="
          sticky top-0 z-20 mb-8
          rounded-xl border border-gray-200 bg-white/70 backdrop-blur
          px-4 py-3 shadow-sm
        "
      >
        <div className="flex flex-wrap items-center gap-3">
          <Select
            label="Year"
            placeholder="All years"
            className="max-w-[220px]"
            selectedKeys={selectedYear ? [selectedYear] : []}
            onChange={(e) => setSelectedYear(e.target.value)}
            size="sm"
            variant="bordered"
          >
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </Select>

          <Select
            label="Category"
            placeholder="All categories"
            className="max-w-[260px]"
            selectedKeys={selectedTag ? [selectedTag] : []}
            onChange={(e) => setSelectedTag(e.target.value)}
            size="sm"
            variant="bordered"
          >
            {tags.map((t) => (
              <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
            ))}
          </Select>

          <Button size="sm" variant="flat" onClick={handleClearFilters}>
            Clear filters
          </Button>

          <div className="ml-auto hidden md:block text-sm text-gray-500">
            {loading ? 'Loading…' : `${articles.length} result${articles.length === 1 ? '' : 's'}`}
          </div>
        </div>
      </section>

      {/* Content */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : articles.length > 0 ? (
        <div
          className="
            grid gap-6
            grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          "
        >
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} onReadMore={handleReadMore} />
          ))}
        </div>
      ) : (
        <EmptyState onReset={handleClearFilters} />
      )}

      {/* Modal */}
      <ArticleModal article={selectedArticle} isOpen={isOpen} onClose={onClose} />
    </main>
  );
}

/* --- Small helpers --- */

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-0 shadow-sm">
          <Skeleton className="h-[200px] w-full rounded-t-xl" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-2/5 rounded" />
            <Skeleton className="h-6 w-4/5 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gray-100 p-3">
        <svg viewBox="0 0 24 24" className="h-full w-full text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No articles found</h3>
      <p className="mt-1 text-gray-600">Try adjusting the filters or reset to see all posts.</p>
      <Button className="mt-4" variant="flat" onPress={onReset}>
        Reset filters
      </Button>
    </div>
  );
}
