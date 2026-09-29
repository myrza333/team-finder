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

const RegisterPage = ({ next, error: oauthError }: { next: string; error?: string }) => {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api.auth.register(form);
      setUser(user);
      // Новому пользователю сначала предлагаем заполнить профиль, если он не шёл куда-то конкретно
      router.push(next === "/" ? "/settings/profile" : next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <AuthCard
      next={next}
      error={oauthError}
      title="Create your account"
      subtitle="Join TeamFinder and start building together"
      googleLabel="Sign up with Google"
      switchText="Already have an account?"
      switchLink={{ label: "Sign in", href: `/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}` }}
    >
      <form onSubmit={handleSubmit} className={scss.form}>
        {error && (
          <p className={scss.formError} role="alert">
            {error}
          </p>
        )}

        <Field label="Name" htmlFor="name">
          <Input
            id="name"
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
          />
        </Field>

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
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
          />
        </Field>

        <Button type="submit" fullWidth className={scss.submit} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;
