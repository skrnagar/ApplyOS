import { useCallback } from "react";
import { signIn, signOut } from "@auth/create/react";
import { signInLocal, signOutLocal, signUpLocal } from "./localAuth";
import { isServerAuthEnabled } from "./authMode";

function isDevIframe() {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true;
  }
}

function devSocialShim(provider, callbackUrl) {
  const params = new URLSearchParams({ provider });
  if (callbackUrl) params.set("callbackUrl", callbackUrl);
  window.location.href = "/__create/social-dev-shim?" + params;
}

function redirectAfterAuth(callbackUrl) {
  if (typeof window === "undefined") return;
  const target =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";
  window.location.assign(target);
}

function useAuth() {
  const resolveCallbackUrl = (options) => {
    if (typeof window === "undefined") return options?.callbackUrl ?? "/dashboard";
    const fromUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    const raw = fromUrl ?? options?.callbackUrl ?? "/dashboard";
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
    } catch {
      /* ignore */
    }
    return "/dashboard";
  };

  const signInWithCredentials = useCallback(async (options) => {
    const finalCallbackUrl = resolveCallbackUrl(options);
    const shouldRedirect = options?.redirect !== false;

    if (isServerAuthEnabled()) {
      try {
        const result = await signIn("credentials-signin", {
          email: options?.email,
          password: options?.password,
          callbackUrl: finalCallbackUrl,
          redirect: false,
        });
        if (result?.error) {
          const code = result.error;
          if (code === "CredentialsSignin") {
            throw new Error("CredentialsSignin");
          }
          if (code === "Configuration") {
            throw new Error("Configuration");
          }
          throw new Error(code);
        }
        if (shouldRedirect) redirectAfterAuth(finalCallbackUrl);
        return { ok: true };
      } catch (err) {
        if (err?.message === "Configuration") {
          /* fall through to local demo auth */
        } else {
          throw err;
        }
      }
    }

    const result = signInLocal({
      email: options?.email,
      password: options?.password,
    });
    if (result.error) throw new Error(result.error);
    if (shouldRedirect) redirectAfterAuth(finalCallbackUrl);
    return { ok: true };
  }, []);

  const signUpWithCredentials = useCallback(async (options) => {
    const finalCallbackUrl = resolveCallbackUrl(options);
    const shouldRedirect = options?.redirect !== false;

    if (isServerAuthEnabled()) {
      try {
        const result = await signIn("credentials-signup", {
          email: options?.email,
          password: options?.password,
          name: options?.name,
          callbackUrl: finalCallbackUrl,
          redirect: false,
        });
        if (result?.error) {
          const code = result.error;
          if (code === "CredentialsSignin") {
            throw new Error("CredentialsSignin");
          }
          if (code === "Configuration") {
            throw new Error("Configuration");
          }
          throw new Error(code);
        }
        if (shouldRedirect) redirectAfterAuth(finalCallbackUrl);
        return { ok: true };
      } catch (err) {
        if (err?.message === "Configuration") {
          /* fall through to local demo auth */
        } else {
          throw err;
        }
      }
    }

    const result = signUpLocal({
      email: options?.email,
      password: options?.password,
      name: options?.name,
    });
    if (result.error) throw new Error(result.error);
    if (shouldRedirect) redirectAfterAuth(finalCallbackUrl);
    return { ok: true };
  }, []);

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
    isServerAuthEnabled,
    signOut: async (options = {}) => {
      try {
        if (isServerAuthEnabled()) {
          await signOut(options);
        } else {
          signOutLocal();
        }
      } catch {
        signOutLocal();
      }
      if (typeof window !== "undefined" && options?.redirect !== false) {
        window.location.href = options?.callbackUrl || "/";
      }
    },
  };
}

export default useAuth;
