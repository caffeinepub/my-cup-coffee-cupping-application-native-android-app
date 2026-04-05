# My Cup

## Current State
The app is a gamified coffee discovery and cupping platform. It has:
- Landing page (LandingPage.tsx) with hero section, interactive stat buttons, features/steps two-column layout
- Android-native-style UI with bottom navigation bar, compact header, phone-width layout
- Hero uses user-uploaded espresso crema photo as background
- Stat buttons (Review Submitted, Partner Cafes, Skill Level) in hero — show icon/number by default, tap reveals title, tap again reveals explanation
- Pages 2+3 merged into a single two-column layout: left = feature cards (Discover Cafe, Submit Reviews, Earn Free Coffee), right = numbered steps (01/02/03)
- Admin dashboard visible only to founder/admin account (role-based via authorization component)
- Daily stats chart and table in admin dashboard
- CuppingForm, MapView, QRCodeScanner, UserProfile, CafeDashboard components
- Authorization, blob-storage, camera, qr-code components selected

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Rebuild/redeploy the existing app as-is (draft expired, needs fresh deploy)

### Remove
- Nothing

## Implementation Plan
1. Deploy the existing codebase as-is to create a new live draft
