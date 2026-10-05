import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { VmsProvider } from "./context/VmsContext.jsx";
import { AdminRoute, PrivateRoute, PublicOnlyRoute } from "./routes/guards.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import VmListPage from "./pages/VmListPage.jsx";
import VmFormPage from "./pages/VmFormPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <VmsProvider>
            <BrowserRouter>
              <Routes>
                {/* Ruta pública */}
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* Rutas privadas */}
                <Route element={<PrivateRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/vms" element={<VmListPage />} />
                    {/* Creación y edición: solo Administrador */}
                    <Route element={<AdminRoute />}>
                      <Route path="/vms/new" element={<VmFormPage />} />
                      <Route path="/vms/:id/edit" element={<VmFormPage />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </VmsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
