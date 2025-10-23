// app/page.tsx

import type { Metadata } from 'next'
import { baseMetadata } from '@/lib/seo'
import LandingPageClient from '@/components/LandingPageClient'

export const metadata: Metadata = baseMetadata({
  title: 'IiAS Sustain',
  description: 'Evidence‑based ratings, stewardship advisory, and research.',
  path: '/',
});

export default function Page(){
  return <LandingPageClient />;
}