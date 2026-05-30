import { useEffect } from "react";
import { useNavigate } from "react-router";
import useUser from "./useUser";
import { isSupabaseAuthEnabled } from "./authMode";
import { readCallbackUrlFromSearch } from "./authRedirect";

/**
 * Redirect authenticated users away from sign-in / sign-up pages.
 */
export default function useRedirectIfAuthenticated(options = {}) {
  const { data: user, loading, authReady } = useUser();
  const navigate = useNavigate();
  const enabled = options.enabled !== false;
  const destination =
    options.to ??
    (typeof window !== "undefined" ? readCallbackUrlFromSearch() : "/dashboard");

  useEffect(() => {
    if (!enabled) return;
    if (loading) return;
    if (isSupabaseAuthEnabled() && authReady === false) return;
    if (!user?.email) return;

    navigate(destination, { replace: true });
  }, [user?.email, loading, authReady, enabled, destination, navigate]);

  const checking =
    enabled &&
    (loading || (isSupabaseAuthEnabled() && authReady === false) || Boolean(user?.email));

  return { checking, isAuthenticated: Boolean(user?.email) };
}
