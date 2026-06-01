import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

/**
 * Syncs the authenticated Clerk user to the Convex `users` table.
 *
 * Uses a ref to track whether the sync has already been performed
 * for the current user, preventing duplicate mutation calls on
 * every re-render. The ref resets when the user ID changes
 * (e.g., sign out → sign in as different user).
 */
export const useStoreUser = () => {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.users.createUser);
  const storedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (user && storedUserRef.current !== user.id) {
      const storeUser = async () => {
        try {
          // Identity (clerkId/email/name) is derived server-side from
          // `ctx.auth.getUserIdentity()`, so the client passes no claims.
          await createUser({});
          // Mark this user as synced so we don't fire again
          storedUserRef.current = user.id;
        } catch (error) {
          // Log but don't crash — user creation is idempotent on the server
          console.error("Failed to sync user to Convex:", error);
        }
      };

      storeUser();
    }

    // Reset ref when user signs out
    if (!user) {
      storedUserRef.current = null;
    }
  }, [isLoaded, user, createUser]);

  return { user, isLoaded };
};