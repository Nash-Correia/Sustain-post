import Image from "next/image";

interface InsightCardProps {
  title: string;
  imageUrl?: string;
  link?: string; // Add link prop
  onReadMore?: () => void;
}

export default function InsightCard({
  title,
  imageUrl,
  link,
  onReadMore,
}: InsightCardProps) {
  const handleReadMore = () => {
    if (link) {
      // If link is provided, open it in new tab
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (onReadMore) {
      // Otherwise use the callback
      onReadMore();
    }
  };

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm h-full flex flex-col">
      {/* Image section */}
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
      
      {/* Content section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <h3 className="text-lg font-semibold text-brand-dark mb-4">{title}</h3>
        
        {/* Read More button */}
        <div className="text-left">
          <button
            type="button"
            className="text-[14px] font-medium text-[#1D7AEA] hover:underline"
            onClick={handleReadMore}
            aria-label={`Read more about ${title}`}
          >
            Read More
          </button>
        </div>
      </div>
    </article>
  );
}