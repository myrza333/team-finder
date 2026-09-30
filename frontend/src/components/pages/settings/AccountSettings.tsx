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
import { api, authErrorMessages, googleAuthUrl } from "@/lib/api";
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
      setDeleteError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  if (!account) return <p className={local.state}>Loading…</p>;

  return (
    <>
      {error && authErrorMessages[error] && (
        <p className={local.errorBanner} role="alert">
          {authErrorMessages[error]}
        </p>
      )}

      <SettingsSection title="Email address" description="Used to sign in and for notifications. Never shown publicly.">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" value={account.email} readOnly />
        </Field>
        <Hint>Changing your email will be available later.</Hint>
      </SettingsSection>

      <SettingsSection title="Sign-in methods" description="Ways you can log in to TeamFinder.">
        <SettingRow
          title={
            <>
              <GoogleIcon /> Google
              {googleLinked && <span className={`${scss.badge} ${scss.badgeSuccess}`}>Connected</span>}
            </>
          }
          description={googleLinked ? "You can sign in with your Google account." : "Sign in with one click using your Google account."}
        >
          {googleLinked ? (
            <Button variant="outline" disabled={!hasPassword || unlink.isPending} onClick={() => unlink.mutate()}>
              Disconnect
            </Button>
          ) : (
            <Button variant="outline" href={googleAuthUrl("/settings/account")}>
              Connect
            </Button>
          )}
        </SettingRow>

        <SettingRow
          title={
            <>
              <MailIcon /> Email and password
              {hasPassword && <span className={`${scss.badge} ${scss.badgeSuccess}`}>Active</span>}
            </>
          }
          description={hasPassword ? "You can sign in with your email and password." : "No password set yet."}
        />

        {googleLinked && !hasPassword && (
          <p className={local.note}>Set a password below before disconnecting Google, so you don&apos;t lose access.</p>
        )}
        {unlink.isError && <Hint error>{unlink.error.message}</Hint>}
      </SettingsSection>

      <SettingsSection
        title={hasPassword ? "Change password" : "Set a password"}
        description={
          hasPassword
            ? "Use at least 8 characters. Avoid passwords you use on other sites."
            : "Add a password to be able to sign in without Google."
        }
      >
        <form onSubmit={submitPassword} className={scss.fields}>
          {hasPassword && (
            <Field label="Current password" htmlFor="current-password">
              <PasswordInput
                id="current-password"
                autoComplete="current-password"
                value={pwd.current}
                onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              />
            </Field>
          )}
          <div className={scss.twoColumns}>
            <Field label="New password" htmlFor="new-password">
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                value={pwd.next}
                onChange={(e) => {
                  setPwd({ ...pwd, next: e.target.value });
                  changePassword.reset();
                }}
              />
              {tooShort && <Hint error>At least 8 characters</Hint>}
            </Field>
            <Field label="Confirm new password" htmlFor="confirm-password">
              <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              />
              {mismatch && <Hint error>Passwords don&apos;t match</Hint>}
            </Field>
          </div>
          <div className={local.formFooter}>
            <span className={changePassword.isError ? local.error : local.success} aria-live="polite">
              {changePassword.isError ? changePassword.error.message : changePassword.isSuccess ? (
                <>
                  <Check size={14} strokeWidth={2} aria-hidden /> Password saved
                </>
              ) : (
                ""
              )}
            </span>
            <Button type="submit" disabled={!canSubmitPwd || changePassword.isPending}>
              {changePassword.isPending ? "Saving…" : hasPassword ? "Update password" : "Set password"}
            </Button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Delete account"
        danger
        description="Permanently delete your profile, projects, applications and messages. This cannot be undone."
      >
        {!deleteOpen ? (
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete my account
          </Button>
        ) : (
          <div className={local.confirm}>
            <Field label='Type "DELETE" to confirm' htmlFor="delete-confirm">
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
                Cancel
              </Button>
              <Button variant="danger" disabled={deleteText !== "DELETE"} onClick={deleteAccount}>
                Delete forever
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
