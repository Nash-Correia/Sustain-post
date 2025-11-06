'use client';

import React from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Link, Chip,
} from '@nextui-org/react';
import DOMPurify from 'isomorphic-dompurify';

interface Article {
  id: number; title: string; slug: string; publication_date: string;
  content: string; tags: { name: string; slug: string }[];
  external_link?: string; main_image?: string | null;
}
interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, isOpen, onClose }) => {
  if (!article) return null;

  const sanitized = DOMPurify.sanitize(article.content);
  const formattedDate = new Date(article.publication_date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const fullImage =
    article.main_image && (article.main_image.startsWith('http')
      ? article.main_image
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api${article.main_image}`);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: 'max-h-[90vh]',
        body: 'overflow-y-auto overflow-x-hidden',
        wrapper: '!overflow-x-hidden',
        backdrop: 'bg-black/50',
      }}
    >
      <ModalContent className="bg-white">
        {(close) => (
          <>
            <ModalHeader className="flex flex-col gap-2 border-b bg-white">
              <h2 className="text-2xl font-bold text-gray-900">{article.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <time className="text-sm text-gray-500" dateTime={article.publication_date}>
                  {formattedDate}
                </time>
                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((t) => (
                      <Chip key={t.slug} size="sm" variant="flat" color="primary">
                        {t.name}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </ModalHeader>

            <ModalBody className="bg-white">
              {fullImage && (
                <img
                  src={fullImage}
                  alt={article.title}
                  className="mb-6 max-h-[380px] w-full rounded-lg object-cover"
                />
              )}
              <div
                className="
                  prose prose-slate lg:prose-lg max-w-none break-words
                  prose-a:text-primary prose-headings:font-semibold
                  prose-img:rounded-lg prose-img:shadow-md
                "
                dangerouslySetInnerHTML={{ __html: sanitized }}
              />
            </ModalBody>

            <ModalFooter className="border-t bg-white">
              {article.external_link && (
                <Button
                  as={Link}
                  href={article.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  variant="flat"
                >
                  View original post
                </Button>
              )}
              <Button color="default" variant="light" onPress={close}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
