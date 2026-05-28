import "./styles.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Archives from "./components/Archives";
import Favorites from "./components/Favorites";
import Layout from "./components/Layout";
import AuthGate from "./components/AuthGate";
import RequireAuth from "./components/RequireAuth";
import Settings from "./components/Settings";
import { useBootAuth } from "./hooks/useBootAuth";

export default function App() {
  useBootAuth();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthGate />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Layout>
                <Home />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/favorites"
          element={
            <RequireAuth>
              <Layout>
                <Favorites />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/archives"
          element={
            <RequireAuth>
              <Layout>
                <Archives />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Layout>
                <Settings />
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}
