import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { cn } from "../lib/utils";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const mutation = useMutation({
    mutationFn: () =>
      authApi.register({ username, email, password, displayName }),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate("/home");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
            <p className="mt-2 text-gray-600">Join Demo Twitter today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700"
              >
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className={cn(
                  "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3",
                  "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                )}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                pattern="[a-zA-Z0-9_]+"
                className={cn(
                  "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3",
                  "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                )}
                placeholder="johndoe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(
                  "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3",
                  "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                )}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={cn(
                  "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3",
                  "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                )}
                placeholder="At least 6 characters"
              />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">
                Registration failed. Username or email may already be taken.
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className={cn(
                "w-full rounded-full bg-primary-600 py-3 font-semibold text-white",
                "hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {mutation.isPending ? "Creating account..." : "Sign up"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
