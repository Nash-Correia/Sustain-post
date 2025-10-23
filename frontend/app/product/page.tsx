// app/product/page.tsx
import type { Metadata } from 'next'
import { baseMetadata } from '@/lib/seo'
import ProductCard from '@/components/product/ProductCard'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export const metadata: Metadata = baseMetadata({
  title: 'Products — IiAS Sustain',
  description: 'Explore our ESG research and stewardship products.',
  path: '/product',
})

// SVG Icon for Comparison Tool
// SVG Icon for Comparison Tool (inspired by the image)
const ComparisonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    {/* Balance Scale */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2zM9 14h6m-6 4h6m-7.243-8.243A4 4 0 0110.5 5.5M13.5 5.5a4 4 0 013.743 4.257m-4.243 0l-1.5 1.5m1.5-1.5l1.5 1.5M10.5 9.5a.5.5 0 11-1 0 .5.5 0 011 0zm3 0a.5.5 0 11-1 0 .5.5 0 011 0zM12 21v-7a1 1 0 011-1h2.5a1 1 0 011 1v7M12 21v-7a1 1 0 00-1-1H8.5a1 1 0 00-1 1v7" />
    {/* Bar Chart (simplified) */}
    <rect x="17" y="10" width="2" height="7" rx="0.5" fill="currentColor" opacity="0.4" />
    <rect x="20" y="7" width="2" height="10" rx="0.5" fill="currentColor" opacity="0.6" />
    <rect x="14" y="13" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.2" />
    {/* Magnifying Glass (simplified) */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l-3 3m0 0l-3-3m3 3V3" />
  </svg>
);

// SVG Icon for Reports
// SVG Icon for Reports (inspired by the image)
const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    {/* Document icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    {/* Small bar chart on the side for 'ratings' */}
    <rect x="16" y="10" width="1.5" height="5" rx="0.5" fill="currentColor" opacity="0.4" />
    <rect x="18.5" y="7" width="1.5" height="8" rx="0.5" fill="currentColor" opacity="0.6" />
    <rect x="13.5" y="13" width="1.5" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
    {/* ESG Badge - text only for simplicity in SVG, or a circle with a check */}
    <circle cx="7" cy="17" r="3" stroke="currentColor" fill="none" />
    <text x="7" y="17.7" textAnchor="middle" fontSize="4" fill="currentColor" fontFamily="sans-serif">ESG</text>
  </svg>
);


export default function ProductHubPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex items-end justify-between">
        <h1 className="text-3xl font-semibold text-brand-800">Our Products</h1>
        <Link href={ROUTES.home} className="text-sm text-brand-700 hover:underline">Back to Home</Link>
      </header>
      <p className="mt-3 text-gray-600 max-w-2xl">Choose a product to learn about features, methodology alignment, and workflows.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <ProductCard
          title="ESG Rating Comparison"
          href={ROUTES.productA}
          icon={<ComparisonIcon />}
        >
          An interactive tool to compare the Environmental, Social, and Governance (ESG) performance of companies, mutual funds, and sectors. Build custom lists for detailed, side-by-side analysis.
        </ProductCard>
        <ProductCard
          title="Company ESG Ratings"
          href={ROUTES.productB}
          icon={<ReportIcon />}
        >
          Access our comprehensive ESG ratings for Indian companies. Filter and sort by company, sector, or rating to gain insights into corporate sustainability and download reports.
        </ProductCard>
      </div>
    </div>
  )
}