# My Cup — Gamification Activity

## Current State

The app has a multi-tab authenticated view with: Map, Profile, Cupping, Scanner, Cafe Dashboard (owner), Admin tabs. The UserProfile tab shows level/progress/accuracy from the backend's UserProfile type (Level: novice/intermediate/advanced/expert, completedCuppings, accuracyPercentage, progress). No dedicated gamification/activity tab exists yet. There are skill levels defined in LandingPage (Novice, Apprentice, Intermediate, Advanced, Expert) and badges referenced in the EarnCoffeeDrawer (sample data only).

## Requested Changes (Diff)

### Add
- A new `Gamification` tab in the authenticated bottom nav (Trophy icon)
- `GamificationDashboard` component with four sections:
  1. **Level & XP Progress** — current level badge, XP bar, next-level milestone, animated progress ring
  2. **Badges / Achievements** — grid of earned + locked badges with names & unlock criteria (based on cuppings count, accuracy, cafe visits, special feats)
  3. **Weekly Challenges** — 3 active challenges with progress bars (e.g. "Submit 3 reviews this week", "Score above 80% accuracy", "Try a new cafe")
  4. **Community Leaderboard** — top-10 ranked users by XP/cuppings (local demo data since no public leaderboard API exists), with the logged-in user's rank highlighted
  5. **Activity Feed** — recent activity items per user (reviews submitted, badges earned, level-ups, QR redeemed)

### Modify
- `HomePage.tsx` — add `"gamification"` to TabId union and navItems array
- `UserProfile.tsx` — add a small "View Achievements" shortcut button that switches to gamification tab (via callback prop)

### Remove
- Nothing removed

## Implementation Plan

1. Create `src/frontend/src/components/GamificationDashboard.tsx`
   - Uses existing UserProfile data from `useGetCallerUserProfile()` and cuppings from `useGetCuppingsForUser()`
   - Level/XP calculated from `completedCuppings` and `accuracyPercentage`
   - Badges: 12 badges total, earned/locked computed from profile data
   - Challenges: 3 weekly challenges with deterministic progress from local state + cuppings count
   - Leaderboard: demo top-10 with logged-in user's rank highlighted (local mock data)
   - Activity feed: derived from cuppings list + badge unlocks
2. Update `HomePage.tsx` to add gamification tab (`Trophy` icon, label "Badges")
3. Minor tweak to `UserProfile.tsx` to add an "Achievements" shortcut
