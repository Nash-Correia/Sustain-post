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
} from '@nextui-org/react';

// Define the Article interface
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

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, isOpen, onClose }) => {
  if (!article) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-2xl font-bold">
              {article.title}
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-500 mb-4">{article.publication_date}</p>
              {/* Render the full HTML content */}
              <div
                className="prose lg:prose-xl max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </ModalBody>
            <ModalFooter>
              {article.external_link && (
                <Button 
                  as={Link} 
                  href={article.external_link} 
                  target="_blank" 
                  color="primary"
                >
                  View Original Post
                </Button>
              )}
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};