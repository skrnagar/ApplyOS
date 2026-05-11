import { useCallback } from 'react';
import { signIn, signOut } from "@auth/create/react";
import { signInLocal, signOutLocal, signUpLocal } from "./localAuth";

function isDevIframe() {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch { return true; }
}

function devSocialShim(provider, callbackUrl) {
  const params = new URLSearchParams({ provider });
  if (callbackUrl) params.set('callbackUrl', callbackUrl);
  window.location.href = '/__create/social-dev-shim?' + params;
}

function useAuth() {
  const resolveCallbackUrl = (options) => {
    if (typeof window === "undefined") return options?.callbackUrl ?? "/dashboard";
    const fromUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    return fromUrl ?? options?.callbackUrl ?? "/dashboard";
  };

  const signInWithCredentials = useCallback(async (options) => {
    const finalCallbackUrl = resolveCallbackUrl(options);
    try {
      await signIn("credentials-signin", {
        ...options,
        callbackUrl: finalCallbackUrl,
      });
      return { ok: true };
    } catch (err) {
      const result = signInLocal(options || {});
      if (result.error) throw new Error(result.error);
      if (typeof window !== "undefined" && options?.redirect !== false) {
        window.location.href = finalCallbackUrl;
      }
      return { ok: true };
    }
  }, [])

  const signUpWithCredentials = useCallback(async (options) => {
    const finalCallbackUrl = resolveCallbackUrl(options);
    try {
      await signIn("credentials-signup", {
        ...options,
        callbackUrl: finalCallbackUrl,
      });
      return { ok: true };
    } catch (err) {
      const result = signUpLocal(options || {});
      if (result.error) throw new Error(result.error);
      if (typeof window !== "undefined" && options?.redirect !== false) {
        window.location.href = finalCallbackUrl;
      }
      return { ok: true };
    }
  }, [])

  const signInWithGoogle = useCallback((options) => {
    const cb = resolveCallbackUrl(options);
    if (isDevIframe()) return devSocialShim("google", cb);
    return signIn("google", { ...options, callbackUrl: cb });
  }, []);
  const signInWithFacebook = useCallback((options) => {
    const cb = options?.callbackUrl;
    if (isDevIframe()) return devSocialShim("facebook", cb);
    return signIn("facebook", options);
  }, []);
  const signInWithTwitter = useCallback((options) => {
    const cb = options?.callbackUrl;
    if (isDevIframe()) return devSocialShim("twitter", cb);
    return signIn("twitter", options);
  }, []);
  const signInWithApple = useCallback((options) => {
    const cb = resolveCallbackUrl(options);
    if (isDevIframe()) return devSocialShim("apple", cb);
    return signIn("apple", { ...options, callbackUrl: cb });
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInWithApple,
    signOut: async (options = {}) => {
      try {
        await signOut(options);
      } catch {
        signOutLocal();
        if (typeof window !== "undefined" && options?.redirect !== false) {
          window.location.href = options?.callbackUrl || "/";
        }
      }
    },
  }
}

export default useAuth;