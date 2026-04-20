import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterInvitePage from "./pages/RegisterInvitePage";
import GroupsPage from "./pages/GroupsPage";
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route path="/groups" element={<RequireAuth><GroupsPage /></RequireAuth>} />
          <Route path="/groups/:groupId" element={<RequireAuth><div className="p-8">Group view coming soon</div></RequireAuth>} />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
