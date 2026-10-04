"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button/Button";
import { Field, Input } from "@/components/ui/Form/Form";
import PasswordInput from "@/components/ui/Form/PasswordInput";
import { useAuth } from "@/auth/useAuth";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/client";
import AuthCard from "./AuthCard";
import scss from "./Auth.module.scss";

const LoginPage = ({ next, error: oauthError }: { next: string; error?: string }) => {
  const router = useRouter();
  const { setUser } = useAuth();
  const { t } = useI18n();
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
      setError(err instanceof Error ? err.message : t.common.somethingWrong);
      setLoading(false);
    }
  };

  return (
    <AuthCard
      next={next}
      error={oauthError}
      title={t.auth.loginTitle}
      subtitle={t.auth.loginSubtitle}
      googleLabel={t.auth.loginGoogle}
      switchText={t.auth.noAccount}
      switchLink={{ label: t.auth.signUp, href: `/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}` }}
    >
      <form onSubmit={handleSubmit} className={scss.form}>
        {error && (
          <p className={scss.formError} role="alert">
            {error}
          </p>
        )}

        <Field label={t.auth.email} htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={t.auth.emailPlaceholder}
          />
        </Field>

        <Field label={t.auth.password} htmlFor="password">
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
          {loading ? t.auth.signingIn : t.auth.signIn}
        </Button>
      </form>
    </AuthCard>
  );
};

export default LoginPage;
