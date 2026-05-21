import { useCallback } from "react";
import { signIn, signOut } from "@auth/create/react";
import { signInLocal, signOutLocal, signUpLocal } from "./localAuth";
import { isServerAuthEnabled } from "./authMode";
import { tryCreateBrowserClient } from "./supabase/client";

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

function mapSupabaseAuthError(error) {
  const msg = error?.message || "";
  const code = error?.code || "";
  if (code === "invalid_credentials" || msg.includes("Invalid login credentials")) {
    return new Error("CredentialsSignin");
  }
  if (msg.includes("Email not confirmed")) {
    return new Error("EmailNotConfirmed");
  }
  return new Error(msg || "AuthError");
}

export default function useAuth() {
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

    const supabase = typeof window !== "undefined" ? tryCreateBrowserClient() : null;
    if (supabase) {
      signOutLocal();
      const { error } = await supabase.auth.signInWithPassword({
        email: options?.email?.trim(),
        password: options?.password,
      });
      if (error) throw mapSupabaseAuthError(error);
      if (shouldRedirect) redirectAfterAuth(finalCallbackUrl);
      return { ok: true };
    }

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

    const supabase = typeof window !== "undefined" ? tryCreateBrowserClient() : null;
    if (supabase) {
      signOutLocal();
      const { data, error } = await supabase.auth.signUp({
        email: options?.email?.trim(),
        password: options?.password,
        options: {
          emailRedirectTo: `${window.location.origin}${finalCallbackUrl}`,
          data: {
            full_name: options?.name?.trim() || "",
            name: options?.name?.trim() || "",
          },
        },
      });
      if (error) {
        const m = (error.message || "").toLowerCase();
        if (
          error.code === "user_already_exists" ||
          m.includes("already registered") ||
          m.includes("already been registered")
        ) {
          throw new Error("UserAlreadyRegistered");
        }
        throw mapSupabaseAuthError(error);
      }
      if (!data.session && data.user) {
        throw new Error("EmailConfirmationRequired");
      }
      if (shouldRedirect) redirectAfterAuth(finalCallbackUrl);
      return { ok: true };
    }

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
    const supabase = typeof window !== "undefined" ? tryCreateBrowserClient() : null;
    if (supabase) {
      signOutLocal();
      void supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${cb}` },
      });
      return;
    }
    if (isDevIframe()) return devSocialShim("google", cb);
    return signIn("google", { ...options, callbackUrl: cb });
  }, []);

  const signInWithFacebook = useCallback((options) => {
    const cb = options?.callbackUrl;
    const supabase = typeof window !== "undefined" ? tryCreateBrowserClient() : null;
    if (supabase) {
      signOutLocal();
      void supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: { redirectTo: `${window.location.origin}${cb || "/dashboard"}` },
      });
      return;
    }
    if (isDevIframe()) return devSocialShim("facebook", cb);
    return signIn("facebook", options);
  }, []);

  const signInWithTwitter = useCallback((options) => {
    const cb = options?.callbackUrl;
    const supabase = typeof window !== "undefined" ? tryCreateBrowserClient() : null;
    if (supabase) {
      signOutLocal();
      void supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: { redirectTo: `${window.location.origin}${cb || "/dashboard"}` },
      });
      return;
    }
    if (isDevIframe()) return devSocialShim("twitter", cb);
    return signIn("twitter", options);
  }, []);

  const signInWithApple = useCallback((options) => {
    const cb = resolveCallbackUrl(options);
    const supabase = typeof window !== "undefined" ? tryCreateBrowserClient() : null;
    if (supabase) {
      signOutLocal();
      void supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo: `${window.location.origin}${cb}` },
      });
      return;
    }
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
      const supabase = typeof window !== "undefined" ? tryCreateBrowserClient() : null;
      if (supabase) {
        await supabase.auth.signOut();
      }
      signOutLocal();
      try {
        if (isServerAuthEnabled()) {
          await signOut(options);
        }
      } catch {
        /* ignore */
      }
      if (typeof window !== "undefined" && options?.redirect !== false) {
        window.location.href = options?.callbackUrl || "/";
      }
    },
  };
}
