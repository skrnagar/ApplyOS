import * as React from 'react';
import { useSession } from "@auth/create/react";
import { getLocalSession } from "./localAuth";


const useUser = () => {
  const { data: session, status } = useSession();
  const id = session?.user?.id

  const [user, setUser] = React.useState(() => session?.user ?? getLocalSession());

  const fetchUser = React.useCallback(async (session) => {
  return session?.user;
}, [])

  const refetchUser = React.useCallback(() => {
    if(process.env.NEXT_PUBLIC_CREATE_ENV === "PRODUCTION") {
      if (id) {
        fetchUser(session).then(setUser);
      } else {
        setUser(null);
      }
    }
  }, [fetchUser, id])

  React.useEffect(refetchUser, [refetchUser]);

  React.useEffect(() => {
    const syncLocal = () => {
      const local = getLocalSession();
      if (local) setUser(local);
      if (!local && status !== "authenticated") setUser(null);
    };
    syncLocal();
    window.addEventListener("hireorbit:auth-changed", syncLocal);
    window.addEventListener("applyai:auth-changed", syncLocal);
    return () => {
      window.removeEventListener("hireorbit:auth-changed", syncLocal);
      window.removeEventListener("applyai:auth-changed", syncLocal);
    };
  }, [status]);

  if (process.env.NEXT_PUBLIC_CREATE_ENV !== "PRODUCTION") {
    return { user, data: session?.user || user || null, loading: status === 'loading', refetch: refetchUser };
  }
  return { user, data: user, loading: status === 'loading' || (status === 'authenticated' && !user), refetch: refetchUser };
};

export { useUser }

export default useUser;