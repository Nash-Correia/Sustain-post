'use client'; 

import { useState, useEffect } from 'react';
// Make sure this path is correct for your project
import { ArticleCard } from '@/components/institutional-eye/ArticleCard';
import { ArticleModal } from '@/components/institutional-eye/ArticleModal';
import {
  Button,
  Select,
  SelectItem,
  useDisclosure, // <-- Import modal controller
  Spinner, // <-- Import Spinner
} from '@nextui-org/react';

// --- Interfaces ---
interface Tag {
  name: string;
  slug: string;
}
interface Article {
  id: number;
  title: string;
  slug: string;
  publication_date: string;
  content: string;
  tags: Tag[];
  external_link?: string;
  main_image?: string | null; // <-- Added image
}
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Article[];
}

// --- Main Page Component ---
export default function InstitutionalEyePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  // --- Modal State ---
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const years = ["2025", "2024", "2023", "2022"]; 

  async function getArticles() {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('category', 'INSTITUTIONAL_EYE');
    if (selectedYear) params.append('publication_date__year', selectedYear);
    if (selectedTag) params.append('tags__slug', selectedTag);

    // Make sure to use the correct environment variable from your .env.local
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/?${params.toString()}`);
    
    if (!res.ok) {
      console.error('Failed to fetch articles');
      setLoading(false);
      return;
    }
    
    const data: PaginatedResponse = await res.json();
    setArticles(data.results); 
    setLoading(false);
  }

  async function getTags() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tags/`);
      const data = await res.json();
      setTags(data.results || data); // Handle paginated or non-paginated tags
    } catch (e) {
      console.error("Failed to fetch tags", e);
    }
  }

  // Load tags once on page load
  useEffect(() => { getTags(); }, []);
  
  // Load articles when page loads or filters change
  useEffect(() => { getArticles(); }, [selectedYear, selectedTag]);

  const handleClearFilters = () => {
    setSelectedYear("");
    setSelectedTag("");
  };

  // --- Function to open the modal ---
  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
    onOpen();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
        Specials
      </h1>
      <p className="text-lg text-gray-600 mb-8 border-b pb-8">
        Our blogs and commentary on governance and ESG
      </p>

      {/* --- FILTER UI (Same as before) --- */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <Select
          label="Year"
          placeholder="Select a year"
          className="max-w-xs"
          selectedKeys={selectedYear ? [selectedYear] : []}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
        </Select>
        <Select
          label="Category (Tag)"
          placeholder="Select a category"
          className="max-w-xs"
          selectedKeys={selectedTag ? [selectedTag] : []}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          {tags.map(tag => <SelectItem key={tag.slug} value={tag.slug}>{tag.name}</SelectItem>)}
        </Select>
        <Button onClick={handleClearFilters} variant="flat">
          Clear Filters
        </Button>
      </div>

      {/* --- UPDATED ARTICLE GRID --- */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner label="Loading articles..." color="primary" />
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onReadMore={handleReadMore} // <-- Pass the function
              />
            ))}
          </div>
        ) : (
          <p>No articles found for the selected filters.</p>
        )}
      </div>

      {/* --- ADD THE MODAL COMPONENT --- */}
      <ArticleModal 
        article={selectedArticle} 
        isOpen={isOpen} 
        onClose={onClose} 
      />
    </main>
  );
}