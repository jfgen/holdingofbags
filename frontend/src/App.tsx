import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { RequireAuth } from "./components/RequireAuth";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/groups" element={<RequireAuth><div className="p-8">Groups dashboard coming soon</div></RequireAuth>} />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
