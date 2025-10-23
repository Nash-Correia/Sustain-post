import React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

// Updated data for the link columns to match the image
const footerSections = [
  {
    title: "Links",
    links: [
      { text: "About IiAS", href: ROUTES.about },
      { text: "Company Profile", href:  ROUTES.about }, // Placeholder link
      { text: "Board of Directors", href:  ROUTES.about }, // Added new link
    ],
  },
  {
    title: "Products",
    links: [
      { text: "Voting Advisory", href: "https://www.iiasadvisory.com/voting-advisory" }, // Placeholder link
      { text: "Voting Analytics", href: "https://www.iiasadrian.com/" }, // Placeholder link
      { text: "Compayre", href: "https://www.iiascompayre.com/introduction" }, // Placeholder link
      { text: "Governance Scorecard", href: "https://www.iiasadvisory.com/governance-Scorecard" }, // Placeholder link
      { text: "ESG Advisory", href: "https://www.iiasadvisory.com/esg" },
    ],
  },
  {
    title: "Company",
    links: [
      { text: "Privacy Policy", href: "https://www.iiasadvisory.com/privacy#privacy" }, // Placeholder link
      { text: "Terms of Use", href: "https://www.iiasadvisory.com/privacy#useterm" }, // Placeholder link
      { text: "Disclaimer", href: "https://www.iiasadvisory.com/privacy#disclaimer" }, // Placeholder link
      { text: "Return and refund policy", href: "https://www.iiasadvisory.com/privacy#returns" }, // Placeholder link
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-white text-brand-dark border-t border-gray-200 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section with columns, using a 10-part grid for 1:2:2:2:2:1 ratio */}
        <div className="grid grid-cols-10 gap-8 text-base">
          {/* Spacer Column */}
          <div className="col-span-1 hidden md:block"></div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-full sm:col-span-5 md:col-span-2">
              <h3 className="font-bold text-brand-dark text-lg">{section.title}</h3>
              <ul className="mt-6 space-y-4">
                {section.links.map((link) => (
                  <li key={link.text}>
                    <Link href={link.href} className="text-gray-600 hover:text-teal-btn transition-colors">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="col-span-full sm:col-span-5 md:col-span-2">
            <h3 className="font-bold text-brand-dark text-lg">Contact</h3>
            <div className="mt-6 space-y-4">
              <a href="mailto:solutions@iias.in" className="block text-gray-600 hover:text-teal-btn transition-colors">
                solutions@iias.in
              </a>
              <a href="tel:022-6123-5509" className="block text-gray-600 hover:text-teal-btn transition-colors">
                022-6123-5509
              </a>
            </div>
          </div>
          
          {/* Spacer Column */}
          <div className="col-span-1 hidden md:block"></div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-base text-gray-500">
            © {new Date().getFullYear()} IiAS. All Rights Reserved.
          </span>
          <div className="flex items-center gap-6 text-base">
             <Link href="https://www.iiasadvisory.com/privacy#desclaimer" className="text-gray-500 hover:text-teal-btn transition-colors">
               Disclaimer
             </Link>
             <Link href="https://www.iiasadvisory.com/privacy#useterm" className="text-gray-500 hover:text-teal-btn transition-colors">
               Terms & Conditions
             </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

