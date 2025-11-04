'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Link,
  Chip,
} from '@nextui-org/react';
import DOMPurify from 'isomorphic-dompurify';

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

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ 
  article, 
  isOpen, 
  onClose 
}) => {
  if (!article) return null;

  // Sanitize HTML content for security
  const sanitizedContent = DOMPurify.sanitize(article.content);

  // Format date nicely
  const formattedDate = new Date(article.publication_date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="3xl" 
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        wrapper: "!overflow-x-hidden", // Prevent horizontal scroll only
        backdrop: "bg-black/50", // Fix transparent background
        body: "py-6 overflow-y-auto overflow-x-hidden", // Vertical scroll, no horizontal
      }}
      backdrop="blur" // Adds nice blur effect to background
    >
      <ModalContent className="bg-white"> 
        {(closeModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1 bg-white border-b">
              <h2 className="text-2xl font-bold text-gray-900">{article.title}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <time className="text-sm text-gray-500" dateTime={article.publication_date}>
                  {formattedDate}
                </time>
                {article.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {article.tags.map((tag) => (
                      <Chip key={tag.slug} size="sm" variant="flat" color="primary">
                        {tag.name}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </ModalHeader>

            <ModalBody className="bg-white overflow-y-auto overflow-x-hidden">
              {/* Display main image if available */}
              {article.main_image && (
                <img 
                  src={article.main_image} 
                  alt={article.title}
                  className="w-full h-auto rounded-lg mb-6 object-cover max-h-96"
                />
              )}

              {/* Render sanitized HTML content */}
              <div
                className="prose prose-slate lg:prose-lg w-full max-w-full
                  prose-headings:font-bold prose-a:text-primary 
                  prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full prose-img:w-full prose-img:h-auto
                  prose-table:w-full prose-table:max-w-full prose-table:overflow-x-auto prose-table:block
                  prose-pre:max-w-full prose-pre:overflow-x-auto
                  [&_*]:max-w-full [&>*]:max-w-full
                  break-words"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </ModalBody>

            <ModalFooter className="gap-2 bg-white border-t">
              {article.external_link && (
                <Button 
                  as={Link} 
                  href={article.external_link} 
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  variant="flat"
                  isExternal
                >
                  View Original Post
                </Button>
              )}
              <Button 
                color="danger" 
                variant="light" 
                onPress={closeModal}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};