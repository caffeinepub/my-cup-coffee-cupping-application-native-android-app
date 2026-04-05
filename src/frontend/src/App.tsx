import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "next-themes";
import Header from "./components/Header";
import WelcomeRegistrationPage from "./components/WelcomeRegistrationPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import HomePage from "./pages/HomePage";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {/* Phone-width container: native on mobile, centered on desktop */}
      <div className="min-h-screen bg-muted/30 flex justify-center">
        <div className="relative w-full max-w-[430px] min-h-screen overflow-x-hidden bg-background shadow-2xl">
          <Header />
          <main className="flex-1">
            <HomePage />
          </main>
          {showProfileSetup && <WelcomeRegistrationPage />}
          <Toaster />
        </div>
      </div>
    </ThemeProvider>
  );
}
