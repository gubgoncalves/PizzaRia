import { useNavigate } from "react-router-dom";
import "../styles/card.css";

function PizzaCard({ pizza }) {
  const navigate = useNavigate();
  const precoFormatado = (typeof pizza.preco === "number")
    ? pizza.preco.toFixed(2).replace(".", ",")
    : pizza.preco;

  return (
    <div className="pizza-card">
      <div
        className="pizza-img"
        style={{ backgroundImage: `url(${pizza.imagem})` }}
      >
      </div>

      <div className="pizza-content">
        <h3>{pizza.nome}</h3>
        <p>{pizza.descricao}</p>

        <div className="pizza-footer">
          <strong>R$ {precoFormatado}</strong>
          <button onClick={() => navigate("/novo-pedido", { state: { pizzaId: pizza.id } })}>
            Pedir
          </button>
        </div>
      </div>
    </div>
  );
}

export default PizzaCard;