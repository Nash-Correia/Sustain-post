"use client";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface InsightCardProps {
  title: string;
  imageUrl?: string;
  onReadMore?: () => void;
}

const InsightCard = ({ title, imageUrl, onReadMore }: InsightCardProps) => (
  <motion.article
    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm h-full flex flex-col"
    whileHover={{ y: -5, boxShadow: "0 15px 25px rgba(0,0,0,0.1)" }}
    transition={{ type: "spring", stiffness: 120, damping: 15 }}
  >
    <div className="aspect-video relative bg-gray-200">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <span>No image available</span>
        </div>
      )}
    </div>
    <div className="p-5 flex-1 flex flex-col justify-between">
      <h3 className="text-lg font-semibold text-brand-dark mb-4">{title}</h3>
      <div className="text-left">
        <button
          type="button"
          className="text-[14px] font-medium text-[#1D7AEA] hover:underline"
          onClick={onReadMore}
          aria-label={`Read more about ${title}`}
        >
          Read More
        </button>
      </div>
    </div>
  </motion.article>
);

const ArrowIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function Insights() {
  const items = useMemo(
    () => [
      { title: "SEBI's New Disclosure Norms" },
      { title: "The Rise of ESG in India" },
      { title: "Proxy Advisory Trends 2025" },
      { title: "Corporate Governance in Nifty 50" },
      { title: "Another Insight Headline" },
      { title: "Digital Transformation in Finance" },
      { title: "Sustainable Investment Strategies" },
      { title: "AI in Financial Analysis" },
    ],
    []
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, _setIsAutoScrolling] = useState(true); // setter not used => prefix with _
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cardWidth = 320;
  const gap = 24;
  const oneStep = cardWidth + gap;
  const itemsWidth = oneStep * items.length;

  const autoScroll = useCallback(() => {
    if (!scrollContainerRef.current || !isAutoScrolling) return;
    const container = scrollContainerRef.current;
    container.scrollBy({ left: oneStep, behavior: "smooth" });

    setTimeout(() => {
      if (!container) return;
      const { scrollLeft } = container;
      if (scrollLeft >= itemsWidth) {
        container.style.scrollBehavior = "auto";
        container.scrollLeft = 0;
        setTimeout(() => {
          container.style.scrollBehavior = "smooth";
        }, 50);
      }
    }, 300);
  }, [isAutoScrolling, itemsWidth, oneStep]);

  const startAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    autoScrollIntervalRef.current = setInterval(autoScroll, 2000);
  }, [autoScroll]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const container = scrollContainerRef.current;
      if (!container) return;

      container.scrollBy({
        left: direction === "left" ? -oneStep : oneStep,
        behavior: "smooth",
      });

      setTimeout(() => {
        const { scrollLeft } = container;
        if (direction === "right" && scrollLeft >= itemsWidth) {
          container.style.scrollBehavior = "auto";
          container.scrollLeft = 0;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
          }, 50);
        } else if (direction === "left" && scrollLeft <= 0) {
          container.style.scrollBehavior = "auto";
          container.scrollLeft = itemsWidth;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
          }, 50);
        }
      }, 300);
    },
    [itemsWidth, oneStep]
  );

  useEffect(() => {
    if (isAutoScrolling) startAutoScroll();
    return () => stopAutoScroll();
  }, [isAutoScrolling, startAutoScroll, stopAutoScroll]);

  const handleMouseEnter = () => stopAutoScroll();
  const handleMouseLeave = () => {
    if (isAutoScrolling) startAutoScroll();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const springTransition = { type: "spring" as const, stiffness: 120, damping: 15 };

  return (
    <section id="insights" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-brand-dark">Latest News and Insights</h2>
      </div>

      <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Left */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full border border-gray-300 bg-white shadow-md grid place-items-center transition-all duration-200 transform rotate-180 text-gray-600 hover:bg-gray-50 hover:border-gray-400 cursor-pointer hover:shadow-lg"
          aria-label="Scroll insights left"
          title="Scroll left"
        >
          <ArrowIcon className="h-6 w-6" />
        </button>

        {/* Right */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full border border-gray-300 bg-white shadow-md grid place-items-center transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:border-gray-400 cursor-pointer hover:shadow-lg"
          aria-label="Scroll insights right"
          title="Scroll right"
        >
          <ArrowIcon className="h-6 w-6" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 pb-4 -mb-4 overflow-x-auto scroll-smooth px-[calc((100%-960px)/2)]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {[...items, ...items, ...items].map((item, index) => (
            <motion.div
              key={`${item.title}-${index}`}
              className="flex-shrink-0 w-[320px]"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ ...springTransition, delay: (index % items.length) * 0.1 }}
            >
              <InsightCard
                title={item.title}
                onReadMore={() => console.log(`Reading: ${item.title}`)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};