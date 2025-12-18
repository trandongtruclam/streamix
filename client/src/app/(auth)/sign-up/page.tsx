"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-[#1f1f23] rounded-xl border border-[#35353b] p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Create account
        </h2>
        <p className="text-[#adadb8] text-center mb-6">
          Join the Streamix community
        </p>

        {error && (
          <div className="bg-[#eb0400]/10 border border-[#eb0400]/20 text-[#eb0400] px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[#dedee3] mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="coolstreamer"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              className="w-full h-11 px-4 bg-[#18181b] border border-[#35353b] rounded-lg text-white placeholder:text-[#adadb8] focus:outline-none focus:ring-2 focus:ring-[#9147ff] focus:border-transparent transition-all"
            />
            <p className="text-xs text-[#adadb8] mt-1">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#dedee3] mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-11 px-4 bg-[#18181b] border border-[#35353b] rounded-lg text-white placeholder:text-[#adadb8] focus:outline-none focus:ring-2 focus:ring-[#9147ff] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#dedee3] mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full h-11 px-4 pr-12 bg-[#18181b] border border-[#35353b] rounded-lg text-white placeholder:text-[#adadb8] focus:outline-none focus:ring-2 focus:ring-[#9147ff] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#adadb8] hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#dedee3] mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-4 bg-[#18181b] border border-[#35353b] rounded-lg text-white placeholder:text-[#adadb8] focus:outline-none focus:ring-2 focus:ring-[#9147ff] focus:border-transparent transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#9147ff] hover:bg-[#772ce8] text-white font-semibold transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#adadb8]">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-[#9147ff] hover:text-[#bf94ff] font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
