'use client';

import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Image } from '@nextui-org/react';

// Define the Article interface
interface Article {
  id: number;
  title: string;
  slug: string;
  publication_date: string;
  content: string;
  tags: { name: string; slug: string }[];
  external_link?: string;
  main_image?: string | null; // <-- Added image
}

interface ArticleCardProps {
  article: Article;
  onReadMore: (article: Article) => void; // <-- Function to open modal
}

// Helper function to create a plain-text snippet
function createSnippet(htmlContent: string, length = 100) {
  if (!htmlContent) return '';
  const text = htmlContent.replace(/<[^>]+>/g, ''); // Strip HTML tags
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore }) => {
  // Construct the full image URL
  // Checks if the image URL is already a full URL or just a path
  const imageUrl = article.main_image 
    ? (article.main_image.startsWith('http') ? article.main_image : `${process.env.NEXT_PUBLIC_API_BASE_URL}${article.main_image}`)
    : 'https://placehold.co/600x400/EEE/313131?text=IiAS'; // Placeholder

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-0">
        <Image
          isZoomed
          alt={article.title}
          className="object-cover w-full h-[200px]"
          src={imageUrl}
          width="100%"
        />
      </CardHeader>
      <CardBody className="flex-grow p-4">
        <p className="text-sm text-gray-500 mb-1">{article.publication_date}</p>
        <h3 className="text-lg font-bold mb-2 line-clamp-2 h-[3.2em]">{article.title}</h3>
        <p className="text-sm text-gray-700 line-clamp-3 h-[4.5em]">
          {createSnippet(article.content, 120)}
        </p>
      </CardBody>
      <CardFooter className="p-4">
        <Button 
          color="primary" 
          variant="ghost" 
          onPress={() => onReadMore(article)} // <-- Opens the modal
        >
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
};