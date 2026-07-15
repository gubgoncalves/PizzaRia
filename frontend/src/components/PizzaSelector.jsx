function PizzaSelector({ pizzas, pedido, onSelecionar }) {
  return (
    <div className="wizard-section">
      <h2 className="wizard-title">🍕 Escolha o sabor</h2>
      <div className="sabor-grid">
        {pizzas.map((pizza) => {
          const selecionado = pedido.sabor?.id === pizza.id;
          return (
            <div
              key={pizza.id}
              className={`sabor-card ${selecionado ? "sabor-selecionado" : ""}`}
              onClick={() => onSelecionar(pizza)}
            >
              <div className="sabor-img" style={{ backgroundImage: `url(${pizza.imagem})` }} />
              <div className="sabor-info">
                <h3>{pizza.nome}</h3>
                <p>{pizza.descricao}</p>
                <div className="sabor-footer">
                  <strong>R$ {pizza.preco.toFixed(2).replace(".", ",")}</strong>
                  {selecionado ? (
                    <span className="sabor-check">✓</span>
                  ) : (
                    <button
                      className="sabor-btn"
                      onClick={(e) => { e.stopPropagation(); onSelecionar(pizza); }}
                    >
                      Selecionar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PizzaSelector;