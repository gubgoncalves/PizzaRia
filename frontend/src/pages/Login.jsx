import "../styles/login.css";
import "../styles/forms.css";

import bgImg from "../assets/background_limpo.png";
import AuthLayout from "../components/AuthLayout";
import AuthForm from "../components/AuthForm";

function Login() {
  return (
    <div
      className="page-wrapper"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <AuthLayout />
      <AuthForm mode="login" />

      <footer className="page-footer">
        &copy; 2026 PizzaRia. Todos os direitos reservados.
      </footer>
    </div>
  );
}

export default Login;