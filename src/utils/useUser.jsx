import * as React from "react";
import { startTransition } from "react";
import { useSession } from "@auth/create/react";
import { getLocalSession, signOutLocal } from "./localAuth";
import { isSupabaseAuthEnabled, shouldUseAuthJsSession } from "./authMode";
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

function UserProviderInner({ children, session, status }) {
  const id = session?.user?.id;
  const supabaseMode = isSupabaseAuthEnabled();

  const [sbUser, setSbUser] = React.useState(null);
  const [sbLoading, setSbLoading] = React.useState(() => supabaseMode);
  /** False until the first getSession() completes — avoids false logouts from early auth events. */
  const [sbReady, setSbReady] = React.useState(!supabaseMode);

  React.useEffect(() => {
    if (!supabaseMode) return;
    const supabase = tryCreateBrowserClient();
    if (!supabase) {
      setSbLoading(false);
      setSbReady(true);
      return;
    }

    setSbLoading(true);
    let cancelled = false;
    let initialSessionDone = false;

    const applySession = (sessionData) => {
      if (cancelled) return;
      const mapped = mapSupabaseUser(sessionData?.user ?? null);
      startTransition(() => {
        if (cancelled) return;
        if (mapped) {
          signOutLocal();
          void syncAuthProfile();
        }
        setSbUser(mapped);
        setSbLoading(false);
      });
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      initialSessionDone = true;
      applySession(data.session);
      setSbReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      if (!initialSessionDone) return;
      applySession(sessionData);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabaseMode]);

  const [localUser, setLocalUser] = React.useState(() =>
    supabaseMode ? null : session?.user ?? null,
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
    window.addEventListener("hireorbital:auth-changed", syncLocal);
    window.addEventListener("applyai:auth-changed", syncLocal);
    return () => {
      window.removeEventListener("hireorbital:auth-changed", syncLocal);
      window.removeEventListener("applyai:auth-changed", syncLocal);
    };
  }, [status, supabaseMode]);

  const value = React.useMemo(() => {
    if (supabaseMode) {
      return {
        user: sbUser,
        data: sbUser,
        loading: sbLoading || !sbReady,
        authReady: sbReady,
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
    sbReady,
    localUser,
    session,
    status,
    refetchUser,
  ]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function UserProviderWithAuthJs({ children }) {
  const { data: session, status } = useSession();
  return (
    <UserProviderInner session={session} status={status}>
      {children}
    </UserProviderInner>
  );
}

/** Wrap the app so all routes share one auth session (Supabase and/or Auth.js). */
export function UserProvider({ children }) {
  if (!shouldUseAuthJsSession()) {
    return (
      <UserProviderInner session={null} status="unauthenticated">
        {children}
      </UserProviderInner>
    );
  }
  return <UserProviderWithAuthJs>{children}</UserProviderWithAuthJs>;
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
