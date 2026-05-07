import { useState, type FormEvent } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

// ─── Reusable field (matches LoginPage style) ─────────────────────────────────

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0 w-4 h-4"
      fill="#1C1B1F"
      viewBox="0 0 16 16"
    >
      <path d="M13.333 2.667H2.667C1.933 2.667 1.34 3.267 1.34 4L1.333 12c0 .733.6 1.333 1.334 1.333h10.666c.734 0 1.334-.6 1.334-1.333V4c0-.733-.6-1.333-1.334-1.333zm0 2.666L8 8.667 2.667 5.333V4L8 7.333 13.333 4v1.333z" />
    </svg>
  );
}

// ─── Step type ────────────────────────────────────────────────────────────────

type Step = "request" | "sent";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const { setCurrentPage } = useApp();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.forgotPassword(trimmed);
      setStep("sent");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Sent confirmation screen ────────────────────────────────────────────────
  if (step === "sent") {
    return (
      <div className="min-h-screen w-full flex">
        {/* Left panel */}
        <div
          aria-hidden="true"
          className="hidden lg:block lg:w-1/2 xl:w-3/5 bg-[#332e28] relative"
        >
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            src="/images/authBG.png"
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

        {/* Right panel */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 max-w-lg mx-auto lg:mx-0 lg:max-w-none w-full">
          {/* Back */}
          <button
            aria-label="Back to home"
            className="self-start mb-8 text-[#414042] hover:opacity-70 transition"
            onClick={() => setCurrentPage("login")}
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

          {/* Success illustration */}
          <div className="mb-8 flex justify-center lg:justify-start">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                />
              </svg>
            </div>
          </div>

          <h1 className="font-['Poppins'] font-bold text-3xl md:text-4xl text-[#242424] mb-3">
            Check your email
          </h1>
          <p className="font-['DM_Sans'] text-[#878787] text-base mb-2">
            We sent a password reset link to
          </p>
          <p className="font-['Poppins'] font-semibold text-[#242424] text-base mb-8 break-all">
            {email}
          </p>

          <p className="font-['DM_Sans'] text-[#878787] text-sm mb-8">
            Didn't receive the email? Check your spam folder, or{" "}
            <button
              className="text-[#414042] font-semibold underline hover:opacity-70 transition"
              onClick={() => {
                setStep("request");
                setError("");
              }}
              type="button"
            >
              try another email address
            </button>
            .
          </p>

          <button
            className="bg-[#414042] hover:bg-[#242424] active:scale-95 transition rounded-lg px-8 py-3 md:py-4 w-full font-['Roboto'] font-medium text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#414042]"
            onClick={() => setCurrentPage("login")}
            type="button"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── Request screen ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex">
      {/* Left panel */}
      <div
        aria-hidden="true"
        className="hidden lg:block lg:w-1/2 xl:w-3/5 bg-[#332e28] relative"
      >
        <img
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src="/images/authBG.png"
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

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 max-w-lg mx-auto lg:mx-0 lg:max-w-none w-full">
        {/* Back button */}
        <button
          aria-label="Back to login"
          className="self-start mb-8 text-[#414042] hover:opacity-70 transition"
          onClick={() => setCurrentPage("login")}
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

        {/* Lock illustration */}
        <div className="mb-8 flex justify-center lg:justify-start">
          <div className="w-16 h-16 rounded-full bg-[#ececec] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#414042]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
              />
            </svg>
          </div>
        </div>

        <h1 className="font-['Poppins'] font-bold text-3xl md:text-4xl text-[#242424] mb-2">
          Forgot Password?
        </h1>
        <p className="font-['DM_Sans'] text-[#878787] text-base mb-8">
          No worries — enter your email and we'll send you a reset link.
        </p>

        {/* Form */}
        <form
          className="flex flex-col gap-5"
          noValidate
          onSubmit={handleSubmit}
        >
          {/* Email field — matches LoginPage style exactly */}
          <div className="flex flex-col gap-2">
            <label className="font-['Poppins'] text-xs text-[#414042]">
              Email
            </label>
            <div className="bg-[#ececec] rounded-lg flex items-center gap-2 px-4 py-3 md:py-4">
              <MailIcon />
              <input
                autoComplete="email"
                className="flex-1 bg-transparent font-['Poppins'] text-base text-[#242424] placeholder:text-[#c1c8cb] outline-none"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="e.g. hello@jiaideas.com"
                required
                type="email"
                value={email}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="font-['Poppins'] text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            className="bg-[#414042] hover:bg-[#242424] active:scale-95 transition rounded-lg px-8 py-3 md:py-4 w-full font-['Roboto'] font-medium text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#414042] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
            type="submit"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {/* Back to sign in */}
          <button
            className="flex items-center justify-center gap-2 font-['Poppins'] text-sm text-[#878787] hover:text-[#414042] transition"
            onClick={() => setCurrentPage("login")}
            type="button"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
