import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  getAccount,
  saveAccount,
  clearAccount,
  type AccountRecord
} from "../storage/db";
import { base64ToBytes, bytesToBase64 } from "../crypto/encoding";
import { lockSession, clearLocalAccount } from "../utils/session";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import ConfirmDialog from "./ConfirmDialog";

interface BackupFile {
  format: "locket-backup";
  version: number;
  createdAt: string;
  salt: string;
  iv: string;
  ciphertext: string;
}

const todayStamp = () => new Date().toISOString().slice(0, 10);

const triggerDownload = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function Settings() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.auth.profile);
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const [message, setMessage] = useState<{
    text: string;
    tone: "info" | "error";
  } | null>(null);
  const [confirmImport, setConfirmImport] = useState<BackupFile | null>(null);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    lockSession(dispatch);
    navigate("/", { replace: true });
  };

  const handleExport = async () => {
    setMessage(null);
    try {
      const record = await getAccount();
      if (!record) {
        setMessage({ text: "No account found to export.", tone: "error" });
        return;
      }
      const payload: BackupFile = {
        format: "locket-backup",
        version: 1,
        createdAt: new Date().toISOString(),
        salt: bytesToBase64(record.salt),
        iv: bytesToBase64(record.iv),
        ciphertext: bytesToBase64(record.ciphertext)
      };
      triggerDownload(
        `locket-backup-${todayStamp()}.locket`,
        JSON.stringify(payload, null, 2)
      );
      setMessage({ text: "Backup downloaded.", tone: "info" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Export failed. Please try again.", tone: "error" });
    }
  };

  const handleImportClick = () => {
    setMessage(null);
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<BackupFile>;
      if (
        parsed.format !== "locket-backup" ||
        typeof parsed.salt !== "string" ||
        typeof parsed.iv !== "string" ||
        typeof parsed.ciphertext !== "string"
      ) {
        setMessage({
          text: "That file does not look like a Locket backup.",
          tone: "error"
        });
        return;
      }
      setConfirmImport(parsed as BackupFile);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Could not read that file.", tone: "error" });
    }
  };

  const performImport = async () => {
    if (!confirmImport) return;
    try {
      const record: Omit<AccountRecord, "id"> = {
        version: confirmImport.version ?? 1,
        salt: base64ToBytes(confirmImport.salt),
        iv: base64ToBytes(confirmImport.iv),
        ciphertext: base64ToBytes(confirmImport.ciphertext)
      };
      await saveAccount(record);
      setConfirmImport(null);
      lockSession(dispatch);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setConfirmImport(null);
      setMessage({ text: "Import failed. Please try again.", tone: "error" });
    }
  };

  const performDeleteAccount = async () => {
    setConfirmDeleteAccount(false);
    try {
      await clearAccount();
      clearLocalAccount(dispatch);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage({
        text: "Could not delete account. Please try again.",
        tone: "error"
      });
    }
  };

  return (
    <section>
      <div className="panel-header">
        <h1 className="panel-title">Settings</h1>
      </div>

      <div className="settings-grid">
        <article className="settings-block">
          <h2 className="settings-block__title">Profile</h2>
          <dl className="settings-list">
            <div>
              <dt>User name</dt>
              <dd>{profile?.name ?? "—"}</dd>
            </div>
          </dl>
        </article>

        <article className="settings-block">
          <h2 className="settings-block__title">Install</h2>
          {isInstalled ? (
            <p className="settings-help">
              Locket is installed on this device.
            </p>
          ) : canInstall ? (
            <>
              <p className="settings-help">
                Install Locket as an app so you can launch it from your home
                screen or applications menu and use it without a browser tab.
              </p>
              <div className="settings-actions">
                <button
                  className="sbd-btn sbd-btn--primary"
                  onClick={install}
                >
                  Install Locket
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="settings-help">To install Locket:</p>
              <ul className="settings-help-list">
                <li>
                  <strong>Chrome / Edge desktop:</strong> click the install
                  icon at the right of the address bar. If it isn&apos;t
                  visible, open the three-dot menu (top-right) →{" "}
                  <strong>Save and share</strong> (older Chrome:{" "}
                  <strong>Cast, save and share</strong>) →{" "}
                  <strong>Install page as an app</strong>.
                </li>
                <li>
                  <strong>Android Chrome:</strong> open the three-dot menu and
                  tap <strong>Install app</strong>.
                </li>
                <li>
                  <strong>iPhone / iPad Safari:</strong> tap the Share button
                  and choose <strong>Add to Home Screen</strong>.
                </li>
              </ul>
            </>
          )}
        </article>

        <article className="settings-block">
          <h2 className="settings-block__title">Backup</h2>
          <p className="settings-help">
            Download an encrypted backup of your diary. Save it somewhere safe
            or attach it to an email to use Locket on another device. You will
            need your password to unlock the backup wherever you open it.
          </p>
          <div className="settings-actions">
            <button
              className="sbd-btn sbd-btn--secondary"
              onClick={handleExport}
            >
              Export backup
            </button>
            <button
              className="sbd-btn sbd-btn--secondary"
              onClick={handleImportClick}
            >
              Import backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".locket,.json,application/json"
              onChange={handleFileChosen}
              style={{ display: "none" }}
            />
          </div>
        </article>

        <article className="settings-block">
          <h2 className="settings-block__title">Account</h2>
          <p className="settings-help">
            Log out to lock your diary. Coming back later just needs your
            password. Deleting your account erases the encrypted record from
            this device; without a backup it cannot be recovered.
          </p>
          <div className="settings-actions">
            <button
              className="sbd-btn sbd-btn--secondary"
              onClick={handleLogout}
            >
              Log out
            </button>
            <button
              className="sbd-btn sbd-btn--danger"
              onClick={() => setConfirmDeleteAccount(true)}
            >
              Delete account on this device
            </button>
          </div>
        </article>
      </div>

      {message && (
        <p
          className={`settings-message settings-message--${message.tone}`}
          role="status"
        >
          {message.text}
        </p>
      )}

      <ConfirmDialog
        show={!!confirmImport}
        title="Replace your diary?"
        message={
          <p>
            Importing this backup will replace the account currently on this
            device. You will be logged out and asked for the password of the
            imported backup. Continue?
          </p>
        }
        confirmLabel="Replace"
        onConfirm={performImport}
        onCancel={() => setConfirmImport(null)}
      />

      <ConfirmDialog
        show={confirmDeleteAccount}
        title="Delete your Locket?"
        message={
          <p>
            This will permanently erase your encrypted diary from this device.
            Without a backup it cannot be recovered.
          </p>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={performDeleteAccount}
        onCancel={() => setConfirmDeleteAccount(false)}
      />
    </section>
  );
}
