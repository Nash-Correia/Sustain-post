'use client';

import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Image, Chip } from '@nextui-org/react';

interface Article {
  id: number;
  title: string;
  slug: string;
  publication_date: string;
  content: string;
  tags: { name: string; slug: string }[];
  external_link?: string;
  main_image?: string | null;
}
interface ArticleCardProps {
  article: Article;
  onReadMore: (article: Article) => void;
}

function createSnippet(html: string, length = 120) {
  const text = (html || '').replace(/<[^>]+>/g, '').trim();
  return text.length <= length ? text : `${text.slice(0, length)}…`;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore }) => {
  const imageUrl = article.main_image
    ? (article.main_image.startsWith('http')
        ? article.main_image
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api${article.main_image}`)
    : 'https://placehold.co/800x450/EEF2F7/475569?text=IiAS';

  const date = new Date(article.publication_date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <Card
      className="
        group h-full overflow-hidden border border-gray-200 shadow-sm
        transition hover:-translate-y-0.5 hover:shadow-md
        rounded-2xl
      "
    >
      <CardHeader className="p-0">
        <Image
          isZoomed
          alt={article.title}
          src={imageUrl}
          radius="none"
          className="h-[200px] w-full object-cover"
        />
      </CardHeader>

      <CardBody className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <time className="text-xs text-gray-500">{date}</time>
          <div className="flex flex-wrap gap-1">
            {article.tags?.slice(0, 2).map((t) => (
              <Chip key={t.slug} size="sm" variant="flat" color="primary">
                {t.name}
              </Chip>
            ))}
          </div>
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900">
          {article.title}
        </h3>
        <p className="line-clamp-3 text-sm text-gray-700">
          {createSnippet(article.content, 140)}
        </p>
      </CardBody>

      <CardFooter className="p-4 pt-0">
        <Button
          color="primary"
          variant="ghost"
          className="w-full"
          onPress={() => onReadMore(article)}
        >
          Read more
        </Button>
      </CardFooter>
    </Card>
  );
};
