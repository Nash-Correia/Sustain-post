"use client";
/* eslint-disable @next/next/no-img-element */
import LoginForm from "@/components/auth/LoginForm";
//import { useState } from "react";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="mx-auto h-12 w-auto"
          src="/logo/iias-sustain-logo.png"
          alt="IIAS Sustain"
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link href="/auth/signup" className="font-medium text-teal-600 hover:text-teal-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"/>}>
          <LoginForm />
    </Suspense>
      </div>
    </div>
  );
}
