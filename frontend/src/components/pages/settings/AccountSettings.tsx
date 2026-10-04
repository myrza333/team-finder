"use client";
import { Check } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button/Button";
import { Field, Hint, Input } from "@/components/ui/Form/Form";
import PasswordInput from "@/components/ui/Form/PasswordInput";
import { GoogleIcon } from "@/components/ui/Icons";
import { useAuth } from "@/auth/useAuth";
import { api, googleAuthUrl } from "@/lib/api";
import { useI18n } from "@/i18n/client";
import { SettingRow, SettingsSection } from "./SettingsParts";
import scss from "./Settings.module.scss";
import local from "./AccountSettings.module.scss";

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 4.5L8 8.5l5.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const AccountSettings = ({ error }: { error?: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const { t } = useI18n();
  const a = t.settings.account;
  const { data: account } = useQuery({ queryKey: ["account"], queryFn: api.auth.account });

  const hasPassword = account?.hasPassword ?? false;
  const googleLinked = account?.googleLinked ?? false;

  const unlink = useMutation({
    mutationFn: api.auth.unlinkGoogle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account"] }),
  });

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const tooShort = pwd.next.length > 0 && pwd.next.length < 8;
  const mismatch = pwd.confirm.length > 0 && pwd.next !== pwd.confirm;
  const canSubmitPwd = (!hasPassword || pwd.current) && pwd.next.length >= 8 && pwd.next === pwd.confirm;

  const changePassword = useMutation({
    mutationFn: () =>
      api.auth.changePassword({ currentPassword: hasPassword ? pwd.current : undefined, newPassword: pwd.next }),
    onSuccess: () => {
      setPwd({ current: "", next: "", confirm: "" });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmitPwd) changePassword.mutate();
  };

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteAccount = async () => {
    try {
      await api.users.removeMe();
      await logout();
      router.push("/");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : t.common.somethingWrong);
    }
  };

  if (!account) return <p className={local.state}>{t.common.loading}</p>;

  return (
    <>
      {error && t.auth.oauthErrors[error] && (
        <p className={local.errorBanner} role="alert">
          {t.auth.oauthErrors[error]}
        </p>
      )}

      <SettingsSection title={a.emailTitle} description={a.emailText}>
        <Field label={a.email} htmlFor="email">
          <Input id="email" type="email" value={account.email} readOnly />
        </Field>
        <Hint>{a.emailLater}</Hint>
      </SettingsSection>

      <SettingsSection title={a.methodsTitle} description={a.methodsText}>
        <SettingRow
          title={
            <>
              <GoogleIcon /> Google
              {googleLinked && <span className={`${scss.badge} ${scss.badgeSuccess}`}>{a.connected}</span>}
            </>
          }
          description={googleLinked ? a.googleLinked : a.googleUnlinked}
        >
          {googleLinked ? (
            <Button variant="outline" disabled={!hasPassword || unlink.isPending} onClick={() => unlink.mutate()}>
              {a.disconnect}
            </Button>
          ) : (
            <Button variant="outline" href={googleAuthUrl("/settings/account")}>
              {a.connect}
            </Button>
          )}
        </SettingRow>

        <SettingRow
          title={
            <>
              <MailIcon /> {a.emailPassword}
              {hasPassword && <span className={`${scss.badge} ${scss.badgeSuccess}`}>{a.active}</span>}
            </>
          }
          description={hasPassword ? a.hasPassword : a.noPassword}
        />

        {googleLinked && !hasPassword && (
          <p className={local.note}>{a.setPasswordFirst}</p>
        )}
        {unlink.isError && <Hint error>{unlink.error.message}</Hint>}
      </SettingsSection>

      <SettingsSection
        title={hasPassword ? a.changeTitle : a.setTitle}
        description={hasPassword ? a.changeText : a.setText}
      >
        <form onSubmit={submitPassword} className={scss.fields}>
          {hasPassword && (
            <Field label={a.current} htmlFor="current-password">
              <PasswordInput
                id="current-password"
                autoComplete="current-password"
                value={pwd.current}
                onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              />
            </Field>
          )}
          <div className={scss.twoColumns}>
            <Field label={a.new} htmlFor="new-password">
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                value={pwd.next}
                onChange={(e) => {
                  setPwd({ ...pwd, next: e.target.value });
                  changePassword.reset();
                }}
              />
              {tooShort && <Hint error>{a.tooShort}</Hint>}
            </Field>
            <Field label={a.confirm} htmlFor="confirm-password">
              <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              />
              {mismatch && <Hint error>{a.mismatch}</Hint>}
            </Field>
          </div>
          <div className={local.formFooter}>
            <span className={changePassword.isError ? local.error : local.success} aria-live="polite">
              {changePassword.isError ? changePassword.error.message : changePassword.isSuccess ? (
                <>
                  <Check size={14} strokeWidth={2} aria-hidden /> {a.passwordSaved}
                </>
              ) : (
                ""
              )}
            </span>
            <Button type="submit" disabled={!canSubmitPwd || changePassword.isPending}>
              {changePassword.isPending ? t.common.saving : hasPassword ? a.update : a.set}
            </Button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection
        title={a.deleteTitle}
        danger
        description={a.deleteText}
      >
        {!deleteOpen ? (
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            {a.deleteButton}
          </Button>
        ) : (
          <div className={local.confirm}>
            <Field label={a.deleteConfirm} htmlFor="delete-confirm">
              <Input
                id="delete-confirm"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
              />
            </Field>
            <div className={local.confirmActions}>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteText("");
                }}
              >
                {t.common.cancel}
              </Button>
              <Button variant="danger" disabled={deleteText !== "DELETE"} onClick={deleteAccount}>
                {a.deleteForever}
              </Button>
            </div>
            {deleteError && <Hint error>{deleteError}</Hint>}
          </div>
        )}
      </SettingsSection>
    </>
  );
};

export default AccountSettings;
