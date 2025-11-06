'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Divider, Chip } from "@nextui-org/react";
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';
import RequestReportModal from '@/components/product/RequestReportModal';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { authService } from '@/lib/auth'; 

// A simple check icon for feature lists
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-5 h-5 text-green-500 ${className || ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

type PricingPageProps = {

  companyOptions?: string[];
  year?: number;
};

export default function PricingPage({ companyOptions = [], year }: PricingPageProps) {
  const { isAuthenticated } = useAuth();

  // default to current year if not provided
  const requestYear = useMemo(() => year ?? new Date().getFullYear(), [year]);

  // modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [preselectAll, setPreselectAll] = useState(false); // controls “Full Access” behaviour

  // --- purchase log helper (mirrors RatingTable style) ---
  const logPurchase = async (label: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return false;
    }

    try {
      const token = authService.getAccessToken();
      if (!token) {
        setShowLoginModal(true);
        return false;
      }

      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/log-purchase/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${String(token)}`,
        },
        // backend expects company_name; we pass a clear label for the plan
        body: JSON.stringify({ company_name: label }),
      });

      if (!resp.ok) {
        try {
          const data = await resp.json();
          // eslint-disable-next-line no-console
          console.error('Failed to log purchase:', data);
        } catch {
          // ignore parse errors
        }
        return false;
      }

      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error logging purchase:', e);
      return false;
    }
  };

  // click handlers
  const openFullAccess = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const logged = await logPurchase('Full Access Plan');
    if (logged) {
      setPreselectAll(true);  // full access => select all companies
      setShowRequestModal(true);
    }
  };

  const openBundleAccess = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const logged = await logPurchase('Bundle Access Plan');
    if (logged) {
      setPreselectAll(false); // bundle => let user pick
      setShowRequestModal(true);
    }
  };

  const openContactAccess = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    // optional: also log contact intent
    await logPurchase('Contact Sales');
    // keep your existing navigation or action
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Pricing Plans
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Choose the plan that is right for you. Get access to in-depth ESG & Corporate Governance reports.
        </p>
      </div>

      {/* --- Pricing Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-300  mx-auto">

        {/* --- Plan 1: Single Report --- */}
        <Card className="p-4 shadow-lg border-2 border-primary">
          <CardHeader className="flex flex-col items-start gap-2">
            <h3 className="text-2xl font-semibold">Single Report</h3>
            <p className="text-gray-500">One-time purchase</p>
          </CardHeader>
          <Divider />
          <CardBody className="gap-6 py-8 min-h-80">
            <div className="text-center">
              <span className="text-4xl font-bold">₹15,000</span>
              <span className="text-gray-500"> / per report</span>
            </div>
            <p className="text-gray-600">
              Get a single, comprehensive ESG & Governance report for any company in our database.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Full PDF Report</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>One-time purchase</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Email support</span>
              </li>
            </ul>
          </CardBody>
          <Divider />
          <CardFooter>
            {/* unchanged: goes to your product flow */}
            <Button as={Link} href={ROUTES.productB} color="primary" variant="ghost" className="w-full text-lg">
              Choose a Report
            </Button>
          </CardFooter>
        </Card>
 
        {/* --- Plan 2: Full Access --- */}
        <Card className="p-4 shadow-lg border-2 border-primary">
          <CardHeader className="flex flex-col items-start gap-2">
            <div className="flex justify-between items-center w-full">
              <h3 className="text-2xl font-semibold">All Reports</h3>
              <Chip color="primary" variant="flat">Most Popular</Chip>
            </div>
            <p className="text-gray-500">One-time purchase</p>
          </CardHeader>
          <Divider />
          <CardBody className="gap-6 py-8 min-h-80">
            <div className="text-center">
              <span className="text-4xl font-bold">₹4,00,000</span>
              <span className="text-gray-500"> / year</span>
            </div>
            <p className="text-gray-600">
              Access all 500+ reports, research, and data. The best value for institutions.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Access all 500+ company reports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Unlimited report downloads</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Priority email & phone support</span>
              </li>
            </ul>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button color="primary" className="w-full text-lg" onPress={openFullAccess}>
              Get Full Access
            </Button>
          </CardFooter>
        </Card>

        {/* --- Plan 3: Bundle --- */}
        <Card className="p-4 shadow-lg border-2 border-primary">
          <CardHeader className="flex flex-col items-start gap-2">
            <div className="flex justify-between items-center w-full">
              <h3 className="text-2xl font-semibold">Bundle Purchase</h3>
            </div>
            <p className="text-gray-500">Tailored package for selective access</p>
          </CardHeader>
          <Divider />
          <CardBody className="gap-6 py-8 min-h-80">
            {/* <div className="text-center">
              <span className="text-4xl font-bold">Contact Sales</span>
              <span className="text-gray-500"> / report</span>
            </div> */}
            <p className="text-gray-600">
              Ideal for institutions seeking targeted coverage. Choose a curated set of company reports and research that best fit your portfolio or sectoral focus.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Access reports for your chosen set of companies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Download all selected reports anytime</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Dedicated support for customization and data queries</span>
              </li>
            </ul>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button color="primary" className="w-full text-lg" onPress={openBundleAccess}>
              Request Bundle Access
            </Button>
          </CardFooter>
        </Card>

      </div>

      {/* --- Custom Plan --- */}
      <div className="text-center max-w-2xl mx-auto mt-16 p-20 bg-gray-50 rounded-lg">
        <h4 className="text-2xl font-semibold mb-4">Need a custom plan?</h4>
        <p className="text-gray-600 mb-6">
          We offer enterprise plans for large teams and custom data solutions. Get in touch to discuss your needs.
        </p>
        <Button as={Link} href="/about#contact" color="default" variant="ghost" size="lg" onPress={openContactAccess}>
          Contact Sales
        </Button>
      </div>

      {/* ===== Modals ===== */}
      <RequestReportModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        year={requestYear}
        companyOptions={companyOptions}
        preselectAll={preselectAll}             
      />
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}
