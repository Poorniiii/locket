import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { deriveKey } from "../crypto/keyDerivation";
import { decryptJson } from "../crypto/encryption";
import { setSession } from "../crypto/keyStore";
import { getAccount } from "../storage/db";
import { unlocked } from "../features/authSlice";
import { hydratePages } from "../features/pageSlice";
import type { Profile } from "../features/authSlice";
import type { DiaryPage } from "../types/page";

interface DecryptedBlob {
  profile: Profile;
  pages: DiaryPage[];
}

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const record = await getAccount();
      if (!record) {
        setError("No account found on this device. Please sign up.");
        setBusy(false);
        return;
      }
      const key = await deriveKey(password, record.salt);
      let blob: DecryptedBlob;
      try {
        blob = await decryptJson<DecryptedBlob>(record.ciphertext, key, record.iv);
      } catch {
        setError("Wrong password.");
        setBusy(false);
        return;
      }
      setSession(key, record.salt);
      dispatch(hydratePages(blob.pages));
      dispatch(unlocked(blob.profile));
      navigate("/home", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Could not unlock your diary. Please try again.");
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="auth-card__brand">Locket</h1>
        <p className="auth-card__subtitle">Enter your password to unlock</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="sbd-btn sbd-btn--primary"
            disabled={busy}
          >
            {busy ? "Unlocking..." : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}
