# My Cup Coffee Cupping Application   Native Android App

## Overview
My Cup is a coffee cupping application that connects coffee enthusiasts with participating cafes through a map-based discovery system, digital cupping forms, and a redemption system for free coffee tastings. The application is packaged as a native Android APK using Capacitor integration.

## User Authentication
- Users authenticate using Internet Identity
- Two user types: regular users and cafe owners

## Core Features

### Map-Based Discovery
- Interactive map displaying participating cafes
- Filters for distance, roast level, and available free cup slots
- Cafe profiles showing:
  - Photos of the cafe
  - Average cupping scores
  - List of available coffees
  - Current free cup availability

### Cupping Submission System
- Digital cupping form with SCA (Specialty Coffee Association) categories:
  - Fragrance/Aroma
  - Flavor
  - Aftertaste
  - Acidity
  - Body
  - Balance
  - Uniformity
  - Sweetness
  - Clean Cup
  - Overall
- Each category uses 0-100 sliders for scoring
- Intensity level selection for applicable categories
- Optional photo upload for cupping session using native camera access
- Form must be submitted within 24 hours after QR code redemption

### Redemption System
- QR code generation for each coffee reservation
- Native QR code scanning using device camera
- One-time use QR codes tied to specific cafe and timestamp
- QR code validation at participating cafes
- 24-hour window for cupping form submission after redemption

### Profile & Progress System
- User level progression: Novice → Intermediate → Advanced → Expert
- Profile displays:
  - Number of completed cuppings
  - Accuracy percentage (compared to expert scores)
  - Visual progress indicators
  - Cupping history
  - Spider (radar) chart visualization showing the user's last cupping submission scores across all SCA categories

### Cupping Score Visualization
- Spider/radar chart displaying cupping scores across all 10 SCA categories
- Coffee-themed color scheme with espresso browns and crema creams
- Subtle gradients matching existing design aesthetics
- Charts dynamically update when new cupping submissions are recorded
- Implemented using chart.js with react-chartjs-2 wrapper

## Cafe Dashboard Features
- Daily free cup quota management
- Coffee inventory management (add/remove available coffees)
- Aggregated cupping scores per coffee with visual analytics
- Spider/radar chart showing average cupping scores across all coffees for the cafe
- Data export functionality (CSV format)
- QR code validation interface

## Native Android Features

### Capacitor Integration
- PWA wrapped in Capacitor project structure
- WebView configuration with full permissions for camera, file system, and network access
- Native camera integration for QR scanning and photo uploads
- File system access for image handling and data export

### App Configuration
- Custom app icon matching coffee theme
- Splash screen with coffee-themed branding
- Deep link support for:
  - Shared QR codes (mycup://qr/[code])
  - Cafe profile URLs (mycup://cafe/[id])
  - Direct app opening from external links
- Proper Android manifest configuration
- Gradle build setup for APK generation

### Build and Distribution
- Complete Capacitor project structure
- Android Studio compatibility
- Local APK build capability
- Proper permissions for camera, storage, and network access
- One-command build script (`build-apk`) in root package.json that:
  - Builds the frontend (`pnpm build`)
  - Syncs Capacitor with Android (`npx cap sync android`)
  - Uses Gradle to assemble a signed release APK
  - Auto-generates debug keystore if not present
  - Signs APK with debug keystore configuration
  - Outputs signed APK as `MyCup-signed.apk` in the project root directory for easy download
- Updated build documentation in `CAPACITOR_BUILD_INSTRUCTIONS.md` with simplified command
- App content language: English

## Backend Data Storage
- User profiles and authentication data
- Cafe information and profiles
- Coffee inventory per cafe
- Cupping submissions with scores and photos
- QR codes with redemption status and timestamps
- Daily quota tracking per cafe
- User progress and level data

## Core Backend Operations
- User and cafe registration/authentication
- QR code generation and validation
- Cupping form submission processing
- Score aggregation and analytics calculation
- Quota management and availability tracking
- Photo upload and storage handling
- CSV data export generation
