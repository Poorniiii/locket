import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { deriveKey, generateSalt } from "../crypto/keyDerivation";
import { encryptJson, generateIv } from "../crypto/encryption";
import { setSession } from "../crypto/keyStore";
import { saveAccount } from "../storage/db";
import { unlocked } from "../features/authSlice";
import { hydratePages } from "../features/pageSlice";
import type { DiaryPage } from "../types/page";

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const validate = (): string | null => {
    if (!name.trim()) return "Please enter your user name.";
    if (password.length < 8)
      return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    if (!acknowledged)
      return "Please acknowledge that there is no password recovery.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const salt = generateSalt();
      const key = await deriveKey(password, salt);
      const profile = { name: name.trim() };
      const pages: DiaryPage[] = [];
      const iv = generateIv();
      const ciphertext = await encryptJson({ profile, pages }, key, iv);
      await saveAccount({ version: 1, salt, iv, ciphertext });
      setSession(key, salt);
      dispatch(hydratePages(pages));
      dispatch(unlocked(profile));
      navigate("/home", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Something went wrong setting up your diary. Please try again.");
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="auth-card__brand">Locket</h1>
        <p className="auth-card__subtitle">Set up your private diary</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="signup-name">User name</label>
            <input
              id="signup-name"
              className="input"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="field">
            <label htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              className="input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="ack">
            <label className="ack__label">
              <input
                type="checkbox"
                className="ack__checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                disabled={busy}
              />
              <span>
                I understand there is no password recovery. If I lose my
                password, my diary is gone forever.
              </span>
            </label>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="sbd-btn sbd-btn--primary"
            disabled={busy}
          >
            {busy ? "Setting up..." : "Create my diary"}
          </button>
        </form>
      </section>
    </main>
  );
}
