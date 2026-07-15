const ADICIONAIS = [
  { nome: "Catupiry", preco: 5.0 },
  { nome: "Bacon", preco: 6.0 },
  { nome: "Cheddar", preco: 4.0 },
  { nome: "Extra queijo", preco: 5.0 },
];

function ExtrasSelector({ pedido, onToggle }) {
  function isSelected(nome) {
    return pedido.adicionais.some((a) => a.nome === nome);
  }

  return (
    <div className="wizard-section">
      <h2 className="wizard-title">🧀 Adicionais</h2>
      <p className="wizard-subtitle">Escolha os ingredientes extras (opcional)</p>
      <div className="adicionais-grid">
        {ADICIONAIS.map((adicional) => {
          const marcado = isSelected(adicional.nome);
          return (
            <label
              key={adicional.nome}
              className={`adicional-card ${marcado ? "adicional-marcado" : ""}`}
            >
              <div className="adicional-checkbox">
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={() => onToggle(adicional)}
                />
                <span className={`checkmark ${marcado ? "check-ativo" : ""}`}>
                  {marcado ? "✓" : ""}
                </span>
              </div>
              <span className="adicional-nome">{adicional.nome}</span>
              <span className="adicional-preco">+ R$ {adicional.preco.toFixed(2).replace(".", ",")}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default ExtrasSelector;