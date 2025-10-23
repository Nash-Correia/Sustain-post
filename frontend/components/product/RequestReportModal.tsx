// components/product/RequestReportModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import MultiSelect from "./MultiSelect";

// -------------------- Types --------------------
export type RequestModalProps = {
  open: boolean;
  onClose: () => void;
  defaultCompany?: string;
  year: number;
  /** Kept for compat but not used (same modal for both states) */
  loggedIn?: boolean;
  companyOptions: string[];
};

// -------------------- Validation --------------------
type FieldName = "Name" | "Email" | "Contact" | "Organization" | "Designation";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_RE =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function sanitizeInput(v: string) {
  return v.trim().replace(/[<>]/g, "").replace(/\s+/g, " ");
}

function validate(values: {
  Name: string;
  Email: string;
  Contact: string;
  Organization: string;
  Designation: string;
}): FieldErrors {
  const errs: FieldErrors = {};
  const name = sanitizeInput(values.Name);
  const email = sanitizeInput(values.Email);
  const contact = sanitizeInput(values.Contact);

  if (!name || name.length < 2) errs.Name = "Name is required.";
  if (!email || !EMAIL_RE.test(email)) errs.Email = "Please enter a valid email.";
  if (contact) {
    const digits = contact.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      errs.Contact = "Please enter a valid contact number.";
    }
  }
  // Organization, Designation optional
  return errs;
}

// -------------------- Component --------------------
export default function RequestReportModal({
  open,
  onClose,
  defaultCompany,
  year,
  companyOptions,
}: RequestModalProps) {
  // form state
  const [companies, setCompanies] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [isSubscriber, setIsSubscriber] = useState(true);
  const [agree, setAgree] = useState(false);

  // ui state
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Force re-mount MultiSelect on reset (in case it caches internal state)
  const [multiSelectKey, setMultiSelectKey] = useState(0);

  // load default
  useEffect(() => {
    if (open) {
      setCompanies(defaultCompany ? [defaultCompany] : []);
    }
  }, [open, defaultCompany]);

  const accessKey = useMemo(
    () => (process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "").trim(),
    []
  );

  const valid = useMemo(() => {
    if (!agree) return false;
    if (companies.length === 0) return false;
    const v = validate({
      Name: name,
      Email: email,
      Contact: contact,
      Organization: organization,
      Designation: designation,
    });
    return Object.keys(v).length === 0;
  }, [agree, companies, name, email, contact, organization, designation]);

  function blurValidate(field: FieldName, value: string) {
    setTouched((t) => ({ ...t, [field]: true }));
    const v = validate({
      Name: field === "Name" ? value : name,
      Email: field === "Email" ? value : email,
      Contact: field === "Contact" ? value : contact,
      Organization: field === "Organization" ? value : organization,
      Designation: field === "Designation" ? value : designation,
    });
    setErrors(v);
  }

  /** Reset everything back to defaults */
  function resetFormToDefaults() {
    setName("");
    setEmail("");
    setContact("");
    setOrganization("");
    setDesignation("");
    setIsSubscriber(true);
    setAgree(false);
    setCompanies(defaultCompany ? [defaultCompany] : []);
    setTouched({});
    setErrors({});
    setMultiSelectKey((k) => k + 1); // ensure MultiSelect resets visually
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    setErr(null);

    const v = validate({
      Name: name,
      Email: email,
      Contact: contact,
      Organization: organization,
      Designation: designation,
    });
    setErrors(v);
    setTouched({ Name: true, Email: true, Contact: true });
    if (Object.keys(v).length > 0 || !agree || companies.length === 0) {
      setErr("Please fix the errors above before submitting.");
      return;
    }

    if (!accessKey) {
      setErr("Form configuration error. Please contact support.");
      return;
    }

    setSubmitting(true);
    try {
      // Build message body
      let body = `Dear IiAS Team,\n\nPlease find below a request for an ESG report based on the following details:\n\n`;

      body += `User Information\n`;
      body += `Subscriber/Investor: ${isSubscriber ? "Yes" : "No"}\n`;
      body += `Full Name: ${sanitizeInput(name)}\n`;
      body += `Email: ${sanitizeInput(email)}\n`;
      body += `Organization: ${sanitizeInput(organization) || "N/A"}\n`;
      body += `Designation: ${sanitizeInput(designation) || "N/A"}\n`;
      body += `Phone: ${sanitizeInput(contact) || "N/A"}\n\n`;
      body += `Request Details\n`;
      body += `Report Year: ${year}\n`;
      body += `Companies Requested:\n${companies.map((c) => `- ${c}`).join("\n")}\n\n`;
      body += `Thank you.\n`;

      // Web3Forms payload
      const fd = new FormData();
      fd.append("access_key", accessKey);
      fd.append("subject", `ESG Report Request — ${sanitizeInput(name)}`);
      fd.append("from_name", `IiAS Sustain Website — ${sanitizeInput(name)}`);
      fd.append("replyto", sanitizeInput(email));
      fd.append("message", body); // IMPORTANT: correct field key

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        const msg =
          data?.message ||
          `Server error: ${res.status}. Please try again later.`;
        throw new Error(msg);
      }

      // success
      setOk("Thank you! We'll respond within one business day.");
      resetFormToDefaults();
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
          ? e
          : "Something went wrong. Please try again.";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} className="p-6" noValidate>
        {/* Subscriber flag */}
        <label className="inline-flex items-center gap-2 text-[14px] text-gray-700">
          <input
            type="checkbox"
            checked={isSubscriber}
            onChange={(e) => setIsSubscriber(e.target.checked)}
            aria-label="I am a Subscriber/Investor"
          />
          I am a Subscriber/Investor
        </label>

        {/* Person details */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[13px] text-gray-700">Full Name *</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.Name) setErrors((prev) => ({ ...prev, Name: undefined }));
              }}
              onBlur={(e) => blurValidate("Name", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 placeholder-gray-400 text-gray-900 ${
                touched.Name && errors.Name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter Name"
              aria-invalid={!!(touched.Name && errors.Name)}
              aria-describedby={touched.Name && errors.Name ? "name-err" : undefined}
            />
            {touched.Name && errors.Name && (
              <p id="name-err" className="mt-1 text-xs text-red-600">
                {errors.Name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] text-gray-700">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.Email) setErrors((prev) => ({ ...prev, Email: undefined }));
              }}
              onBlur={(e) => blurValidate("Email", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 placeholder-gray-400 text-gray-900 ${
                touched.Email && errors.Email ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter Email"
              aria-invalid={!!(touched.Email && errors.Email)}
              aria-describedby={touched.Email && errors.Email ? "email-err" : undefined}
            />
            {touched.Email && errors.Email && (
              <p id="email-err" className="mt-1 text-xs text-red-600">
                {errors.Email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] text-gray-700">Organization</label>
            <input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              onBlur={(e) => blurValidate("Organization", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 text-gray-900"
              placeholder="Enter Organization"
            />
          </div>

          <div>
            <label className="block text-[13px] text-gray-700">Designation</label>
            <input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              onBlur={(e) => blurValidate("Designation", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 text-gray-900"
              placeholder="Enter Designation"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[13px] text-gray-700">Phone</label>
            <input
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (errors.Contact) setErrors((prev) => ({ ...prev, Contact: undefined }));
              }}
              onBlur={(e) => blurValidate("Contact", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 placeholder-gray-400 text-gray-900 ${
                touched.Contact && errors.Contact ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter Phone"
              aria-invalid={!!(touched.Contact && errors.Contact)}
              aria-describedby={touched.Contact && errors.Contact ? "contact-err" : undefined}
            />
            {touched.Contact && errors.Contact && (
              <p id="contact-err" className="mt-1 text-xs text-red-600">
                {errors.Contact}
              </p>
            )}
          </div>
        </div>

        {/* Companies MultiSelect + Select All */}
        <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-3">
          <MultiSelect
            key={multiSelectKey}
            options={companyOptions}
            selected={companies}
            onChange={setCompanies}
            onReset={() => setCompanies(defaultCompany ? [defaultCompany] : [])}
          />

          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-[14px] text-gray-800 hover:bg-gray-50"
            onClick={() =>
              setCompanies(
                companies.length === companyOptions.length ? [] : companyOptions
              )
            }
          >
            {companies.length === companyOptions.length ? "Clear All" : "Select All"}
          </button>
        </div>

        {/* Terms */}
        <label className="mt-4 block text-[12px] text-gray-700">
          <input
            type="checkbox"
            className="mr-2 align-middle"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            aria-label="Agree to terms and conditions"
          />
          By checking the box below, I confirm that I have read, understood, and agree to all
          the terms and conditions presented. I acknowledge that I am responsible for providing
          accurate and complete information and that my use of this service is subject to these terms.
        </label>

        {/* Actions + notices */}
        <div className="mt-5">
          <button
            type="submit"
            disabled={!valid || submitting}
            className="mx-auto block rounded-lg bg-[#22C55E] px-5 py-2 text-white shadow disabled:opacity-60"
          >
            {submitting ? "Requesting…" : "Request Report"}
          </button>

          {ok && (
            <p className="mt-2 text-center text-sm text-green-700" role="status" aria-live="polite">
              {ok}
            </p>
          )}
          {err && (
            <p className="mt-2 text-center text-sm text-red-600" role="alert">
              {err}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
