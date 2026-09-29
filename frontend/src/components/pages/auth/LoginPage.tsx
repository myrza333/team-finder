"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button/Button";
import { Field, Input } from "@/components/ui/Form/Form";
import PasswordInput from "@/components/ui/Form/PasswordInput";
import { useAuth } from "@/auth/useAuth";
import { api } from "@/lib/api";
import AuthCard from "./AuthCard";
import scss from "./Auth.module.scss";

const LoginPage = ({ next, error: oauthError }: { next: string; error?: string }) => {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api.auth.login(form);
      setUser(user);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <AuthCard
      next={next}
      error={oauthError}
      title="Welcome back"
      subtitle="Sign in to continue to TeamFinder"
      googleLabel="Continue with Google"
      switchText="Don't have an account?"
      switchLink={{ label: "Sign up", href: `/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}` }}
    >
      <form onSubmit={handleSubmit} className={scss.form}>
        {error && (
          <p className={scss.formError} role="alert">
            {error}
          </p>
        )}

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" fullWidth className={scss.submit} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
};

export default LoginPage;
