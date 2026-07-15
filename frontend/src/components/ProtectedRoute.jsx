import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const usuarioLogado = sessionStorage.getItem("usuarioLogado");

  // se não tiver usuário salvo na sessão, manda pro login
  if (!usuarioLogado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;