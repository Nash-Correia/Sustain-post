"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import { type RegisterData } from "@/lib/auth";

export default function SignupForm() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const { signUp } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Also focus the form for better accessibility
    formRef.current?.focus();
  };

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    let errorMessage = "";

    // Reset previous field errors
    setFieldErrors({});

    if (!username.trim()) {
      errors.username = true;
      errorMessage = "Username is required";
    }
    
    if (!firstName.trim()) {
      errors.firstName = true;
      if (!errorMessage) errorMessage = "First name is required";
    }
    
    if (!lastName.trim()) {
      errors.lastName = true;
      if (!errorMessage) errorMessage = "Last name is required";
    }
    
    if (!email.trim()) {
      errors.email = true;
      if (!errorMessage) errorMessage = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = true;
      if (!errorMessage) errorMessage = "Please enter a valid email address";
    }
    
    if (!organization.trim()) {
      errors.organization = true;
      if (!errorMessage) errorMessage = "Organization is required";
    }
    
    if (!jobTitle.trim()) {
      errors.jobTitle = true;
      if (!errorMessage) errorMessage = "Job title is required";
    }
    
    if (!password) {
      errors.password = true;
      if (!errorMessage) errorMessage = "Password is required";
    } else if (password.length < 8) {
      errors.password = true;
      if (!errorMessage) errorMessage = "Password must be at least 8 characters long";
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = true;
      if (!errorMessage) errorMessage = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.password = true;
      errors.confirmPassword = true;
      if (!errorMessage) errorMessage = "Passwords do not match";
    }
    
    // Simple mobile number validation - adjust as needed for your requirements
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      errors.mobileNumber = true;
      if (!errorMessage) errorMessage = "Please enter a valid 10-digit mobile number";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(errorMessage);
      // Scroll to top to show the error message
      setTimeout(scrollToTop, 100);
      return false;
    }
    
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const registerData: RegisterData = {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number: mobileNumber,
        organization,
        job_title: jobTitle,
      };

      const result = await signUp(registerData);
      
      if (result.ok) {
        setSuccess("Account created successfully! Redirecting to notes page...");
        
        setTimeout(() => {
          router.push("/notes");
        }, 1500);
      } else {
        setError(result.error);
        scrollToTop();
      }
      
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to create account. Please try again.");
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press on any input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      formRef.current?.requestSubmit(); // fires onSubmit -> handleSignup
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
      onSubmit={handleSignup}
      onKeyDown={handleKeyDown}
    >
      {error && <FormError message={error} />}
      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">{success}</div>}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username*
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name*
          </label>
          <div className="mt-1">
            <Input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={getInputClassName('firstName')}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name*
          </label>
          <div className="mt-1">
            <Input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={getInputClassName('lastName')}
            />
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address*
        </label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={getInputClassName('email')}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
          Mobile Number
        </label>
        <div className="mt-1">
          <Input
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            autoComplete="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="10-digit mobile number"
            className={getInputClassName('mobileNumber')}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
          Organization*
        </label>
        <div className="mt-1">
          <Input
            id="organization"
            name="organization"
            type="text"
            autoComplete="organization"
            required
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className={getInputClassName('organization')}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
          Job Title*
        </label>
        <div className="mt-1">
          <Input
            id="jobTitle"
            name="jobTitle"
            type="text"
            autoComplete="organization-title"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className={getInputClassName('jobTitle')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password*
        </label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={getInputClassName('password')}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Password must be at least 8 characters long
        </p>
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password*
        </label>
        <div className="mt-1">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={getInputClassName('confirmPassword')}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Create Account
        </Button>
      </div>
    </form>
  );
}