"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, LoaderCircle } from "lucide-react";
import {
  signInNew,
  signInLegacy,
  getUserDetails,
  storeSession,
  storeMigrationData,
} from "@/services/auth";

interface FormValues {
  username: string;
  password: string;
  keepLoggedIn: boolean;
}

interface FormErrors {
  username?: string;
  password?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.username.trim()) errors.username = "Email is required";
  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 4)
    errors.password = "Password must be at least 4 characters";
  return errors;
}

export default function LoginForm() {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>({
    username: "",
    password: "",
    keepLoggedIn: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormValues, boolean>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (authError) setAuthError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate({ ...values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setTouched({ username: true, password: true });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setAuthError(null);
    setIsLoading(true);

    try {
      const tokens = await signInNew(values.username, values.password);

      const userDetails = await getUserDetails({
        region: process.env.NEXT_PUBLIC_AWS_REGION!,
        accessToken: tokens.accessToken,
      });

      storeSession({
        username: userDetails.attributes.email ?? values.username,
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        keepLoggedIn: values.keepLoggedIn,
        tokenRefreshedAt: Date.now(),
        tokenExpiresAt: Date.now() + tokens.expiresIn * 1_000,
        firstName: userDetails.attributes.given_name ?? "",
        lastName: userDetails.attributes.family_name ?? "",
      });

      router.push("/dashboard");
    } catch (newPoolError) {
      try {
        const legacyTokens = await signInLegacy(values.username, values.password);

        storeMigrationData({
          username: values.username,
          password: values.password,
          keepLoggedIn: values.keepLoggedIn,
          idToken: legacyTokens.idToken,
          accessToken: legacyTokens.accessToken,
          refreshToken: legacyTokens.refreshToken,
        });

        router.push("/migrate");
      } catch {
        setAuthError(
          newPoolError instanceof Error
            ? newPoolError.message
            : "Incorrect email or password."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#1e293b] px-4 py-12 overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb-a absolute top-1/2 -translate-y-1/2 -left-50 w-75 h-75 rounded-full bg-[#2196F3]/30 blur-[90px] pointer-events-none z-0" />
      <div className="orb-b absolute top-1/2 -translate-y-1/2 -right-50 w-75 h-75 rounded-full bg-[#7c3aed]/30 blur-[90px] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#1e293b]/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 animate-fadeIn">

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl">
              <span className="text-[#2196F3]">PATS</span>{" "}
            </h1>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl text-white mb-2">Welcome Back!</h2>
            <p className="text-gray-400 text-sm">Let&#39;s get you signed in securely.</p>
          </div>

          {/* Auth-level error */}
          {authError && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3">
              <p className="text-sm text-red-400">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-gray-300 text-sm"
              >
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2196F3] transition-colors" />
                <input
                  id="username"
                  name="username"
                  type="email"
                  autoComplete="email"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className={`w-full pl-11 pr-4 py-3 bg-[#2d3748]/60 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-transparent transition-all ${
                    touched.username && errors.username
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                />
              </div>
              {touched.username && errors.username && (
                <p className="text-xs text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-gray-300 text-sm"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2196F3] transition-colors" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  className={`w-full pl-11 pr-12 py-3 bg-[#2d3748]/60 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-transparent transition-all ${
                    touched.password && errors.password
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Keep logged in + Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  name="keepLoggedIn"
                  checked={values.keepLoggedIn}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 bg-[#2d3748] text-[#2196F3] focus:ring-[#2196F3] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Keep Me Logged In
                </span>
              </label>
              <a
                href="/forgot-password"
                className="text-[#2196F3] hover:text-[#42A5F5] transition-colors font-semibold"
              >
                Forgot Your Password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-linear-to-r from-[#2196F3] to-[#1976D2] text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <>
                  <span>Authenticating</span>
                  <LoaderCircle className="animate-spin"/>
                </>
              ) : (
                <>
                  <span>Log Into Your Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Don&#39;t Have an Account?{" "}
              <a
                href="/signup"
                className="text-[#2196F3] hover:text-[#42A5F5] transition-colors font-semibold"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
