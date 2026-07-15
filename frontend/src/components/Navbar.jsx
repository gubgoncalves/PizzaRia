import { useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Início", icon: "🏠", path: "/home" },
    { label: "Cardápio", icon: "🍕", path: "/cardapio" },
    { label: "Meus Pedidos", icon: "📦", path: "/meus-pedidos" },
    { label: "Carrinho", icon: "🛒", path: "/novo-pedido" },
    { label: "Meu Perfil", icon: "👤", path: "/perfil" },
  ];

  function sair() {
    sessionStorage.removeItem("usuarioLogado");
    navigate("/");
  }

  return (
    <aside className="sidebar">
      <div className="logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
        🍕 PizzaRia
      </div>

      <nav>
        {links.map((link) => (
          <button
            key={link.path}
            className={location.pathname === link.path ? "active" : ""}
            onClick={() => navigate(link.path)}
          >
            {link.icon} {link.label}
          </button>
        ))}
      </nav>

      <button className="logout" onClick={sair}>
        🚪 Sair
      </button>
    </aside>
  );
}

export default Navbar;