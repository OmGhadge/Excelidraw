"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/config";

export function AuthPage({ isSignIn, redirect }: { isSignIn: boolean, redirect?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = isSignIn ? "/api/auth/signin" : "/api/auth/signup";
      const body = isSignIn
        ? { email, password }
        : { username, email, password, photo };
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: 'include', 
      });
      const data = await res.json();
      if (!res.ok) {
        let errorMsg = "Authentication failed";
        if (typeof data?.error === "string") {
          errorMsg = data.error;
        } else if (typeof data?.error === "object" && data.error !== null) {
          
          const firstKey = Object.keys(data.error)[0];
          const errorObj = data.error[firstKey];
          if (errorObj && Array.isArray(errorObj._errors) && errorObj._errors.length > 0) {
            errorMsg = errorObj._errors[0];
          } else {
            errorMsg = JSON.stringify(data.error);
          }
        } else if (data?.message) {
          errorMsg = data.message;
        }
        setError(errorMsg);
        setLoading(false);
        return;
      }

      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <form
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 m-2 flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center mb-2">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.475 19.425a6.5 6.5 0 1 0-9.192-9.192M8.5 8.5l7 7" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{isSignIn ? "Sign In" : "Sign Up"}</h2>
          <div className="text-gray-500 text-sm mb-2">to SketchFlow</div>
        </div>
        {!isSignIn && (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition outline-none"
              required
              minLength={3}
              maxLength={20}
            />

            <input
              type="file"
              accept="image/*"
              className="w-full p-2 rounded-lg border border-gray-200 bg-gray-50"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = ev => {
                    setPhoto(ev.target?.result as string);
                    setPhotoPreview(ev.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setPhoto(null);
                  setPhotoPreview(null);
                }
              }}
            />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border border-gray-200" />
            )}
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition outline-none"
          required
        />
        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 rounded p-2 border border-red-200">{error}</div>
        )}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-lg font-semibold shadow transition-all duration-200 disabled:opacity-60"
          disabled={loading}
        >
          {loading
            ? isSignIn
              ? "Signing In..."
              : "Signing Up..."
            : isSignIn
            ? "Sign In"
            : "Sign Up"}
        </button>
        <div className="text-center pt-2">
          {isSignIn ? (
            <a
              href={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"}
              className="text-purple-600 hover:underline font-medium"
            >
              New here? <span className="underline">Sign up</span>
            </a>
          ) : (
            <a
              href={redirect ? `/signin?redirect=${encodeURIComponent(redirect)}` : "/signin"}
              className="text-purple-600 hover:underline font-medium"
            >
              Already have an account? <span className="underline">Sign in</span>
            </a>
          )}
        </div>
      </form>
    </div>
  );
}