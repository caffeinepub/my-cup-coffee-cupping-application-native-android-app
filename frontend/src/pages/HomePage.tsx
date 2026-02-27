import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCafeForOwner } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapView from '../components/MapView';
import UserProfile from '../components/UserProfile';
import CafeDashboard from '../components/CafeDashboard';
import CuppingForm from '../components/CuppingForm';
import QRCodeScanner from '../components/QRCodeScanner';
import { Coffee, Map, User, Store, ClipboardList, QrCode } from 'lucide-react';

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: cafeProfile } = useGetCafeForOwner();
  const [activeTab, setActiveTab] = useState('map');

  const isAuthenticated = !!identity;
  const isCafeOwner = !!cafeProfile;

  // Handle deep links
  useEffect(() => {
    // Check for QR code deep link
    const deepLinkQR = sessionStorage.getItem('deeplink_qr');
    if (deepLinkQR) {
      sessionStorage.removeItem('deeplink_qr');
      setActiveTab('cupping');
      // The CuppingForm component will need to handle this
    }

    // Check for cafe deep link
    const deepLinkCafe = sessionStorage.getItem('deeplink_cafe');
    if (deepLinkCafe) {
      sessionStorage.removeItem('deeplink_cafe');
      setActiveTab('map');
      // The MapView component will need to handle this
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-2xl text-center">
          <Coffee className="mx-auto h-16 w-16 text-primary" />
          <h2 className="mt-6 text-3xl font-bold">Welcome to My Cup</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover participating cafes, submit cupping forms, and track your coffee journey.
          </p>
          <p className="mt-2 text-muted-foreground">
            Please login to get started.
          </p>
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
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
      </Tabs>
    </div>
  );
}
