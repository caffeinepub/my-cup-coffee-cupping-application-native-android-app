import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetCafeForOwner,
  useIsAdmin,
} from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MapView from '../components/MapView';
import UserProfile from '../components/UserProfile';
import CafeDashboard from '../components/CafeDashboard';
import CuppingForm from '../components/CuppingForm';
import QRCodeScanner from '../components/QRCodeScanner';
import AdminDashboard from '../components/AdminDashboard';
import { Coffee, Map, User, Store, ClipboardList, QrCode, BarChart2, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: cafeProfile } = useGetCafeForOwner();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState('map');

  const isAuthenticated = !!identity;
  const isCafeOwner = !!cafeProfile;

  // Determine number of columns for the tab grid
  // map, profile, cupping, scanner are always present (4)
  // cafe dashboard is conditional on isCafeOwner
  // admin tab is conditional on isAdmin
  let colCount = 4;
  if (isCafeOwner) colCount++;
  if (isAdmin) colCount++;

  const gridColsClass =
    colCount <= 3
      ? 'grid-cols-3'
      : colCount === 4
        ? 'grid-cols-4'
        : colCount === 5
          ? 'grid-cols-5'
          : 'grid-cols-6';

  // Handle deep links
  useEffect(() => {
    // Check for QR code deep link
    const deepLinkQR = sessionStorage.getItem('deeplink_qr');
    if (deepLinkQR) {
      sessionStorage.removeItem('deeplink_qr');
      setActiveTab('cupping');
    }

    // Check for cafe deep link
    const deepLinkCafe = sessionStorage.getItem('deeplink_cafe');
    if (deepLinkCafe) {
      sessionStorage.removeItem('deeplink_cafe');
      setActiveTab('map');
    }
  }, []);

  // If the active tab is 'admin' but the user is no longer admin, switch to map
  useEffect(() => {
    if (!isAdminLoading && !isAdmin && activeTab === 'admin') {
      setActiveTab('map');
    }
  }, [isAdmin, isAdminLoading, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-2xl text-center">
          <Coffee className="mx-auto h-16 w-16 text-primary" />
          <h2 className="mt-6 text-3xl font-bold">Welcome to My Cup</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover participating cafes, submit cupping forms, and track your coffee journey.
          </p>
          <p className="mt-2 text-muted-foreground">Please login to get started.</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="container py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${gridColsClass}`}>
          <TabsTrigger value="map">
            <Map className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Map</span>
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="cupping">
            <ClipboardList className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Cupping</span>
          </TabsTrigger>
          {isCafeOwner && (
            <TabsTrigger value="dashboard">
              <Store className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="scanner">
            <QrCode className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Scanner</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="relative">
              <ShieldCheck className="mr-1 h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Admin</span>
              <Badge
                variant="secondary"
                className="ml-1 hidden h-4 px-1 py-0 text-[10px] leading-4 sm:inline-flex"
              >
                ★
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="map" className="mt-6">
          <MapView />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <UserProfile />
        </TabsContent>

        <TabsContent value="cupping" className="mt-6">
          <CuppingForm />
        </TabsContent>

        {isCafeOwner && (
          <TabsContent value="dashboard" className="mt-6">
            <CafeDashboard />
          </TabsContent>
        )}

        <TabsContent value="scanner" className="mt-6">
          <QRCodeScanner />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="mt-6">
            <AdminDashboard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
