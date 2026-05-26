import * as React from "react";
import { useSession } from "@auth/create/react";
import { getLocalSession, signOutLocal } from "./localAuth";
import { isSupabaseAuthEnabled } from "./authMode";
import { tryCreateBrowserClient } from "./supabase/client";
import { syncAuthProfile } from "./apiAuthHeaders";

function mapSupabaseUser(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    name: meta.full_name || meta.name || user.email?.split("@")[0] || "",
  };
}

const UserContext = React.createContext(undefined);

/** Wrap the app (inside SessionProvider) so all routes share one auth session. */
export function UserProvider({ children }) {
  const { data: session, status } = useSession();
  const id = session?.user?.id;

  const supabaseMode = isSupabaseAuthEnabled();

  const [sbUser, setSbUser] = React.useState(null);
  const [sbLoading, setSbLoading] = React.useState(() => supabaseMode);

  React.useEffect(() => {
    if (!supabaseMode) return;
    const supabase = tryCreateBrowserClient();
    if (!supabase) {
      setSbLoading(false);
      return;
    }

    let cancelled = false;

    const applySession = (sessionData) => {
      if (cancelled) return;
      const mapped = mapSupabaseUser(sessionData?.user ?? null);
      if (mapped) {
        signOutLocal();
        void syncAuthProfile();
      }
      setSbUser(mapped);
      setSbLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      applySession(sessionData);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabaseMode]);

  const [localUser, setLocalUser] = React.useState(() =>
    supabaseMode ? null : session?.user ?? getLocalSession(),
  );

  const fetchUser = React.useCallback(async (sess) => {
    return sess?.user;
  }, []);

  const refetchUser = React.useCallback(() => {
    if (supabaseMode) {
      const supabase = tryCreateBrowserClient();
      if (supabase) {
        void supabase.auth.getSession().then(({ data }) => {
          setSbUser(mapSupabaseUser(data.session?.user ?? null));
        });
      }
      return;
    }
    if (process.env.NEXT_PUBLIC_CREATE_ENV === "PRODUCTION") {
      if (id) {
        fetchUser(session).then(setLocalUser);
      } else {
        setLocalUser(null);
      }
    }
  }, [fetchUser, id, session, supabaseMode]);

  React.useEffect(() => {
    if (supabaseMode) return;
    refetchUser();
  }, [refetchUser, supabaseMode]);

  React.useEffect(() => {
    if (supabaseMode) return;
    const syncLocal = () => {
      const local = getLocalSession();
      if (local) setLocalUser(local);
      if (!local && status !== "authenticated") setLocalUser(null);
    };
    syncLocal();
    window.addEventListener("hireorbit:auth-changed", syncLocal);
    window.addEventListener("applyai:auth-changed", syncLocal);
    return () => {
      window.removeEventListener("hireorbit:auth-changed", syncLocal);
      window.removeEventListener("applyai:auth-changed", syncLocal);
    };
  }, [status, supabaseMode]);

  const value = React.useMemo(() => {
    if (supabaseMode) {
      return {
        user: sbUser,
        data: sbUser,
        loading: sbLoading,
        refetch: refetchUser,
      };
    }
    if (process.env.NEXT_PUBLIC_CREATE_ENV !== "PRODUCTION") {
      return {
        user: localUser,
        data: session?.user || localUser || null,
        loading: status === "loading",
        refetch: refetchUser,
      };
    }
    return {
      user: localUser,
      data: localUser,
      loading: status === "loading" || (status === "authenticated" && !localUser),
      refetch: refetchUser,
    };
  }, [
    supabaseMode,
    sbUser,
    sbLoading,
    localUser,
    session,
    status,
    refetchUser,
  ]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function useUser() {
  const ctx = React.useContext(UserContext);
  if (ctx === undefined) {
    throw new Error("useUser must be used within <UserProvider> (see root.tsx).");
  }
  return ctx;
}

export { useUser };
export default useUser;
