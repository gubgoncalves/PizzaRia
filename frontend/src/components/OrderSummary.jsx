function OrderSummary({ pedido, calcularTotal }) {
  if (!pedido.sabor) return null;

  const total = calcularTotal();
  const temAdicionais = pedido.adicionais.length > 0;
  const temTamanho = pedido.tamanho !== null;

  return (
    <div className="wizard-section">
      <h2 className="wizard-title">📋 Resumo do pedido</h2>
      <div className="resumo-card">
        <div className="resumo-linha">
          <span className="resumo-label">Pizza</span>
          <span className="resumo-valor">{pedido.sabor.nome}</span>
        </div>
        <div className="resumo-linha">
          <span className="resumo-label">Preço base</span>
          <span className="resumo-valor">R$ {pedido.sabor.preco.toFixed(2).replace(".", ",")}</span>
        </div>
        {temTamanho && (
          <div className="resumo-linha">
            <span className="resumo-label">Tamanho</span>
            <span className="resumo-valor">{pedido.tamanho.nome} {pedido.tamanho.cm || ""}</span>
          </div>
        )}
        {temTamanho && pedido.tamanho.preco > 0 && (
          <div className="resumo-linha">
            <span className="resumo-label">+ Tamanho</span>
            <span className="resumo-valor">R$ {pedido.tamanho.preco.toFixed(2).replace(".", ",")}</span>
          </div>
        )}
        {temAdicionais && (
          <div className="resumo-linha">
            <span className="resumo-label">Adicionais</span>
            <span className="resumo-valor">{pedido.adicionais.map(a => a.nome).join(", ")}</span>
          </div>
        )}
        {temAdicionais && (
          <div className="resumo-linha">
            <span className="resumo-label">+ Adicionais</span>
            <span className="resumo-valor">
              R$ {pedido.adicionais.reduce((acc, a) => acc + a.preco, 0).toFixed(2).replace(".", ",")}
            </span>
          </div>
        )}
        <div className="resumo-divisor" />
        <div className="resumo-linha resumo-total">
          <span className="resumo-label">Total</span>
          <span className="resumo-valor-total">
            R$ {total.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;