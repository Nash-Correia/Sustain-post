"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    formRef.current?.focus();
  };

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    let errorMessage = "";

    setFieldErrors({});

    if (!username.trim()) {
      errors.username = true;
      errorMessage = "Username is required";
    }

    if (!password.trim()) {
      errors.password = true;
      if (!errorMessage) errorMessage = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(errorMessage);
      setTimeout(scrollToTop, 100);
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn(username, password);
      
      if (result.ok) {
        // Redirect to intended page or default to notes page
        const redirectTo = searchParams.get('redirect') || "/notes";
        router.push(redirectTo);
      } else {
        setError(result.error);
        scrollToTop();
      }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setError(msg || "Failed to login. Please try again.");
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press on any input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      formRef.current?.requestSubmit(); // triggers onSubmit -> handleLogin
    }
  };

  // Helper function to get input styling based on error state
  const getInputClassName = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      return "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50";
    }
    return "";
  };

  return (
    <form 
      ref={formRef}
      className="space-y-6" 
      onSubmit={handleLogin}
      onKeyPress={handleKeyPress}
    >
      {error && <FormError message={error} />}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <div className="mt-1">
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={getInputClassName('username')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={getInputClassName('password')}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
          Remember me
        </label>
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Sign in
        </Button>
      </div>
    </form>
  );
}