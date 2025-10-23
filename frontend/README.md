```
sustain-frontend/
├─ app/
│  ├─ page.tsx                 # Landing page
│  ├─ globals.css              # Tailwind base/components/utilities
│  ├─ layout.tsx               # Shell: header/footer + fonts + metadata
│  ├─ product/
│  │  ├─ page.tsx              # Product hub
│  │  ├─ a/page.tsx            # Product A
│  │  └─ b/page.tsx            # Product B
│  ├─ methodology/page.tsx
│  └─ about/page.tsx
│
├─ components/
│  ├─ nav/
│  │  ├─ Header.tsx            # Logo + Product dropdown + Methodology + About + Login dropdown
│  │  └─ MobileMenu.tsx
│  ├─ ui/                      # Small, dependency-free primitives
│  │  ├─ Button.tsx
│  │  ├─ Card.tsx
│  │  ├─ Input.tsx
│  │  ├─ Textarea.tsx
│  │  ├─ Select.tsx
│  │  └─ Badge.tsx
│  ├─ Hero.tsx
│  ├─ StatsGrid.tsx
│  ├─ InsightCard.tsx
│  ├─ ContactForm.tsx
│  ├─ Footer.tsx
|  └─NewsletterForm.tsx
|   
│
├─ lib/
│  ├─ utils.ts                 # clsx, regex, helpers
│  ├─ constants.ts             # ROUTES, site name/tagline, etc.
│  └─ api.client.ts            # (commented) fetch wrappers for later backend
│
├─ public/
│  ├─ logos/                   # iias-sustain.svg etc.
│  └─ images/
│     └─ placeholders/
│
├─ styles/
│  └─ tokens.css               # optional CSS vars for colors/spacing
│
├─ tests/                      # (optional) unit tests
│  └─ ContactForm.test.tsx
│
├─ .gitignore
├─ .env.example
├─ next.config.mjs
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
├─ next-env.d.ts               # keep this tracked (don’t ignore)
└─ README.md                   # your own, not the Next.js boilerplate
```