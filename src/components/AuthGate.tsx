import { useAppSelector } from "../hooks";
import { Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";

export default function AuthGate() {
  const status = useAppSelector((state) => state.auth.status);

  if (status === "booting") {
    return (
      <main className="auth-shell">
        <p className="auth-loading">Loading...</p>
      </main>
    );
  }

  if (status === "unavailable") {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <h1 className="auth-card__brand">Locket</h1>
          <p className="auth-card__subtitle">
            Your browser does not have storage available. Locket needs
            IndexedDB to keep your diary safe on this device. Try a different
            browser or turn off private/incognito mode.
          </p>
        </section>
      </main>
    );
  }

  if (status === "unlocked") {
    return <Navigate to="/home" replace />;
  }

  return status === "no-account" ? <Signup /> : <Login />;
}
