# My Cup — Login Flow Improvements

## Current State
- "Start for Free" and "Login" buttons both call the same `login()` function, which directly opens Internet Identity.
- After a new user logs in, a simple `ProfileSetupModal` (small dialog) pops up asking only for a name.
- After a returning user logs in, they land on the Map tab with no indication of their profile/user ID.
- There is no welcome/registration experience for new members.
- There is no "you're logged in" confirmation or profile preview for returning users.

## Requested Changes (Diff)

### Add
- A full-screen **Welcome / Registration page** for new users (those who have just logged in but have no profile yet). Should replace the ProfileSetupModal entirely. Must include:
  - Welcome headline ("Welcome to My Cup!")
  - Explanation that Internet Identity is used for decentralized, privacy-first login
  - Display of the user's **Internet Identity Principal (User ID)** so they can see and copy it
  - Name input field
  - "Create My Profile" submit button
  - Coffee-inspired branding consistent with the rest of the app
- After a **returning user** logs in (has existing profile), automatically switch to the **Profile tab** so they immediately see their profile and User ID
- In the **UserProfile** component, display the user's **Principal ID** (their Internet Identity user ID) prominently, so returning users can always see their unique ID

### Modify
- `ProfileSetupModal.tsx` → Replace with a full-screen welcome/registration page component (`WelcomeRegistrationPage.tsx`). Remove the Dialog wrapper, make it a full-page experience rendered inline in `App.tsx` or `HomePage.tsx`.
- `HomePage.tsx` → After login, if the user has an existing profile (returning user), set `activeTab` to `"profile"` immediately on login so they land on the profile view.
- `App.tsx` → Instead of showing `ProfileSetupModal` for new users, show the new `WelcomeRegistrationPage` full-screen.
- `UserProfile.tsx` → Add a section at the top showing the user's Principal ID (their Internet Identity unique user ID) with a copy-to-clipboard button.

### Remove
- `ProfileSetupModal.tsx` (replaced by `WelcomeRegistrationPage.tsx`)

## Implementation Plan
1. Create `src/frontend/src/components/WelcomeRegistrationPage.tsx` — full-screen welcome/registration for new users:
   - Uses `useInternetIdentity` to get the identity/principal
   - Shows Principal ID as the user's unique "My Cup ID" with copy button
   - Name input + submit calls `saveCallerUserProfile`
   - Coffee branding, espresso color palette
2. Update `App.tsx` — replace `ProfileSetupModal` with `WelcomeRegistrationPage` (same condition: authenticated + no profile yet)
3. Update `UserProfile.tsx` — add Principal ID display at top of profile with copy button
4. Update `HomePage.tsx` — when `isAuthenticated` becomes true AND `userProfile` exists (returning user), set `activeTab = 'profile'` via a `useEffect` that fires once on login
5. Delete `ProfileSetupModal.tsx` (or keep but unused — safe to remove)
