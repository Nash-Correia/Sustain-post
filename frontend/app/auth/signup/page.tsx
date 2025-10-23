"use client";

import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-brand-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-dark mb-2">Create an account</h1>
        <p className="text-sm text-gray-600 mb-6">Get started in seconds.</p>

        <SignupForm />

        <p className="text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link className="text-teal-600 hover:text-teal-500 hover:underline" href="/auth/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
