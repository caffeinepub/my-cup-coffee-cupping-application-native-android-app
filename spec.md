# Specification

## Summary
**Goal:** Fix admin/founder recognition so the authenticated deployer can reliably access the Admin Dashboard.

**Planned changes:**
- In `backend/main.mo`, store the deployer's principal in stable storage at canister initialization and expose an `isAdmin() : async Bool` query that returns `true` only for that principal, surviving canister upgrades.
- In `frontend/src/hooks/useQueries.ts`, fix the `useIsAdmin` hook to correctly call the backend `isAdmin()` query, re-fetch when the actor/identity changes, and default to `false` on error.
- In `frontend/src/pages/HomePage.tsx`, conditionally render the Admin Dashboard tab only when `useIsAdmin` returns `true`, and add a visual indicator (badge or label) on the tab to confirm admin access.

**User-visible outcome:** After logging in with the founder/deployer identity, the Admin Dashboard tab automatically appears with a visual admin indicator, while non-admin users see no Admin tab.
