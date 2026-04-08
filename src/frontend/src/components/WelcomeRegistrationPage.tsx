import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Coffee, Copy, Loader2, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useQueries";
import type { Level } from "../types/backend-types";

export default function WelcomeRegistrationPage() {
  const { identity } = useInternetIdentity();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const saveProfile = useSaveCallerUserProfile();

  const principalId = identity?.getPrincipal().toString() ?? "";

  const handleCopy = async () => {
    if (!principalId) return;
    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || null,
        completedCuppings: BigInt(0),
        accuracyPercentage: 0,
        level: { novice: null } as Level,
        progress: BigInt(0),
        cuppingHistory: {
          fragrance: BigInt(0),
          flavor: BigInt(0),
          aftertaste: BigInt(0),
          acidity: BigInt(0),
          body: BigInt(0),
          balance: BigInt(0),
          uniformity: BigInt(0),
          sweetness: BigInt(0),
          cleanCup: BigInt(0),
          overall: BigInt(0),
        },
      });
      toast.success("Profile created! Welcome to My Cup ☕");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    }
  };

  return (
    <div
      data-ocid="welcome_registration.page"
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto"
      style={{
        background:
          "linear-gradient(160deg, oklch(22% 0.05 45) 0%, oklch(18% 0.04 40) 50%, oklch(14% 0.03 38) 100%)",
      }}
    >
      {/* Decorative top bar */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300" />

      <div className="w-full max-w-[430px] flex flex-col items-center px-6 py-10 gap-8">
        {/* Logo/Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
            <Coffee className="h-8 w-8 text-amber-400" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-100 tracking-tight">
              Welcome to My Cup!
            </h1>
            <p className="mt-1.5 text-sm text-amber-300/70">
              Your privacy-first coffee identity is ready.
            </p>
          </div>
        </div>

        {/* Principal ID Card */}
        <div
          data-ocid="welcome_registration.card"
          className="w-full rounded-2xl border border-amber-500/20 bg-white/5 p-5 backdrop-blur-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">
            Your My Cup ID
          </p>
          <div className="flex items-center gap-2 bg-black/30 rounded-xl px-4 py-3 border border-white/10">
            <span
              className="flex-1 font-mono text-xs text-amber-200/80 break-all leading-relaxed"
              data-ocid="welcome_registration.panel"
            >
              {principalId || "Loading..."}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              data-ocid="welcome_registration.secondary_button"
              className="shrink-0 ml-2 p-1.5 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-colors"
              aria-label="Copy Principal ID"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2.5 text-xs text-white/40 leading-relaxed">
            This is your unique identifier on the Internet Computer — no email
            or password required. Keep it safe.
          </p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-5"
          data-ocid="welcome_registration.panel"
        >
          <div className="space-y-2">
            <Label
              htmlFor="reg-name"
              className="text-sm font-medium text-amber-200"
            >
              What should we call you?
            </Label>
            <Input
              id="reg-name"
              data-ocid="welcome_registration.input"
              placeholder="Your name or nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              autoComplete="name"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 focus:ring-amber-400/30 h-12 rounded-xl text-base"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="reg-phone"
              className="text-sm font-medium text-amber-200"
            >
              Phone Number{" "}
              <span className="text-white/40 font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60 pointer-events-none" />
              <Input
                id="reg-phone"
                data-ocid="welcome_registration.phone_input"
                type="tel"
                placeholder="+62 xxx xxx xxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400 focus:ring-amber-400/30 h-12 rounded-xl text-base pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            data-ocid="welcome_registration.submit_button"
            disabled={saveProfile.isPending || !name.trim()}
            className="w-full h-12 rounded-xl text-base font-semibold bg-amber-500 hover:bg-amber-400 text-stone-900 transition-all duration-200 disabled:opacity-50"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create My Profile ☕"
            )}
          </Button>
        </form>

        {/* Footer note */}
        <p className="text-xs text-center text-white/30 leading-relaxed max-w-xs">
          Your profile is stored on-chain via Internet Identity — no personal
          data leaves your control.
        </p>
      </div>
    </div>
  );
}
