"use client";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ============================================================================
// TYPES
// ============================================================================
type FieldName =
  | "Name"
  | "Company"
  | "Email"
  | "Contact"
  | "subject"
  | "designation"
  | "Message";
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

// ============================================================================
// VALIDATION RULES & HELPERS
// ============================================================================
interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  minDigits?: number;
  maxDigits?: number;
  startsWith?: RegExp;
  messages: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    minDigits?: string;
    maxDigits?: string;
    startsWith?: string;
  };
}

const VALIDATION_RULES: Record<FieldName, ValidationRule> = {
  Name: {
    required: true,
    minLength: 2,
    maxLength: 80,
    pattern: /^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF'-]+$/,
    messages: {
      required: "Name is required.",
      minLength: "Name must be at least 2 characters.",
      maxLength: "Name must be 80 characters or less.",
      pattern:
        "Name can only contain letters, spaces, hyphens, and apostrophes.",
    },
  },
  Company: {
    required: false,
    maxLength: 100,
    messages: {
      maxLength: "Company name must be 100 characters or less.",
    },
  },
  Email: {
    required: true,
    pattern:
      /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
    messages: {
      required: "Email is required.",
      pattern: "Please enter a valid email address.",
    },
  },
  Contact: {
    required: false,
    pattern: /^[\d\s()+\-]+$/,
    minDigits: 10,
    maxDigits: 10,
    messages: {
      pattern: "Contact can only contain digits, spaces, (), +, or -.",
      minDigits: "Please enter a valid contact number.",
      maxDigits: "Please enter a valid contact number.",
    },
  },
  subject: {
    required: false,
    maxLength: 80,
    messages: {
      maxLength: "Subject must be 80 characters or less.",
    },
  },
  designation: {
    required: false,
    maxLength: 80,
    messages: {
      maxLength: "Designation must be 80 characters or less.",
    },
  },
  Message: {
    required: false, // conditionally required
    minLength: 10,
    maxLength: 2000,
    messages: {
      required: "Message is required when sharing your thoughts.",
      minLength: "Message must be at least 10 characters.",
      maxLength: "Message must be 2000 characters or less.",
    },
  },
};

// Sanitize input to prevent XSS
function sanitizeInput(value: string): string {
  return value.trim().replace(/[<>]/g, "").replace(/\s+/g, " ");
}

// ARIA helper: only render aria-invalid when invalid (omit otherwise)
const ariaInvalid = (msg?: string | null) => (msg ? true : undefined);

// Validate a single field
function validateField(
  name: FieldName,
  value: string,
  isMessageRequired: boolean = false
): string | null {
  const rules = VALIDATION_RULES[name];
  const sanitized = sanitizeInput(value);

  const isRequired = name === "Message" ? isMessageRequired : rules.required;
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

  // Special validation for Indian Contact Number
  if (name === "Contact" && sanitized) {
    const digits = sanitized.replace(/\D/g, "");
    if (rules.minDigits && digits.length < rules.minDigits)
      return rules.messages.minDigits ?? null;
    if (rules.maxDigits && digits.length > rules.maxDigits)
      return rules.messages.maxDigits ?? null;
  }

  return null;
}

// Validate entire form
function validateForm(data: FormData, isMessageRequired: boolean): FieldErrors {
  const errors: FieldErrors = {};
  (Object.keys(data) as FieldName[]).forEach((field) => {
    const error = validateField(field, data[field], isMessageRequired);
    if (error) errors[field] = error;
  });
  return errors;
}

// Extract form data safely
function extractFormData(formElement: HTMLFormElement): FormData {
  const fd = new FormData(formElement);
  return {
    Name: String(fd.get("Name") || ""),
    Company: String(fd.get("Company") || ""),
    Email: String(fd.get("Email") || ""),
    Contact: String(fd.get("Contact") || ""),
    subject: String(fd.get("subject") || ""),
    designation: String(fd.get("designation") || ""),
    Message: String(fd.get("Message") || ""),
  };
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [shareThoughts, setShareThoughts] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {}
  );

  const accessKey = useMemo(
    () => process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "",
    []
  );
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => setOk(null), 5000);
    return () => clearTimeout(t);
  }, [ok]);

  useEffect(() => {
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
      if (!accessKey)
        throw new Error("Form configuration error. Please contact support.");

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
        setErr("Please fix the errors above before submitting.");
        setSubmitting(false);
        return;
      }

      // --- Build Web3Forms payload with expected lowercase keys ---
      const fd = new FormData();
      fd.append("access_key", accessKey);
      fd.append("name", sanitizeInput(formData.Name));
      fd.append("email", sanitizeInput(formData.Email));

      if (formData.Company)
        fd.append("company", sanitizeInput(formData.Company));
      if (formData.Contact)
        fd.append("contact", sanitizeInput(formData.Contact));
      if (formData.designation)
        fd.append("designation", sanitizeInput(formData.designation));

      const subjectLine =
        formData.subject ||
        `New inquiry from ${formData.Name}${
          formData.Company ? ` — ${formData.Company}` : ""
        }`;
      fd.append("subject", sanitizeInput(subjectLine));

      if (shareThoughts && formData.Message) {
        fd.append("message", sanitizeInput(formData.Message));
      }

      // Helpers
      fd.append("replyto", sanitizeInput(formData.Email));
      fd.append(
        "from_name",
        `IiAS Sustain Website — ${sanitizeInput(formData.Name)}`
      );

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });

type Web3FormsResp = { success?: boolean; message?: string };
let data: Web3FormsResp | null = null;
try {
  data = (await res.json()) as unknown as Web3FormsResp;
} catch {
  /* ignore */
}

if (!res.ok || (data && data.success === false)) {
  const msg =
    (data && data.message) ||
    `Server error: ${res.status}. Please try again later.`;
  throw new Error(msg);
}


      // success
      form.reset();
      setErrors({});
      setTouched({});
      setShareThoughts(false);
      setOk("Thank you! We'll respond within one business day.");
} catch (error) {
  console.error("Form submission error:", error);
  const msg = error instanceof Error ? error.message : String(error);
  setErr(msg || "Something went wrong. Please try again.");
} finally {

      setSubmitting(false);
    }
  }

type Shape = {
  className: string;
  top?: string;
  left?: string;
  right?: string;
  w: number;
  h: number;
  d: number;
  clip?: string;
};

const shapes: Shape[] = [
  {
    className: "bg-green-500/20 rounded-full",
    top: "5%",
    left: "7%",
    w: 300,
    h: 300,
    d: 8,
  },
  {
    className: "bg-blue-500/10 rounded-lg",
    top: "20%",
    right: "10%",
    w: 150,
    h: 150,
    d: 9,
  },
];


  const notice = ok
    ? ({ type: "success" as const, text: ok } as const)
    : err
    ? ({ type: "error" as const, text: err } as const)
    : null;

  return (
    <section className="relative bg-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {!prefersReducedMotion &&

        shapes.map((shape, idx) => (
          <motion.div
            key={idx}
            className={`pointer-events-none absolute z-0 ${shape.className}`}
style={{
  top: shape.top,
  left: shape.left,
  right: shape.right,
  width: `${shape.w}px`,
  height: `${shape.h}px`,
  clipPath: shape.clip,
}}

            animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
            transition={{ repeat: Infinity, duration: shape.d, ease: "linear" }}
          />
        ))}
      <div className="relative z-10 mx-auto max-w-4xl bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Get in Touch
        </h2>
        <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
          <input type="hidden" name="botcheck" />


          {/* Name & Company */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-m font-medium text-gray-700 mb-1"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="Name"
                placeholder="John Doe"
                required
                autoComplete="name"
                onChange={() => handleFieldChange("Name")}
                onBlur={(e) => handleFieldBlur("Name", e.target.value)}
                aria-invalid={errors.Name ? "true" : undefined}


                aria-describedby={errors.Name ? "name-err" : undefined}
                className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  errors.Name
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-green-400"
                }`} 
              />
              {errors.Name && touched.Name && (
                <p id="name-err" className="mt-1 text-xs text-red-600">
                  {errors.Name}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-m font-medium text-gray-700 mb-1"
              >
                Company
              </label>
              <input
                id="company"
                type="text"
                name="Company"
                placeholder="Acme Corp"
                autoComplete="organization"
                onChange={() => handleFieldChange("Company")}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Email & Contact */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="email"
                className="block text-m font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="Email"
                placeholder="john@example.com"
                required
                autoComplete="email"
                onChange={() => handleFieldChange("Email")}
                onBlur={(e) => handleFieldBlur("Email", e.target.value)}
                aria-invalid={!!errors.Email}

                aria-describedby={errors.Email ? "email-err" : undefined}
                className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  errors.Email
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-green-400"
                }`} 
              />
              {errors.Email && touched.Email && (
                <p id="email-err" className="mt-1 text-xs text-red-600">
                  {errors.Email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="contact"
                className="block text-m font-medium text-gray-700 mb-1"
              >
                Contact No.
              </label>
              <input
                id="contact"
                type="tel"
                name="Contact"
                placeholder="9876543210"
                autoComplete="tel"
                onChange={() => handleFieldChange("Contact")}
                onBlur={(e) => handleFieldBlur("Contact", e.target.value)}
                aria-invalid={!!errors.Contact}

                aria-describedby={
                  errors.Contact ? "contact-err contact-help" : "contact-help"
                }
                className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  errors.Contact
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-green-400"
                }`} 
              />
              {errors.Contact && touched.Contact && (
                <p id="contact-err" className="mt-1 text-xs text-red-600">
                  {errors.Contact}
                </p>
              )}
              {/* Ensure the helper referenced by aria-describedby always exists */}
              <p id="contact-help" className="sr-only">
                Enter a 10-digit Indian phone number. You may include spaces or
                plus sign.
              </p>
            </div>
          </div>

          {/* Subject & Designation */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="subject"
                className="block text-m font-medium text-gray-700 mb-1"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                name="subject"
                placeholder="e.g., ESG Data Inquiry"
                onChange={() => handleFieldChange("subject")}
                onBlur={(e) => handleFieldBlur("subject", e.target.value)}
                aria-invalid={!!errors.subject}

                aria-describedby={errors.subject ? "subject-err" : undefined}
                className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  errors.subject
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-green-400"
                }`} 
              />
              {errors.subject && touched.subject && (
                <p id="subject-err" className="mt-1 text-xs text-red-600">
                  {errors.subject}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="designation"
                className="block text-m font-medium text-gray-700 mb-1"
              >
                Designation
              </label>
              <input
                id="designation"
                type="text"
                name="designation"
                placeholder="e.g., Analyst, VP"
                onChange={() => handleFieldChange("designation")}
                onBlur={(e) => handleFieldBlur("designation", e.target.value)}
                aria-invalid={!!errors.designation}

                aria-describedby={
                  errors.designation ? "designation-err" : undefined
                }
                className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  errors.designation
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-green-400"
                }`} 
              />
              {errors.designation && touched.designation && (
                <p id="designation-err" className="mt-1 text-xs text-red-600">
                  {errors.designation}
                </p>
              )}
            </div>
          </div>

          {/* Share your thoughts */}
          <div className="mt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={shareThoughts}
                onChange={(e) => handleShareThoughtsToggle(e.target.checked)}
                aria-controls="message-panel"
                aria-expanded={shareThoughts} 
              />
              <span className="text-m font-medium text-gray-800">
                Add a message
              </span>
            </label>
            <div
              id="message-panel"
              className={`transition-all duration-300 overflow-hidden mt-3 ${
                shareThoughts ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message{" "}
                {shareThoughts && <span className="text-red-500">*</span>}
              </label>
              <textarea
                id="message"
                name="Message"
                placeholder="How can we help you today?"
                rows={5}
                disabled={!shareThoughts}
                onChange={() => handleFieldChange("Message")}
                onBlur={(e) => handleFieldBlur("Message", e.target.value)}
                aria-invalid={!!errors.Message}

                aria-describedby={errors.Message ? "message-err" : undefined}
                className={`w-full rounded-md border px-4 py-1 focus:outline-none focus:ring-2 transition-colors ${
                  errors.Message
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-green-400"
                } ${!shareThoughts ? "cursor-not-allowed bg-gray-50" : ""}`} 
              />
              {errors.Message && touched.Message && (
                <p id="message-err" className="mt-1 text-xs text-red-600">
                  {errors.Message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 pt-2">
            <div className="hidden sm:block" />
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-teal-600 px-10 py-3 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                {submitting ? "Submitting…" : "Submit"}
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
                        notice.type === "success"
                          ? "bg-green-50 text-green-800 ring-green-200"
                          : "bg-red-50 text-red-700 ring-red-200"
                      }`}
                      aria-live="polite"
                      role="status"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">
                          {notice.type === "success" ? "✅" : "⚠️"}
                        </span>
                        <p className="leading-snug flex-1">{notice.text}</p>
                        <button
                          type="button"
                          className="ml-auto -mr-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-current/70 hover:text-current focus:outline-none focus:ring-2 focus:ring-current"
                          onClick={() => {
                            if (notice.type === "success") setOk(null);
                            if (notice.type === "error") setErr(null);
                          }}
                          aria-label="Dismiss notification"
                        >
                          ×
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!notice && <div className="hidden sm:block h-[44px]" />}
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
