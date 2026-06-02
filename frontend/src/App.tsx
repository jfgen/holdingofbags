import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterInvitePage from "./pages/RegisterInvitePage";
import GroupsPage from "./pages/GroupsPage";
import GroupPage from "./pages/GroupPage";
import LandingPage from "./pages/LandingPage";
import { RequireAuth } from "./components/RequireAuth";

function RegisterRoute() {
  const [sp] = useSearchParams();
  return sp.get("invite") ? <RegisterInvitePage /> : <RegisterPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route path="/groups" element={<RequireAuth><GroupsPage /></RequireAuth>} />
          <Route path="/groups/:groupId" element={<RequireAuth><GroupPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
