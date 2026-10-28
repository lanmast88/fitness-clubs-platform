import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

/** Пускает дальше только авторизованного пользователя. */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0B10] text-slate-400">
        Проверяем сессию…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;
