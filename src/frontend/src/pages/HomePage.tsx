import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Map as MapIcon,
  QrCode,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AdminDashboard from "../components/AdminDashboard";
import CafeDashboard from "../components/CafeDashboard";
import CuppingForm from "../components/CuppingForm";
import LandingPage from "../components/LandingPage";
import MapView from "../components/MapView";
import QRCodeScanner from "../components/QRCodeScanner";
import UserProfile from "../components/UserProfile";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCafeForOwner,
  useGetCallerUserProfile,
  useIsAdmin,
} from "../hooks/useQueries";

type TabId = "map" | "profile" | "cupping" | "scanner" | "dashboard" | "admin";

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: cafeProfile } = useGetCafeForOwner();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState<TabId>("map");
  // When true: show the map view inline (for unauthenticated guest from landing page)
  const [guestMapOpen, setGuestMapOpen] = useState(false);

  // Ref to ensure auto-navigate to profile fires only once per login session
  const hasAutoNavigated = useRef(false);

  const isAuthenticated = !!identity;
  const isCafeOwner = !!cafeProfile;

  // Handle deep links
  useEffect(() => {
    const deepLinkQR = sessionStorage.getItem("deeplink_qr");
    if (deepLinkQR) {
      sessionStorage.removeItem("deeplink_qr");
      setActiveTab("cupping");
    }
    const deepLinkCafe = sessionStorage.getItem("deeplink_cafe");
    if (deepLinkCafe) {
      sessionStorage.removeItem("deeplink_cafe");
      setActiveTab("map");
    }
  }, []);

  useEffect(() => {
    if (!isAdminLoading && !isAdmin && activeTab === "admin") {
      setActiveTab("map");
    }
  }, [isAdmin, isAdminLoading, activeTab]);

  // Auto-navigate returning users to their Profile tab on login
  useEffect(() => {
    if (isAuthenticated && userProfile && !hasAutoNavigated.current) {
      hasAutoNavigated.current = true;
      setActiveTab("profile");
    }
  }, [isAuthenticated, userProfile]);

  // Reset auto-navigate flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasAutoNavigated.current = false;
    }
  }, [isAuthenticated]);

  // Unauthenticated: show landing page or guest map view
  if (!isAuthenticated) {
    if (guestMapOpen) {
      return (
        <div className="relative flex flex-col min-h-[calc(100vh-3.5rem)]">
          {/* Back button */}
          <div className="p-4 pb-0">
            <button
              type="button"
              onClick={() => setGuestMapOpen(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              ← Back to Home
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pb-6 px-4">
            <MapView />
          </div>
        </div>
      );
    }
    return <LandingPage onOpenMap={() => setGuestMapOpen(true)} />;
  }

  if (!userProfile) {
    return null;
  }

  const navItems: NavItem[] = [
    {
      id: "map",
      label: "Map",
      icon: <MapIcon className="h-5 w-5" />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "cupping",
      label: "Cupping",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    ...(isCafeOwner
      ? [
          {
            id: "dashboard" as TabId,
            label: "Cafe",
            icon: <Store className="h-5 w-5" />,
          },
        ]
      : []),
    {
      id: "scanner",
      label: "Scanner",
      icon: <QrCode className="h-5 w-5" />,
    },
    ...(isAdmin
      ? [
          {
            id: "admin" as TabId,
            label: "Admin",
            icon: <ShieldCheck className="h-5 w-5" />,
            badge: (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[8px]"
              >
                ★
              </Badge>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === "map" && (
          <div className="p-4">
            <MapView />
          </div>
        )}
        {activeTab === "profile" && (
          <div className="p-4">
            <UserProfile />
          </div>
        )}
        {activeTab === "cupping" && (
          <div className="p-4">
            <CuppingForm />
          </div>
        )}
        {activeTab === "dashboard" && isCafeOwner && (
          <div className="p-4">
            <CafeDashboard />
          </div>
        )}
        {activeTab === "scanner" && (
          <div className="p-4">
            <QRCodeScanner />
          </div>
        )}
        {activeTab === "admin" && isAdmin && (
          <div className="p-4">
            <AdminDashboard />
          </div>
        )}
      </div>

      {/* Bottom navigation bar */}
      <nav
        data-ocid="bottom_nav.panel"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border z-50 pb-safe"
      >
        <div className="flex items-stretch" data-ocid="bottom_nav.tab">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.tab`}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center gap-0.5 flex-1 py-2 pt-3 relative transition-colors duration-150 active:bg-muted/40"
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
                {/* Icon with optional badge */}
                <span className="relative">
                  <span
                    className={
                      isActive ? "text-primary" : "text-muted-foreground"
                    }
                  >
                    {item.icon}
                  </span>
                  {item.badge}
                </span>
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Safe area spacer for Android gesture bar */}
        <div className="h-safe" />
      </nav>
    </div>
  );
}
