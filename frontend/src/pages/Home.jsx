import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import PizzaCard from "../components/PizzaCard";
import { listarPizzas, listarPedidos } from "../services/api";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado")) || { nome: "Visitante" };

  const [pizzas, setPizzas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resPizzas, resPedidos] = await Promise.all([
          listarPizzas(),
          usuario.id ? listarPedidos(usuario.id) : Promise.resolve({ dados: [] }),
        ]);

        if (resPizzas.resposta.ok) {
          setPizzas(Array.isArray(resPizzas.dados) ? resPizzas.dados : []);
        }
        if (resPedidos.resposta && resPedidos.resposta.ok) {
          const lista = Array.isArray(resPedidos.dados) ? resPedidos.dados : [];
          setPedidos(lista);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da home:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const totalPedidos = pedidos.filter(p => p.status !== "Cancelado").length;
  const totalGasto = pedidos
    .filter(p => p.status !== "Cancelado")
    .reduce((acc, p) => acc + (p.total || 0), 0);
  const ultimosPedidos = pedidos.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="home-top">
        <div className="welcome">
          <h1>Olá, {usuario.nome}! 👋</h1>
          <p>O que vai pedir hoje?</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="menu-btn"
            style={{ background: "#d53a24" }}
            onClick={() => navigate("/novo-pedido")}
          >
            🍕 Fazer pedido
          </button>
          <button
            className="menu-btn"
            style={{ background: "#341608", boxShadow: "0 10px 25px rgba(52,22,8,.35)" }}
            onClick={() => navigate("/cardapio")}
          >
            Ver cardápio
          </button>
        </div>
      </div>

      {carregando ? (
        <p style={{ color: "#888", fontSize: 18 }}>Carregando...</p>
      ) : (
        <>
          <section className="stats">
            <div className="stat-card">
              <div className="stat-icon">🍕</div>
              <h2>{totalPedidos}</h2>
              <p>Pedidos realizados</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛍️</div>
              <h2>R$ {totalGasto.toFixed(2).replace(".", ",")}</h2>
              <p>Total gasto</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <h2>4.8</h2>
              <p>Avaliação média</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🕒</div>
              <h2>30-45 min</h2>
              <p>Tempo médio de entrega</p>
            </div>
          </section>

          <div className="section-title">
            <h2>Nossas Pizzas 🍕</h2>
            <span
              style={{ color: "#d53a24", fontWeight: 600, cursor: "pointer" }}
              onClick={() => navigate("/cardapio")}
            >
              Ver todas →
            </span>
          </div>

          <div className="pizza-grid">
            {pizzas.slice(0, 4).map((pizza) => (
              <PizzaCard key={pizza.id} pizza={pizza} />
            ))}
            {pizzas.length === 0 && (
              <p style={{ color: "#888", gridColumn: "1 / -1" }}>
                Nenhuma pizza disponível no momento.
              </p>
            )}
          </div>

          <section className="orders">
            <div className="orders-header">
              <h2>Meus últimos pedidos 📦</h2>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/meus-pedidos")}
              >
                Ver todos os pedidos →
              </span>
            </div>

            {ultimosPedidos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#888" }}>
                <p>Nenhum pedido ainda.</p>
                <button
                  className="menu-btn"
                  style={{ marginTop: 15 }}
                  onClick={() => navigate("/novo-pedido")}
                >
                  Fazer primeiro pedido
                </button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Data</th>
                    <th>Pizza</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosPedidos.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>#{p.id}</td>
                      <td>{p.data}</td>
                      <td>{p.pizzas ? (
                        Array.isArray(p.pizzas)
                          ? p.pizzas.map(pi => pi.nome).join(", ")
                          : p.itens
                            ? p.itens.map(item => `${item.pizza}${item.tamanho ? ` (${item.tamanho})` : ""}`).join(", ")
                            : "---"
                      ) : p.itens ? (
                        p.itens.map(item => `${item.pizza}${item.tamanho ? ` (${item.tamanho})` : ""}`).join(", ")
                      ) : (
                        "---"
                      )}</td>
                      <td style={{ fontWeight: 700, color: "#d53a24" }}>
                        R$ {p.total.toFixed(2).replace(".", ",")}
                      </td>
                      <td>
                        <span className={`status ${p.status === "Cancelado" ? "cancel" : "ok"}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}

export default Home;