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

const RegisterPage = ({ next, error: oauthError }: { next: string; error?: string }) => {
  const router = useRouter();
  const { setUser } = useAuth();
  const { t } = useI18n();
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
      setError(err instanceof Error ? err.message : t.common.somethingWrong);
      setLoading(false);
    }
  };

  return (
    <AuthCard
      next={next}
      error={oauthError}
      title={t.auth.registerTitle}
      subtitle={t.auth.registerSubtitle}
      googleLabel={t.auth.registerGoogle}
      switchText={t.auth.haveAccount}
      switchLink={{ label: t.auth.signIn, href: `/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}` }}
    >
      <form onSubmit={handleSubmit} className={scss.form}>
        {error && (
          <p className={scss.formError} role="alert">
            {error}
          </p>
        )}

        <Field label={t.auth.name} htmlFor="name">
          <Input
            id="name"
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t.auth.namePlaceholder}
          />
        </Field>

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
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={t.auth.passwordPlaceholder}
          />
        </Field>

        <Button type="submit" fullWidth className={scss.submit} disabled={loading}>
          {loading ? t.auth.creating : t.auth.create}
        </Button>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;
