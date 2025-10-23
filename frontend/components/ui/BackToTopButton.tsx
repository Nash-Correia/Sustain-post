"use client";

import { useEffect, useState } from 'react';
import { clsx } from '@/lib/utils';

// Reusable Arrow Up Icon
const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m5 12 7-7 7 7"/>
        <path d="M12 19V5"/>
    </svg>
);

export default function BackToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled up to a certain amount
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the top cordinate to 0
    // make scrolling smooth
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={clsx(
                'fixed bottom-8 right-8 z-50 p-3 rounded-full bg-teal-800 text-white shadow-lg hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition-all duration-300',
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            )}
            aria-label="Go to top"
        >
            <ArrowUpIcon className="h-6 w-6" />
        </button>
    );
}