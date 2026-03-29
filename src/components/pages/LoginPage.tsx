import { useState, type FormEvent } from "react";
import { useApp } from "@/context/AppContext";

// ─── Icon helpers (inline SVG, no figma dependency) ──────────────────────────

function FieldIcon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0 w-4 h-4"
      fill="#1C1B1F"
      viewBox="0 0 16 16"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  mail: "M13.333 2.667H2.667C1.933 2.667 1.34 3.267 1.34 4L1.333 12c0 .733.6 1.333 1.334 1.333h10.666c.734 0 1.334-.6 1.334-1.333V4c0-.733-.6-1.333-1.334-1.333zm0 2.666L8 8.667 2.667 5.333V4L8 7.333 13.333 4v1.333z",
  phone: "M13.333 10.98c-1.12 0-2.213-.18-3.233-.513a.67.67 0 0 0-.68.16l-1.993 1.993a10.04 10.04 0 0 1-4.38-4.38l1.986-2a.665.665 0 0 0 .167-.687A10.17 10.17 0 0 1 4.687 3c0-.367-.3-.667-.667-.667H1.333C.967 2.333.667 2.633.667 3c0 7.547 6.12 13.667 13.666 13.667.367 0 .667-.3.667-.667V11.647c0-.367-.3-.667-.667-.667z",
  key: "M10 1.333A4.67 4.67 0 0 0 5.333 6c0 .394.047.774.134 1.14L1.333 11.273V13.5a.5.5 0 0 0 .5.5H4v-1.333h1.333V11.333H6.86l.787-.787A4.618 4.618 0 0 0 10 10.667 4.67 4.67 0 0 0 14.667 6 4.67 4.67 0 0 0 10 1.333zm0 1.334A3.333 3.333 0 1 1 10 9.333 3.333 3.333 0 0 1 10 2.667zm1.333 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
};

// ─── Reusable field ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: keyof typeof ICONS;
  required?: boolean;
  autoComplete?: string;
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required,
  autoComplete,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-['Poppins'] text-xs text-[#414042]">{label}</label>
      <div className="bg-[#ececec] rounded-lg flex items-center gap-2 px-4 py-3 md:py-4">
        <FieldIcon path={ICONS[icon]} />
        <input
          autoComplete={autoComplete}
          className="flex-1 bg-transparent font-['Poppins'] text-base text-[#242424] placeholder:text-[#c1c8cb] outline-none"
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { handleLogin, setCurrentPage } = useApp();

  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    // Auth stub — replace with real auth (Firebase, Supabase, etc.)
    handleLogin(email);
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left panel — decorative image */}
      <div
        aria-hidden="true"
        className="hidden lg:block lg:w-1/2 xl:w-3/5 bg-[#332e28] relative"
      >
        <img
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src="/images/login-hero.jpg"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <h2 className="font-['Poppins'] font-bold text-4xl text-white mb-4">
            Start Your Dream Space
          </h2>
          <p className="font-['DM_Sans'] text-white/80 text-lg max-w-md">
            Complete design &amp; renovation services tailored to your vision.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 max-w-lg mx-auto lg:mx-0 lg:max-w-none w-full">
        {/* Close */}
        <button
          aria-label="Back to home"
          className="self-start mb-8 text-[#414042] hover:opacity-70 transition"
          onClick={() => setCurrentPage("landing")}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>

        {/* Heading */}
        <h1 className="font-['Poppins'] font-bold text-3xl md:text-4xl text-[#242424] mb-2">
          {isSignIn ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="font-['DM_Sans'] text-[#878787] text-base mb-8">
          {isSignIn
            ? "Sign in to continue to JIA Ideas."
            : "Join us to start planning your perfect space."}
        </p>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 mb-8">
          {(["Sign In", "Create Account"] as const).map((tab, i) => (
            <button
              className={`flex-1 pb-3 font-['Poppins'] font-medium text-sm transition ${
                (i === 0) === isSignIn
                  ? "border-b-2 border-[#414042] text-[#242424]"
                  : "text-[#878787] hover:text-[#414042]"
              }`}
              key={tab}
              onClick={() => {
                setIsSignIn(i === 0);
                setError("");
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <Field
            autoComplete="email"
            icon="mail"
            label="Email"
            onChange={setEmail}
            placeholder="e.g. hello@jiaideas.com"
            required
            type="email"
            value={email}
          />

          {!isSignIn && (
            <Field
              autoComplete="tel"
              icon="phone"
              label="Phone number"
              onChange={setPhone}
              placeholder="Enter your phone number"
              required
              type="tel"
              value={phone}
            />
          )}

          <Field
            autoComplete={isSignIn ? "current-password" : "new-password"}
            icon="key"
            label="Password"
            onChange={setPassword}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />

          {isSignIn && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                checked={rememberMe}
                className="w-4 h-4 rounded accent-[#414042]"
                onChange={(e) => setRememberMe(e.target.checked)}
                type="checkbox"
              />
              <span className="font-['Poppins'] text-sm text-[#242424]">
                Remember Me
              </span>
            </label>
          )}

          {!isSignIn && (
            <p className="font-['Poppins'] text-sm text-[#414042]">
              We'll send an OTP to your phone each time you log in.
            </p>
          )}

          {error && (
            <p className="font-['Poppins'] text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            className="bg-[#414042] hover:bg-[#242424] active:scale-95 transition rounded-lg px-8 py-3 md:py-4 w-full font-['Roboto'] font-medium text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#414042]"
            type="submit"
          >
            {isSignIn ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
