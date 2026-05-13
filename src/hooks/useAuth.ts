"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  clearSession,
  ensureFreshSession,
  hasPersistentSession,
  restoreFromPersistentSession,
  SessionExpiredError,
  type SessionUser,
} from "@/services/auth";

interface UseAuthReturn {
  session: SessionUser | null;
  isLoading: boolean;
}

/**
 * Guard hook for protected pages.
 *
 * Flow:
 *  1. Session in memory           → ensure tokens are fresh, continue.
 *  2. No memory but persistent cookie (keepLoggedIn) → exchange refresh token
 *     for fresh tokens, restore session, continue.
 *  3. Nothing                     → clear stale cookies and redirect to login.
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const raw = getSession();

      if (raw) {
        // Tokens are in memory — ensure they are still valid.
        try {
          const fresh = await ensureFreshSession();
          if (!cancelled) setSession(fresh);
        } catch (err) {
          if (err instanceof SessionExpiredError) router.replace("/");
        } finally {
          if (!cancelled) setIsLoading(false);
        }
        return;
      }

      // No in-memory session (e.g. after F5). Check for a persistent login cookie.
      if (hasPersistentSession()) {
        try {
          const restored = await restoreFromPersistentSession();
          if (!cancelled) setSession(restored);
        } catch {
          // Refresh token expired or invalid → force re-login.
          router.replace("/");
        } finally {
          if (!cancelled) setIsLoading(false);
        }
        return;
      }

      // No session anywhere — clear any stale cookie and redirect.
      clearSession();
      router.replace("/");
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { session, isLoading };
}
