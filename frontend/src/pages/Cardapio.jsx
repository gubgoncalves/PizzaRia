import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { listarPizzas } from "../services/api";

function Cardapio() {
  const navigate = useNavigate();
  const [pizzas, setPizzas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  function pedirPizza(pizza) {
    navigate("/novo-pedido", { state: { pizzaId: pizza.id } });
  }

  useEffect(() => {
    async function fetchPizzas() {
      try {
        const { resposta, dados } = await listarPizzas();
        if (resposta.ok) {
          setPizzas(Array.isArray(dados) ? dados : []);
        }
      } catch (err) {
        console.error("Erro ao carregar cardápio:", err);
      } finally {
        setCarregando(false);
      }
    }
    fetchPizzas();
  }, []);

  return (
    <DashboardLayout>
      <div className="home-top">
        <div className="welcome">
          <h1>Cardápio Completo 🍕</h1>
          <p>Todas as nossas pizzas disponíveis</p>
        </div>
        <button className="menu-btn" onClick={() => navigate("/novo-pedido")}>
          Fazer pedido
        </button>
      </div>

      {carregando ? (
        <p style={{ color: "#888", fontSize: 18 }}>Carregando cardápio...</p>
      ) : pizzas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>🍕</div>
          <h2 style={{ color: "#5a3d2b" }}>Nenhuma pizza no cardápio</h2>
        </div>
      ) : (
        <>
          <div className="section-title">
            <h2>Pizzas ({pizzas.length})</h2>
          </div>

          <div className="pizza-grid">
            {pizzas.map((pizza) => (
              <div className="pizza-card" key={pizza.id}>
                <div className="pizza-img" style={{ backgroundImage: `url(${pizza.imagem})` }}></div>
                <div className="pizza-content">
                  <h3>{pizza.nome}</h3>
                  <p>{pizza.descricao}</p>
                  <div className="pizza-footer">
                    <strong>R$ {pizza.preco.toFixed(2).replace(".", ",")}</strong>
                    <button onClick={() => pedirPizza(pizza)}>
                      Pedir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 30, marginBottom: 20 }}>
            <button
              className="menu-btn"
              onClick={() => navigate("/novo-pedido")}
              style={{ background: "#341608", boxShadow: "0 10px 25px rgba(52,22,8,.35)" }}
            >
              🛒 Fazer pedido agora
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Cardapio;