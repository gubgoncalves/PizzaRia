const TAMANHOS = [
  { nome: "Pequena", preco: 0, cm: "25cm" },
  { nome: "Média", preco: 10, cm: "30cm" },
  { nome: "Grande", preco: 20, cm: "35cm" },
];

function SizeSelector({ pedido, onSelecionar }) {
  return (
    <div className="wizard-section">
      <h2 className="wizard-title">📏 Escolha o tamanho</h2>
      <div className="tamanho-grid">
        {TAMANHOS.map((t) => {
          const selecionado = pedido.tamanho?.nome === t.nome;
          return (
            <div
              key={t.nome}
              className={`tamanho-card ${selecionado ? "tamanho-selecionado" : ""}`}
              onClick={() => onSelecionar(t)}
            >
              <div className="tamanho-radio">
                <div className={`radio-circle ${selecionado ? "radio-checked" : ""}`}>
                  {selecionado && <div className="radio-dot" />}
                </div>
              </div>
              <div className="tamanho-info">
                <h3>{t.nome}</h3>
                <span className="tamanho-cm">{t.cm}</span>
              </div>
              <div className="tamanho-preco">
                {t.preco === 0 ? (
                  <span className="preco-gratis">Grátis</span>
                ) : (
                  <strong>+ R$ {t.preco.toFixed(2).replace(".", ",")}</strong>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SizeSelector;