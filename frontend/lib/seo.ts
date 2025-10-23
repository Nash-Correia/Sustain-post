import type { Metadata } from 'next'


export function baseMetadata({
title,
description,
path = '/',
}: { title: string; description: string; path?: string }): Metadata {
const url = `https://www.iias.in${path}` // TODO: set final hostname
return {
title,
description,
metadataBase: new URL('https://www.iias.in'),
alternates: { canonical: url },
openGraph: {
title,
description,
url,
siteName: 'IiAS Sustain',
type: 'website',
},
twitter: {
card: 'summary_large_image',
title,
description,
},
}
}