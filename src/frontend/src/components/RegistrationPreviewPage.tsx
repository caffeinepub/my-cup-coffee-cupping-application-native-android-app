import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coffee,
  Copy,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface RegistrationPreviewPageProps {
  onBack: () => void;
}

export default function RegistrationPreviewPage({
  onBack,
}: RegistrationPreviewPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";
  const [copied, setCopied] = useState(false);

  // Sample ID to show what a real My Cup ID looks like
  const sampleId = "2vxsx-fae.ic0.app-abcde-12345-example-id";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sampleId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleLogin = () => {
    try {
      login();
    } catch {
      /* handled by hook */
    }
  };

  return (
    <div
      data-ocid="registration_preview.page"
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto"
      style={{
        background:
          "linear-gradient(160deg, oklch(22% 0.05 45) 0%, oklch(18% 0.04 40) 50%, oklch(14% 0.03 38) 100%)",
      }}
    >
      {/* Decorative top bar */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300" />

      <div className="w-full max-w-[430px] flex flex-col px-6 py-6 gap-6">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-amber-300/70 hover:text-amber-300 transition-colors self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Logo/Icon */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
            <Coffee className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-100 tracking-tight">
              Join My Cup
            </h1>
            <p className="mt-1 text-sm text-amber-300/70">
              Create your free account in seconds
            </p>
          </div>
        </div>

        {/* How it works steps */}
        <div
          data-ocid="registration_preview.panel"
          className="w-full rounded-2xl border border-amber-500/20 bg-white/5 p-5 backdrop-blur-sm space-y-4"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            How Registration Works
          </p>

          <div className="space-y-3">
            {[
              {
                step: "1",
                title: "Verify with Internet Identity",
                desc: "Tap the button below — a secure popup opens. No password or email needed.",
              },
              {
                step: "2",
                title: "Get Your My Cup ID",
                desc: "A unique ID is assigned to you automatically — like the sample below.",
              },
              {
                step: "3",
                title: "Pick a Name & Start",
                desc: "Enter your name or nickname and your profile is ready to use.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-100 leading-tight">
                    {title}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample My Cup ID Preview */}
        <div
          data-ocid="registration_preview.card"
          className="w-full rounded-2xl border border-amber-500/20 bg-white/5 p-5 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 flex-1">
              Sample My Cup ID
            </p>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
              Preview
            </span>
          </div>
          <div className="flex items-center gap-2 bg-black/30 rounded-xl px-4 py-3 border border-white/10">
            <span className="flex-1 font-mono text-xs text-amber-200/60 break-all leading-relaxed">
              {sampleId}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 ml-2 p-1.5 rounded-lg text-amber-400/50 hover:bg-amber-400/10 transition-colors"
              aria-label="Copy sample ID"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2.5 text-xs text-white/35 leading-relaxed">
            Your real ID will be generated when you log in. It is unique to you
            and stored on-chain.
          </p>
        </div>

        {/* Sample Name Form (decorative preview, not functional) */}
        <div className="w-full rounded-2xl border border-amber-500/20 bg-white/5 p-5 backdrop-blur-sm space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            After Login — Complete Your Profile
          </p>
          <div className="space-y-2 opacity-60 pointer-events-none">
            <Label
              htmlFor="preview-name"
              className="text-sm font-medium text-amber-200"
            >
              What should we call you?
            </Label>
            <Input
              id="preview-name"
              placeholder="Your name or nickname"
              disabled
              className="bg-white/10 border-white/20 text-white/50 placeholder:text-white/25 h-12 rounded-xl text-base cursor-not-allowed"
            />
          </div>
          <div className="w-full h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300/50 text-sm font-semibold opacity-60">
            Create My Profile ☕
          </div>
          <p className="text-xs text-white/30 text-center">
            This form will be active after you verify with Internet Identity
          </p>
        </div>

        {/* Privacy notice */}
        <div className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 flex items-start gap-3">
          <Lock className="h-4 w-4 text-amber-400/60 shrink-0 mt-0.5" />
          <p className="text-xs text-white/40 leading-relaxed">
            No email, password, or personal data required. Internet Identity is
            a privacy-first authentication system — your identity stays in your
            control.
          </p>
        </div>

        {/* CTA — the real login button */}
        <Button
          onClick={handleLogin}
          disabled={isLoggingIn}
          data-ocid="registration_preview.submit_button"
          className="w-full h-14 rounded-xl text-base font-bold bg-amber-500 hover:bg-amber-400 text-stone-900 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-amber-500/30"
        >
          {isLoggingIn ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Connecting to Internet Identity…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue with Internet Identity
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        <p className="text-xs text-center text-white/25 leading-relaxed pb-6">
          Already registered? Logging in will take you straight to your profile.
        </p>
      </div>
    </div>
  );
}
