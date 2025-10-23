// components/nav/Header.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { clsx } from "@/lib/utils";
import { LOGIN } from "@/lib/feature-flags";
import { useAuth } from "@/components/auth/AuthProvider";

/** Simple person/user icon */
function PersonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
      className={clsx("h-5 w-5", props.className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

/** Props we may inject into dropdown children */
type WithSetOpen = { setOpen?: (v: boolean) => void };

/** Type guards */
function isElement(node: React.ReactNode): node is React.ReactElement {
  return React.isValidElement(node);
}
function isFragmentElement(
  node: React.ReactNode
): node is React.ReactElement<{ children?: React.ReactNode }>
{
  return isElement(node) && node.type === React.Fragment;
}
function isDomTag(el: React.ReactElement): boolean {
  return typeof el.type === "string";
}

/** Inject setOpen only into custom components (not DOM nodes) */
function injectSetOpenIntoChildren(
  children: React.ReactNode,
  setOpen: (v: boolean) => void
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!isElement(child)) return child;
    if (isFragmentElement(child)) {
      const fragKids = injectSetOpenIntoChildren(child.props.children, setOpen);
      return <>{fragKids}</>;
    }
    if (isDomTag(child)) return child;
    return React.cloneElement(child as React.ReactElement<WithSetOpen>, { setOpen });
  });
}

/** Compact Dropdown */
function Dropdown({
  label,
  children,
  className,
  align = "right",
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: "right" | "center";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const renderedChildren = injectSetOpenIntoChildren(children, setOpen);

  return (
    <div className="relative" ref={ref}>
      <button
        className={clsx(
          // Fixed size & centering so it looks identical in both states
          "inline-flex items-center justify-center gap-1.5 h-11 w-36",
          className
        )}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <svg
          className={clsx("h-4 w-4 transition-transform", open && "rotate-180")}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </button>

      <div
        className={clsx(
          "absolute z-30 mt-2 min-w-[14rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden transition-all duration-150 ease-out",
          align === "center" ? "left-1/2 -translate-x-1/2" : "right-0",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
        role="menu"
        aria-hidden={!open}
      >
        <div className="p-1">{renderedChildren}</div>
      </div>
    </div>
  );
}

/** Compact items */
function MenuItem({
  href,
  children,
  setOpen,
}: {
  href: string;
  children: React.ReactNode;
  setOpen?: (v: boolean) => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex w-full items-center gap-2 rounded-md px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 whitespace-nowrap"
      onClick={() => setOpen?.(false)}
    >
      {children}
    </Link>
  );
}

function MenuAction({
  onClick,
  children,
  setOpen,
}: {
  onClick: () => void;
  children: React.ReactNode;
  setOpen?: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex w-full items-center gap-2 rounded-md px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 whitespace-nowrap"
      onClick={() => {
        onClick();
        setOpen?.(false);
      }}
    >
      {children}
    </button>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();

  useEffect(() => setMobileOpen(false), [pathname]);

  // Base classes for top nav links
  const navLinkClasses =
    "relative px-2 py-2 text-xl font-medium text-gray-900 hover:text-gray-700 transition-colors after:content-[''] after:absolute after:left-2 after:right-2 after:bottom-0 after:h-0.5 after:bg-teal-600 after:transform after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100";

  // Auth button text: "Login" or user's name
  const authLabel = !user ? "Login" : user.first_name || user.username || "User";

  const authButtonClasses =
    "px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-md shadow-sm transition-colors";

  // Dropdown items based on authentication state
  const authDropdownItems = !user ? (
    <>
      <MenuItem href="/auth/login">Login</MenuItem>
      <MenuItem href="/auth/signup">Sign Up</MenuItem>
    </>
  ) : (
    <>
      <MenuItem href="/notes">My Account</MenuItem>
      {user.is_staff && (
        <MenuItem href="/admin">Admin Panel</MenuItem>
      )}
      <MenuAction onClick={signOut}>Logout</MenuAction>
    </>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href={ROUTES.home} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/iias-sustain-logo.png" alt="IiAS Sustain" className="h-20 w-auto" />
            <span className="text-2xl font-bold text-gray-900">IiAS Sustain</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            <nav className="flex items-center gap-6 text-xl">
              <Dropdown label="Products" className={navLinkClasses} align="center">
                <MenuItem href={ROUTES.productA}>ESG Rating Comparison</MenuItem>
                <MenuItem href={ROUTES.productB}>ESG Reports</MenuItem>
              </Dropdown>

              <Link href={ROUTES.methodology} className={navLinkClasses}>
                Methodology
              </Link>
              
              <Dropdown label="About" className={navLinkClasses} align="center">
                <MenuItem href={`${ROUTES.about}#sustain`}>Sustain</MenuItem>
                <MenuItem href={`${ROUTES.about}#our-people`}>Our People</MenuItem>
                <MenuItem href={`${ROUTES.about}#policies`}>Policies</MenuItem>
                <MenuItem href={`${ROUTES.about}#disclosures`}>Disclosures</MenuItem>
                <MenuItem href={`${ROUTES.about}#terms-conditions`}>Terms & Conditions</MenuItem>
              </Dropdown>
            </nav>

            {/* Auth Button/Dropdown */}
            <Dropdown label={authLabel} className={authButtonClasses} align="right">
              {authDropdownItems}
            </Dropdown>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="space-y-1 px-4 py-4">
            <Link
              href={ROUTES.productA}
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
            >
              ESG Comparison
            </Link>
            <Link
              href={ROUTES.productB}
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
            >
              ESG Reports
            </Link>
            <Link
              href={ROUTES.methodology}
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Methodology
            </Link>
            
            {/* About Section */}
            <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">About</div>
            <Link
              href={`${ROUTES.about}#sustain`}
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md ml-4"
            >
              Sustain
            </Link>
            <Link
              href={`${ROUTES.about}#our-people`}
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md ml-4"
            >
              Our People
            </Link>
            <Link
              href={`${ROUTES.about}#policies`}
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md ml-4"
            >
              Policies
            </Link>
            <Link
              href={`${ROUTES.about}#disclosures`}
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md ml-4"
            >
              Disclosures
            </Link>
            <Link
              href={`${ROUTES.about}#terms-conditions`}
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md ml-4"
            >
              Terms & Conditions
            </Link>
            <div className="pt-4 border-t border-gray-300">
              {!user ? (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <div className="block px-3 py-2 text-base font-medium text-gray-900">
                    Hi, {user.first_name || user.username || "User"}
                  </div>
                  <Link
                    href="/notes"
                    className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full text-left block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
