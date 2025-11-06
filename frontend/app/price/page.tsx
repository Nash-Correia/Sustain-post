'use client';

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';
import RequestReportModal from '@/components/product/RequestReportModal';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { authService } from '@/lib/auth';
import { AnimatePresence, motion } from 'framer-motion';

// --------------------------------------------------------
// Small, consistent check icon
// --------------------------------------------------------
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-4 h-4 shrink-0 text-emerald-500 ${className || ''}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

export type PricingPageProps = {
  companyOptions?: string[];
  year?: number;
};

export default function PricingPage({ companyOptions = [], year }: PricingPageProps) {
  const { isAuthenticated } = useAuth();

  const requestYear = useMemo(() => year ?? new Date().getFullYear(), [year]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [preselectAll, setPreselectAll] = useState(false);

  // --- purchase log helper (defensive) ---
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
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!base) {
        console.warn('NEXT_PUBLIC_API_BASE_URL not set; skipping logPurchase fetch');
        return true;
      }
      const resp = await fetch(`${base}/api/log-purchase/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${String(token)}`,
        },
        body: JSON.stringify({ company_name: label }),
      });
      return resp.ok;
    } catch (e) {
      console.error('Error logging purchase:', e);
      return false;
    }
  };

  // click handlers
  const openFullAccess = async () => {
    if (!isAuthenticated) return setShowLoginModal(true);
    const logged = await logPurchase('Full Access Plan');
    if (logged) {
      setPreselectAll(true);
      setShowRequestModal(true);
    }
  };

  const openBundleAccess = async () => {
    if (!isAuthenticated) return setShowLoginModal(true);
    const logged = await logPurchase('Bundle Access Plan');
    if (logged) {
      setPreselectAll(false);
      setShowRequestModal(true);
    }
  };

  const openContactAccess = async () => {
    if (!isAuthenticated) return setShowLoginModal(true);
    await logPurchase('Contact Sales');
    setShowContactModal(true);
  };

  return (
    <main className="container mx-auto px-4 py-6 bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Pricing Plans</h1>
        <p className="text-base text-gray-600 mb-0">
          Choose the plan that is right for you. Get access to in-depth ESG & Corporate Governance reports.
        </p>
      </div>

      {/* Cards fit in one viewport on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-lg mx-auto md:mb-8 auto-rows-fr">
        {/* --- Plan 1: Single Report --- */}
        <Card className="p-4 shadow-md border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          <CardHeader className="flex flex-col items-start gap-1 pb-2">
            <h3 className="text-xl font-semibold text-gray-800 leading-tight">Single Report</h3>
            <p className="text-gray-500 text-sm">One-time purchase</p>
          </CardHeader>
          <Divider />
          <CardBody className="flex-1 gap-4 py-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-700">₹15,000</span>
              <span className="text-gray-500"> / per report</span>
            </div>
            <p className="text-gray-600 text-sm">
              Get a single, comprehensive ESG & Governance report for any company in our database.
            </p>
            <ul className="space-y-2 text-gray-700 text-sm [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0">
              <li className="flex items-center gap-2"><CheckIcon /><span>Full PDF Report</span></li>
              <li className="flex items-center gap-2"><CheckIcon /><span>One-time purchase</span></li>
              <li className="flex items-center gap-2"><CheckIcon /><span>Email support</span></li>
            </ul>
          </CardBody>
          <Divider />
          <CardFooter className="pt-3">
            <Button as={Link} href={ROUTES.productB} color="primary" variant="flat" className="w-full text-base bg-gray-800 text-white hover:bg-[#00786f]">
              Choose a Report
            </Button>
          </CardFooter>
        </Card>

        {/* --- Plan 2: Full Access --- */}
        <Card className="p-4 shadow-md border border-gray-300 bg-gray-50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          <CardHeader className="flex flex-col items-start gap-1 pb-2">
            <div className="flex justify-between items-center w-full">
              <h3 className="text-xl font-semibold text-gray-800 leading-tight">All Reports</h3>
              <Chip color="default" variant="flat" className="text-s px-2 py-1 bg-teal-100 text-teal-700">Most Popular</Chip>
            </div>
            <p className="text-gray-500 text-sm">One-time purchase</p>
          </CardHeader>
          <Divider />
          <CardBody className="flex-1 gap-4 py-4 text-gray-700">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-700">₹4,00,000</span>
              <span className="text-gray-500"> / year</span>
            </div>
            <p className="text-sm">Access all 500+ reports, research, and data. The best value for institutions.</p>
            <ul className="space-y-2 text-sm [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0">
              <li className="flex items-center gap-2"><CheckIcon /><span>Access all 500+ company reports</span></li>
              <li className="flex items-center gap-2"><CheckIcon /><span>Unlimited report downloads</span></li>
              <li className="flex items-center gap-2"><CheckIcon /><span>Priority email & phone support</span></li>
            </ul>
          </CardBody>
          <Divider />
          <CardFooter className="pt-3">
            <Button className="w-full text-base bg-gray-800 text-white hover:bg-[#00786f]" onPress={openFullAccess}>
              Get Full Access
            </Button>
          </CardFooter>
        </Card>

        {/* --- Plan 3: Bundle --- */}
        <Card className="p-4 shadow-md border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          <CardHeader className="flex flex-col items-start gap-1 pb-2">
            <h3 className="text-xl font-semibold text-gray-800 leading-tight">Bundle Purchase</h3>
            <p className="text-gray-500 text-sm">Tailored package for selective access</p>
          </CardHeader>
          <Divider />
          <CardBody className="flex-1 gap-4 py-4 text-gray-700">
            <p className="text-sm">
              Ideal for institutions seeking targeted coverage. Choose a curated set of company reports and research that best fit your portfolio or sectoral focus.
            </p>
            <ul className="space-y-2 text-sm [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0">
              <li className="flex items-center gap-2"><CheckIcon /><span>Access reports for your chosen set of companies</span></li>
              <li className="flex items-center gap-2"><CheckIcon /><span>Download all selected reports anytime</span></li>
              <li className="flex items-center gap-2"><CheckIcon /><span>Dedicated support for customization and data queries</span></li>
            </ul>
          </CardBody>
          <Divider />
          <CardFooter className="pt-3">
            <Button className="w-full text-base bg-gray-800 text-white hover:bg-[#00786f]" onPress={openBundleAccess}>
              Request Bundle Access
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Contact block (opens modal) */}
      <div className="text-center max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h4 className="text-xl font-semibold text-gray-800 mb-3">Need a custom plan?</h4>
        <p className="text-gray-600 mb-4 text-sm">
          We offer enterprise plans for large teams and custom data solutions. Get in touch to discuss your needs.
        </p>
        <Button
          color="default"
          variant="bordered"
          size="md"
          className="w-[200px] text-base bg-gray-800 text-white hover:bg-[#00786f]"
          onPress={openContactAccess}
        >
          Contact Sales
        </Button>
      </div>

      {/* ===== Existing Modals ===== */}
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

      {/* ===== Contact Sales Modal (with form) ===== */}
<Modal
  isOpen={showContactModal}
  onClose={() => setShowContactModal(false)}
  size="3xl"
  scrollBehavior="inside"
  classNames={{
    base: 'bg-white border border-gray-200 rounded-xl shadow-2xl',
    header: 'border-b border-gray-200',
    body: 'py-6',
    footer: 'border-t border-gray-200',
  }}
>
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-gray-800">Contact Sales</h3>
          <p className="text-sm font-normal text-gray-600">
            Fill out the form below and we will get back to you within one business day.
          </p>
        </ModalHeader>
        <ModalBody>
          <ContactForm />
        </ModalBody>
        {/* Optional footer */}
        {/* <ModalFooter>
          <Button variant="light" onPress={onClose} className="text-gray-600 hover:text-gray-800">
            Close
          </Button>
        </ModalFooter> */}
      </>
    )}
  </ModalContent>
</Modal>

    </main>
  );
}

// ============================================================================
// Contact Form (embedded for modal)
// ============================================================================

type FieldName = 'Name' | 'Company' | 'Email' | 'Contact' | 'subject' | 'designation' | 'Message';
type FieldErrors = Partial<Record<FieldName, string>>;

interface FormData {
  Name: string;
  Company: string;
  Email: string;
  Contact: string;
  designation: string;
  subject: string;
  Message: string;
}

interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  minDigits?: number;
  maxDigits?: number;
  messages: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    minDigits?: string;
    maxDigits?: string;
  };
}

const VALIDATION_RULES: Record<FieldName, ValidationRule> = {
  Name: {
    required: true,
    minLength: 2,
    maxLength: 80,
    pattern: /^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF'-]+$/,
    messages: {
      required: 'Name is required.',
      minLength: 'Name must be at least 2 characters.',
      maxLength: 'Name must be 80 characters or less.',
      pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes.',
    },
  },
  Company: {
    required: false,
    maxLength: 100,
    messages: {
      maxLength: 'Company name must be 100 characters or less.',
    },
  },
  Email: {
    required: true,
    pattern:
      /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
    messages: {
      required: 'Email is required.',
      pattern: 'Please enter a valid email address.',
    },
  },
  Contact: {
    required: false,
    pattern: /^[\d\s()+\-]+$/,
    minDigits: 10,
    maxDigits: 10,
    messages: {
      pattern: 'Contact can only contain digits, spaces, (), +, or -.',
      minDigits: 'Please enter a valid contact number.',
      maxDigits: 'Please enter a valid contact number.',
    },
  },
  subject: {
    required: false,
    maxLength: 80,
    messages: {
      maxLength: 'Subject must be 80 characters or less.',
    },
  },
  designation: {
    required: false,
    maxLength: 80,
    messages: {
      maxLength: 'Designation must be 80 characters or less.',
    },
  },
  Message: {
    required: false,
    minLength: 10,
    maxLength: 2000,
    messages: {
      required: 'Message is required when sharing your thoughts.',
      minLength: 'Message must be at least 10 characters.',
      maxLength: 'Message must be 2000 characters or less.',
    },
  },
};

function sanitizeInput(value: string): string {
  return value.trim().replace(/[<>]/g, '').replace(/\s+/g, ' ');
}

function validateField(
  name: FieldName,
  value: string,
  isMessageRequired: boolean = false
): string | null {
  const rules = VALIDATION_RULES[name];
  const sanitized = sanitizeInput(value);

  const isRequired = name === 'Message' ? isMessageRequired : rules.required;
  if (isRequired && !sanitized) {
    return rules.messages.required || `${name} is required.`;
  }
  if (!sanitized) return null;

  if (rules.minLength && sanitized.length < rules.minLength)
    return rules.messages.minLength || null;
  if (rules.maxLength && sanitized.length > rules.maxLength)
    return rules.messages.maxLength || null;
  if (rules.pattern && !rules.pattern.test(sanitized))
    return rules.messages.pattern ?? null;

  if (name === 'Contact' && sanitized) {
    const digits = sanitized.replace(/\D/g, '');
    if (rules.minDigits && digits.length < rules.minDigits)
      return rules.messages.minDigits ?? null;
    if (rules.maxDigits && digits.length > rules.maxDigits)
      return rules.messages.maxDigits ?? null;
  }

  return null;
}

function validateForm(data: FormData, isMessageRequired: boolean): FieldErrors {
  const errors: FieldErrors = {};
  (Object.keys(data) as FieldName[]).forEach((field) => {
    const error = validateField(field, data[field], isMessageRequired);
    if (error) errors[field] = error;
  });
  return errors;
}

function extractFormData(formElement: HTMLFormElement): FormData {
  const fd = new FormData(formElement);
  return {
    Name: String(fd.get('Name') || ''),
    Company: String(fd.get('Company') || ''),
    Email: String(fd.get('Email') || ''),
    Contact: String(fd.get('Contact') || ''),
    subject: String(fd.get('subject') || ''),
    designation: String(fd.get('designation') || ''),
    Message: String(fd.get('Message') || ''),
  };
}

function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [shareThoughts, setShareThoughts] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  const accessKey = useMemo(() => process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '', []);

  React.useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => setOk(null), 5000);
    return () => clearTimeout(t);
  }, [ok]);

  React.useEffect(() => {
    if (!err) return;
    const t = setTimeout(() => setErr(null), 7000);
    return () => clearTimeout(t);
  }, [err]);

  function handleFieldChange(name: FieldName) {
    if (errors[name]) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[name];
        return rest;
      });
    }
  }

  function handleFieldBlur(name: FieldName, value: string) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value, shareThoughts);
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest[name];
      if (error) rest[name] = error;
      return rest;
    });
  }

  function handleShareThoughtsToggle(checked: boolean) {
    setShareThoughts(checked);
    if (!checked) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest.Message;
        return rest;
      });
      setTouched((prev) => {
        const rest = { ...prev };
        delete rest.Message;
        return rest;
      });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setOk(null);
    setErr(null);

    try {
      if (!accessKey) throw new Error('Form configuration error. Please contact support.');

      const form = e.currentTarget;
      const formData = extractFormData(form);

      setTouched({
        Name: true,
        Email: true,
        Contact: true,
        subject: true,
        designation: true,
        Message: shareThoughts,
      });
      const validationErrors = validateForm(formData, shareThoughts);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setErr('Please fix the errors above before submitting.');
        setSubmitting(false);
        return;
      }

      const fd = new FormData();
      fd.append('access_key', accessKey);
      fd.append('name', sanitizeInput(formData.Name));
      fd.append('email', sanitizeInput(formData.Email));
      if (formData.Company) fd.append('company', sanitizeInput(formData.Company));
      if (formData.Contact) fd.append('contact', sanitizeInput(formData.Contact));
      if (formData.designation) fd.append('designation', sanitizeInput(formData.designation));

      const subjectLine =
        formData.subject ||
        `New inquiry from ${formData.Name}${formData.Company ? ` — ${formData.Company}` : ''}`;
      fd.append('subject', sanitizeInput(subjectLine));

      if (shareThoughts && formData.Message) {
        fd.append('message', sanitizeInput(formData.Message));
      }

      fd.append('replyto', sanitizeInput(formData.Email));
      fd.append('from_name', `IiAS Sustain Website — ${sanitizeInput(formData.Name)}`);

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' },
      });

      type Web3FormsResp = { success?: boolean; message?: string };
      let data: Web3FormsResp | null = null;
      try {
        data = (await res.json()) as Web3FormsResp;
      } catch {}

      if (!res.ok || (data && data.success === false)) {
        const msg =
          (data && data.message) || `Server error: ${res.status}. Please try again later.`;
        throw new Error(msg);
      }

      form.reset();
      setErrors({});
      setTouched({});
      setShareThoughts(false);
      setOk("Thank you! We'll respond within one business day.");
    } catch (error) {
      console.error('Form submission error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setErr(msg || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const notice = ok
    ? ({ type: 'success' as const, text: ok } as const)
    : err
    ? ({ type: 'error' as const, text: err } as const)
    : null;

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <input type="hidden" name="botcheck" />

        <AnimatePresence initial={false}>
          {notice && (
            <motion.div
              key={notice.type + notice.text}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className={`rounded-lg px-4 py-3 text-sm shadow-sm border ${
                  notice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{notice.type === 'success' ? '✅' : '⚠️'}</span>
                  <p className="leading-relaxed flex-1 pt-0.5">{notice.text}</p>
                  <button
                    type="button"
                    className="text-current/60 hover:text-current transition-colors"
                    onClick={() => {
                      if (notice.type === 'success') setOk(null);
                      if (notice.type === 'error') setErr(null);
                    }}
                    aria-label="Dismiss notification"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="Name"
              placeholder="John Doe"
              required
              autoComplete="name"
              onChange={() => handleFieldChange('Name')}
              onBlur={(e) => handleFieldBlur('Name', e.target.value)}
              aria-invalid={errors.Name ? 'true' : undefined}
              aria-describedby={errors.Name ? 'name-err' : undefined}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.Name
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-gray-400 focus:ring-gray-200 hover:border-gray-400'
              }`}
            />
            {errors.Name && touched.Name && (
              <p id="name-err" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.Name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1.5">
              Company
            </label>
            <input
              id="company"
              type="text"
              name="Company"
              placeholder="Acme Corp"
              autoComplete="organization"
              onChange={() => handleFieldChange('Company')}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 hover:border-gray-400"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="Email"
              placeholder="john@example.com"
              required
              autoComplete="email"
              onChange={() => handleFieldChange('Email')}
              onBlur={(e) => handleFieldBlur('Email', e.target.value)}
              aria-invalid={!!errors.Email}
              aria-describedby={errors.Email ? 'email-err' : undefined}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.Email
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-gray-400 focus:ring-gray-200 hover:border-gray-400'
              }`}
            />
            {errors.Email && touched.Email && (
              <p id="email-err" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.Email}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1.5">
              Contact No.
            </label>
            <input
              id="contact"
              type="tel"
              name="Contact"
              placeholder="9876543210"
              autoComplete="tel"
              onChange={() => handleFieldChange('Contact')}
              onBlur={(e) => handleFieldBlur('Contact', e.target.value)}
              aria-invalid={!!errors.Contact}
              aria-describedby={errors.Contact ? 'contact-err contact-help' : 'contact-help'}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.Contact
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-gray-400 focus:ring-gray-200 hover:border-gray-400'
              }`}
            />
            {errors.Contact && touched.Contact && (
              <p id="contact-err" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.Contact}
              </p>
            )}
            <p id="contact-help" className="sr-only">
              Enter a 10-digit Indian phone number. You may include spaces or plus sign.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              placeholder="e.g., ESG Data Inquiry"
              onChange={() => handleFieldChange('subject')}
              onBlur={(e) => handleFieldBlur('subject', e.target.value)}
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? 'subject-err' : undefined}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.subject
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-gray-400 focus:ring-gray-200 hover:border-gray-400'
              }`}
            />
            {errors.subject && touched.subject && (
              <p id="subject-err" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.subject}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1.5">
              Designation
            </label>
            <input
              id="designation"
              type="text"
              name="designation"
              placeholder="e.g., Analyst, VP"
              onChange={() => handleFieldChange('designation')}
              onBlur={(e) => handleFieldBlur('designation', e.target.value)}
              aria-invalid={!!errors.designation}
              aria-describedby={errors.designation ? 'designation-err' : undefined}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.designation
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-gray-400 focus:ring-gray-200 hover:border-gray-400'
              }`}
            />
            {errors.designation && touched.designation && (
              <p id="designation-err" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.designation}
              </p>
            )}
          </div>
        </div>

        <div className="mt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              checked={shareThoughts}
              onChange={(e) => handleShareThoughtsToggle(e.target.checked)}
              aria-controls="message-panel"
              aria-expanded={shareThoughts}
            />
            <span className="text-sm font-medium text-gray-800">Add a message</span>
          </label>
          <div
            id="message-panel"
            className={`transition-all duration-300 overflow-hidden mt-2 ${
              shareThoughts ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message {shareThoughts && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id="message"
              name="Message"
              placeholder="How can we help you today?"
              rows={5}
              disabled={!shareThoughts}
              onChange={() => handleFieldChange('Message')}
              onBlur={(e) => handleFieldBlur('Message', e.target.value)}
              aria-invalid={!!errors.Message}
              aria-describedby={errors.Message ? 'message-err' : undefined}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.Message
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-gray-400 focus:ring-gray-200 hover:border-gray-400'
              } ${!shareThoughts ? 'cursor-not-allowed bg-gray-50' : ''}`}
            />
            {errors.Message && touched.Message && (
              <p id="message-err" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.Message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 pt-1">
          <div className="hidden sm:block" />
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-emerald-600 px-8 py-2.5 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
          <div className="flex justify-center sm:justify-start">
            <div className="w-full sm:w-80">
              <AnimatePresence initial={false}>
                {notice && (
                  <motion.div
                    key={notice.type + notice.text}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-lg px-3 py-2 text-sm shadow-md ring-1 ${
                      notice.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                        : 'bg-red-50 text-red-700 ring-red-200'
                    }`}
                    aria-live="polite"
                    role="status"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">{notice.type === 'success' ? '✅' : '⚠️'}</span>
                      <p className="leading-snug flex-1">{notice.text}</p>
                      <button
                        type="button"
                        className="ml-auto -mr-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-current/70 hover:text-current focus:outline-none focus:ring-2 focus:ring-current"
                        onClick={() => {
                          if (notice.type === 'success') setOk(null);
                          if (notice.type === 'error') setErr(null);
                        }}
                        aria-label="Dismiss notification"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!notice && <div className="hidden sm:block h-[40px]" />}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
