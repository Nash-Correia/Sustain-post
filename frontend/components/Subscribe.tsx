"use client";
import { useEffect, useMemo, useState } from "react";
import { clsx } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// --- SVG Icons ---
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
);

const ExclamationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

// tiny safe helpers for HTML body
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const accessKey = useMemo(() => process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "", []);

  // Simple, decent email regex
  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()),
    [email]
  );

  // Auto-hide message after 3s
  useEffect(() => {
    if (status !== "success" && status !== "error") return;
    const t = setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
    return () => clearTimeout(t);
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const trimmed = email.trim();
    if (!trimmed || !isValidEmail) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      if (!accessKey) {
        throw new Error("Missing Web3Forms key. Set NEXT_PUBLIC_WEB3FORMS_KEY in .env.local");
      }

      const fd = new FormData();
      fd.append("access_key", accessKey);

      // Helpful defaults
      fd.append("from_name", "IiAS Sustain Website");
      fd.append("subject", "New newsletter subscription request");
      // Reply-to makes “reply” go to the subscriber
      fd.append("replyto", trimmed);

      // Plain text body (always works, even on free plan)
      const prettyText = [
        "New Newsletter Subscription — IiAS Sustain",
        "-----------------------------------------",
        `Subscriber Email: ${trimmed}`,
        "",
        `Sent from: ${typeof window !== "undefined" ? window.location.origin : "Website"}`
      ].join("\n");
      fd.append("Details", `Subscriber Email: ${trimmed}`);

      // Optional HTML (ignored if plan doesn’t support it; harmless)
      const htmlBody = `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fb;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;">
          <tr>
            <td>
              <table align="center" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6e9ef;">
                <tr>
                  <td style="background:#0c4a3f;color:#fff;padding:18px 22px;">
                    <h2 style="margin:0;font-size:18px;font-weight:700;">New Newsletter Subscription</h2>
                    <p style="margin:6px 0 0;font-size:13px;opacity:.9;">Submitted from IiAS Sustain</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 22px;">
                    <table cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;color:#111827;">
                      <tr>
                        <td style="padding:10px 0;width:160px;color:#6b7280;">Subscriber Email</td>
                        <td style="padding:10px 0;">
                          <a href="mailto:${escapeAttr(trimmed)}" style="color:#0ea5a2;text-decoration:none;">
                            ${escapeHtml(trimmed)}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">
                      Sent from ${typeof window !== "undefined" ? escapeHtml(window.location.origin) : "your site"}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:12px 22px;text-align:center;color:#6b7280;font-size:12px;">
                    © ${new Date().getFullYear()} IiAS Sustain
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
      //fd.append("email_format", "html");
      //fd.append("html", htmlBody);

      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
      const data = await res.json();

      if (data?.success) {
        setStatus("success");
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        throw new Error(data?.message || "Could not subscribe. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setStatus("error");
      setMessage(msg);
    }
  }

  const formVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Centered and slightly smaller section */}
      <section className="relative bg-[#0c4a3f] text-white rounded-3xl py-16 px-6 sm:px-8 max-w-5xl mx-auto overflow-hidden">
        {/* Animated Background Shapes */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute -top-20 -left-20 w-80 h-80 border-4 border-white/30 rounded-full"
              animate={{
                scale: [0.9, 1.1, 0.9],
                x: [0, 20, 0],
                y: [0, 20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-24 -right-12 w-80 h-80 border-4 border-white/30 rounded-full"
              animate={{
                scale: [0.9, 1.1, 0.9],
                x: [0, -20, 0],
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/3 left-1/2 w-40 h-40 border-4 border-white/20"
              animate={{
                rotate: [0, 45, 0],
                scale: [0.8, 1.2, 0.8],
                x: [-30, 30, -30],
                y: [-20, 20, -20],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.svg
              className="absolute -top-10 right-1/4 w-60 h-60"
              viewBox="0 0 100 100"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeOpacity={0.3}
              animate={{
                rotate: [0, 10, -10, 0],
                x: [0, 15, -15, 0],
                y: [0, -10, 10, 0],
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M10 50 Q25 10, 50 50 T90 50" />
            </motion.svg>
          </>
        )}

        <motion.div
          className="relative z-10 text-center"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-4xl sm:text-5xl font-bold">Subscribe. Never miss an update.</h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Get the latest insights and updates from IiAS directly in your inbox.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <form className="flex w-full max-w-md" onSubmit={onSubmit} noValidate>
              <input
                type="email"
                placeholder="Enter your email ID"
                className={clsx(
                  "flex-1 h-14 rounded-l-full border-0 bg-white/90 px-6 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white",
                  status === "error" && "ring-2 ring-red-300"
                )}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "submitting"}
                aria-invalid={status === "error" ? true : undefined}
                aria-describedby="subscribe-status"
              />
              <button
                type="submit"
                className={clsx(
                  "h-14 rounded-r-full bg-teal-btn px-8 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark",
                  status === "submitting" ? "bg-gray-700 cursor-not-allowed" : "hover:bg-teal-btn/90"
                )}
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "..." : "Subscribe"}
              </button>
              {/* SR-only live region for announcements */}
              <span id="subscribe-status" className="sr-only" aria-live="polite">
                {message}
              </span>
            </form>
          </div>

          {/* Reserve space; crossfade messages */}
          <div className="h-6 mt-4 text-sm">
            <AnimatePresence mode="wait" initial={false}>
              {status === "success" && (
                <motion.p
                  key="success"
                  className="text-green-300 flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  {message}
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  key="error"
                  className="text-red-300 flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ExclamationCircleIcon className="h-5 w-5" />
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
