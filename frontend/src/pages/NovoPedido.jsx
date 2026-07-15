import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import PizzaSelector from "../components/PizzaSelector";
import SizeSelector from "../components/SizeSelector";
import ExtrasSelector from "../components/ExtrasSelector";
import OrderSummary from "../components/OrderSummary";
import { listarPizzas, criarPedido, buscarPerfil } from "../services/api";
import "../styles/novo-pedido.css";

const ETAPAS = ["sabor", "tamanho", "adicionais", "resumo"];

function statusEtapa(etapa, atual) {
  const indices = { sabor: 0, tamanho: 1, adicionais: 2, resumo: 3 };
  const i = indices[etapa];
  const a = indices[atual];
  if (i < a) return "concluido";
  if (i === a) return "ativo";
  return "";
}

function NovoPedido() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado")) || {};

  const [pizzas, setPizzas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [etapa, setEtapa] = useState("sabor");

  // CARRINHO — itens já configurados e prontos pra enviar (persistido via sessionStorage)
  const [carrinho, setCarrinho] = useState(() => {
    try {
      const saved = sessionStorage.getItem("pizzaria_carrinho");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // PEDIDO EM MONTAGEM — pizza atual sendo configurada
  const [pedido, setPedido] = useState({
    sabor: null,
    tamanho: null,
    adicionais: [],
  });

  // CHECKOUT
  const [endereco, setEndereco] = useState("");
  const [enderecoDetalhado, setEnderecoDetalhado] = useState({
    cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "", complemento: ""
  });
  const [enderecoCompleto, setEnderecoCompleto] = useState("");
  const [enderecoDoPerfil, setEnderecoDoPerfil] = useState(false);
  const [numeroExtraidoDoPerfil, setNumeroExtraidoDoPerfil] = useState(false);
  const [cepCarregando, setCepCarregando] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [enviando, setEnviando] = useState(false);
  const [etapaCheckout, setEtapaCheckout] = useState(false);
  const [etapaCarrinho, setEtapaCarrinho] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  const formasPagamento = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Pix"];

  // Persistir carrinho no sessionStorage — sobrevive à navegação entre páginas
  useEffect(() => {
    try {
      sessionStorage.setItem("pizzaria_carrinho", JSON.stringify(carrinho));
    } catch { /* quota excedida, ignora */ }
  }, [carrinho]);

  useEffect(() => {
    if (!usuario.id) {
      navigate("/");
      return;
    }
    async function fetchDados() {
      try {
        const { resposta, dados } = await listarPizzas();
        if (resposta.ok) {
          const lista = Array.isArray(dados) ? dados : [];
          setPizzas(lista);

          // Se veio do cardápio com pizzaId, pré-seleciona o sabor
          const state = location.state;
          if (state?.pizzaId && lista.length > 0) {
            const pizzaSelecionada = lista.find(p => p.id === state.pizzaId);
            if (pizzaSelecionada) {
              setPedido({ sabor: pizzaSelecionada, tamanho: null, adicionais: [] });
              setEtapa("tamanho");
            }
            // Limpa o state pra não re-trigger em re-renders
            window.history.replaceState({}, document.title);
          }
        }

        // Carregar endereço do perfil
        const perfilRes = await buscarPerfil(usuario.id);
        if (perfilRes.resposta.ok && perfilRes.dados.endereco_padrao) {
          const enderecoSalvo = perfilRes.dados.endereco_padrao;
          setEndereco(enderecoSalvo);
          setEnderecoDoPerfil(true);

          // Verificar se o endereço já tem número e pré-preenche
          const partes = enderecoSalvo.split(",");
          if (partes.length > 1 && partes[1].trim().match(/^\d+/)) {
            // Extrai o número: "Rua Augusta, 123 - Centro, SP" → "123"
            const numMatch = partes[1].trim().match(/^(\d+)/);
            if (numMatch) {
              setEnderecoDetalhado(prev => ({ ...prev, numero: numMatch[1] }));
              setNumeroExtraidoDoPerfil(true);
            }
            setEnderecoCompleto(enderecoSalvo); // Já tem número, usa direto
          } else {
            setEnderecoCompleto(enderecoSalvo); // Sem número, mostra o endereço base
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setCarregando(false);
      }
    }
    fetchDados();
  }, []);

  // ========== LÓGICA DO WIZARD DE MONTAGEM ==========

  function selecionarSabor(pizza) {
    setPedido({ ...pedido, sabor: pizza });
    setEtapa("tamanho");
  }

  function selecionarTamanho(tamanho) {
    setPedido({ ...pedido, tamanho });
  }

  function toggleAdicional(adicional) {
    const jaTem = pedido.adicionais.some((a) => a.nome === adicional.nome);
    if (jaTem) {
      setPedido({ ...pedido, adicionais: pedido.adicionais.filter((a) => a.nome !== adicional.nome) });
    } else {
      setPedido({ ...pedido, adicionais: [...pedido.adicionais, adicional] });
    }
  }

  function calcularTotal() {
    let total = pedido.sabor.preco;
    if (pedido.tamanho) total += pedido.tamanho.preco;
    pedido.adicionais.forEach((a) => (total += a.preco));
    return total;
  }

  /** Adiciona a pizza configurada ao carrinho */
  function adicionarAoCarrinho() {
    if (!pedido.sabor) return;
    const item = {
      pizza: pedido.sabor.nome,
      tamanho: pedido.tamanho ? pedido.tamanho.nome : "Pequena",
      adicionais: pedido.adicionais.map((a) => a.nome),
      valor: calcularTotal(),
    };
    setCarrinho([...carrinho, item]);
    // Resetar pedido pra continuar montando
    setPedido({ sabor: null, tamanho: null, adicionais: [] });
    setEtapa("sabor");
  }

  function removerDoCarrinho(index) {
    setCarrinho(carrinho.filter((_, i) => i !== index));
  }

  function avancarEtapa() {
    const idx = ETAPAS.indexOf(etapa);
    if (idx < ETAPAS.length - 1) setEtapa(ETAPAS[idx + 1]);
  }

  function voltarEtapa() {
    const idx = ETAPAS.indexOf(etapa);
    if (idx > 0) setEtapa(ETAPAS[idx - 1]);
  }

  // ========== CHECKOUT ==========

  async function handleBuscarCep() {
    const cep = enderecoDetalhado.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      setCepErro("CEP deve ter 8 dígitos");
      return;
    }
    setCepCarregando(true);
    setCepErro("");
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      const dados = await res.json();
      if (!res.ok) {
        setCepErro(dados.message || "CEP não encontrado");
      } else {
        setEnderecoDetalhado((prev) => ({
          ...prev,
          rua: dados.street || "",
          bairro: dados.neighborhood || "",
          cidade: dados.city || "",
          estado: dados.state || "",
        }));
        setEnderecoCompleto(`${dados.street || "Rua não informada"}, `);
        setEnderecoDoPerfil(false);
      }
    } catch {
      setCepErro("Erro ao consultar CEP");
    } finally {
      setCepCarregando(false);
    }
  }

  function montarEnderecoCompleto() {
    const { rua, numero, bairro, cidade, estado, complemento } = enderecoDetalhado;
    const partes = [];
    if (rua) partes.push(rua);
    if (numero) partes.push(`, ${numero}`);
    if (complemento) partes.push(` - ${complemento}`);
    if (bairro || cidade) {
      const local = [bairro, cidade].filter(Boolean).join(" - ");
      partes.push(`, ${local}`);
    }
    if (estado) partes.push(`/${estado}`);
    setEnderecoCompleto(partes.join(""));
    setEndereco(partes.join(""));
    setEnderecoDoPerfil(false);
  }

  function montarEnderecoCompletoComNumero(numero) {
    const { rua, bairro, cidade, estado } = enderecoDetalhado;
    const partes = [];
    if (rua) partes.push(rua);
    if (numero) partes.push(`, ${numero}`);
    if (bairro) partes.push(` - ${bairro}`);
    if (cidade) partes.push(`, ${cidade}`);
    if (estado) partes.push(`/${estado}`);
    setEnderecoCompleto(partes.join(""));
  }

  async function handleFinalizar() {
    if (carrinho.length === 0) {
      alert("Adicione pelo menos uma pizza ao carrinho!");
      return;
    }
    const enderecoFinal = enderecoCompleto || endereco;
    if (!enderecoFinal || !enderecoFinal.trim()) {
      alert("Informe o endereço de entrega!");
      return;
    }

    setEnviando(true);
    try {
      const { resposta, dados } = await criarPedido({
        usuario_id: usuario.id,
        itens: carrinho,
        endereco: enderecoFinal.trim(),
        forma_pagamento: formaPagamento,
      });

      if (resposta.ok) {
        setPedidoConfirmado(true);
        setCarrinho([]);
        setEndereco("");
        setEnderecoCompleto("");
        setEnderecoDoPerfil(false);
        setEtapaCheckout(false);
      } else {
        alert(dados.erro || "Erro ao realizar pedido");
      }
    } catch {
      alert("Erro ao conectar ao servidor");
    } finally {
      setEnviando(false);
    }
  }

  function totalCarrinho() {
    return carrinho.reduce((acc, item) => acc + item.valor, 0);
  }

  // ========== RENDER ==========

  // TELA DE CONFIRMAÇÃO
  if (pedidoConfirmado) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
          <h1 style={{ color: "#341608", marginBottom: 10 }}>Pedido realizado com sucesso!</h1>
          <p style={{ color: "#777", fontSize: 18, marginBottom: 30 }}>
            Seu pedido já está sendo preparado. Em breve chegará até você!
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="menu-btn" onClick={() => navigate("/meus-pedidos")}>
              Acompanhar pedido
            </button>
            <button
              className="menu-btn"
              style={{ background: "#341608", boxShadow: "0 10px 25px rgba(52,22,8,.35)" }}
              onClick={() => {
                setPedidoConfirmado(false);
                setPedido({ sabor: null, tamanho: null, adicionais: [] });
                setEtapa("sabor");
              }}
            >
              Novo pedido
            </button>
            <button
              className="menu-btn"
              style={{ background: "#555", boxShadow: "none" }}
              onClick={() => navigate("/home")}
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ========== TELA DE CHECKOUT (SIMPLIFICADA) ==========
    if (etapaCheckout) {
      return (
        <DashboardLayout>
          <div className="home-top">
            <div className="welcome">
              <h1>Finalizar Pedido 🛒</h1>
              <p>Confirme o endereço e forma de pagamento</p>
            </div>
          </div>

          <div className="orders">
            <h2 style={{ margin: "0 0 20px", color: "#341608" }}>Itens do pedido</h2>
            {carrinho.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "12px 0", borderBottom: "1px solid #f0f0f0",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong>{item.pizza}</strong>
                  {item.tamanho && <span style={{ color: "#888", marginLeft: 8 }}>({item.tamanho})</span>}
                  {item.adicionais.length > 0 && (
                    <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                      + {item.adicionais.join(", ")}
                    </div>
                  )}
                </div>
                <strong style={{ color: "#d53a24" }}>
                  R$ {item.valor.toFixed(2).replace(".", ",")}
                </strong>
              </div>
            ))}
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <span style={{ color: "#888" }}>Total: </span>
              <strong style={{ fontSize: 24, color: "#d53a24" }}>
                R$ {totalCarrinho().toFixed(2).replace(".", ",")}
              </strong>
            </div>
          </div>

          <div style={{ marginTop: 25, maxWidth: 500 }}>
            {/* ENDEREÇO — simplificado: mostra o endereço do perfil + só pede número */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="usarEndPerfil"
                  checked={enderecoDoPerfil}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (!endereco || !endereco.trim()) {
                        alert("Você não possui endereço cadastrado no perfil. Vá em Meu Perfil para cadastrar um endereço primeiro.");
                        return;
                      }
                      setEnderecoDoPerfil(true);
                      setEnderecoDetalhado({ cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "", complemento: "" });
                      // Re-extrair número do endereço, se já estiver presente
                      const partes = endereco.split(",");
                      if (partes.length > 1 && partes[1].trim().match(/^\d+/)) {
                        const numMatch = partes[1].trim().match(/^(\d+)/);
                        if (numMatch) {
                          setEnderecoDetalhado(prev => ({ ...prev, numero: numMatch[1] }));
                          setNumeroExtraidoDoPerfil(true);
                        }
                      }
                      setEnderecoCompleto(endereco);
                    } else {
                      setEnderecoDoPerfil(false);
                      setEnderecoDetalhado({ cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "", complemento: "" });
                      setEnderecoCompleto("");
                      setNumeroExtraidoDoPerfil(false);
                    }
                  }}
                  style={{ width: 20, height: 20, cursor: "pointer" }}
                />
                <label htmlFor="usarEndPerfil" style={{ fontWeight: 600, color: "#341608", cursor: "pointer", fontSize: 15 }}>
                  Usar endereço do meu perfil
                </label>
              </div>

              {enderecoDoPerfil ? (
                <>
                  <div style={{
                    background: "#e8f5e9", padding: "12px 16px", borderRadius: 10,
                    border: "1px solid #c8e6c9", marginBottom: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>📍</span>
                      <strong style={{ color: "#2e7d32", fontSize: 14 }}>Endereço padrão</strong>
                    </div>
                    <span style={{ color: "#341608", fontSize: 14 }}>{endereco}</span>
                  </div>

                  {numeroExtraidoDoPerfil ? (
                    <div style={{
                      background: "#e8f5e9", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #c8e6c9", display: "flex", alignItems: "center", gap: 8, marginBottom: 6
                    }}>
                      <span style={{ fontSize: 18 }}>✅</span>
                      <span style={{ color: "#2e7d32", fontSize: 14, fontWeight: 500 }}>
                        Número já cadastrado no perfil
                      </span>
                    </div>
                  ) : (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Número da casa</label>
                      <div className="input-wrapper">
                        <input
                          type="text" placeholder="Nº (ex: 123)"
                          value={enderecoDetalhado.numero}
                          onChange={e => {
                            const num = e.target.value;
                            setEnderecoDetalhado(prev => ({ ...prev, numero: num }));
                            // Atualizar enderecoCompleto com o número
                            const endPartes = endereco.split(",");
                            if (endPartes.length > 0) {
                              const rua = endPartes[0].trim();
                              const resto = endPartes.slice(1).join(",");
                              setEnderecoCompleto(num ? `${rua}, ${num}${resto}` : endereco);
                            }
                          }}
                          style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15 }}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
                    Informe outro CEP para entrega
                  </p>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                      <label>CEP</label>
                      <div className="input-wrapper">
                        <input
                          type="text" placeholder="00000-000"
                          value={enderecoDetalhado.cep}
                          onChange={e => {
                            const cep = e.target.value;
                            setEnderecoDetalhado({ ...enderecoDetalhado, cep });
                            if (cep.replace(/\D/g, "").length === 8) {
                              // Auto-busca
                              handleBuscarCep();
                            }
                          }}
                          maxLength={9}
                          style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15 }}
                        />
                      </div>
                    </div>
                    <button
                      className="menu-btn"
                      onClick={handleBuscarCep}
                      disabled={cepCarregando}
                      style={{ marginTop: 26, padding: "12px 24px", opacity: cepCarregando ? 0.6 : 1, background: "#341608" }}
                    >
                      {cepCarregando ? "Buscando..." : "Buscar"}
                    </button>
                  </div>
                  {cepErro && <p style={{ color: "#d0312d", fontSize: 14, margin: 0 }}>⚠️ {cepErro}</p>}

                  {enderecoDetalhado.rua && (
                    <>
                      <div style={{
                        background: "#f5f5f5", padding: "12px 16px", borderRadius: 10,
                        border: "1px solid #e0e0e0"
                      }}>
                        <strong style={{ color: "#341608", display: "block", marginBottom: 4 }}>
                          {enderecoDetalhado.rua}
                        </strong>
                        <span style={{ color: "#888", fontSize: 13 }}>
                          {[enderecoDetalhado.bairro, enderecoDetalhado.cidade].filter(Boolean).join(" - ")}
                          {enderecoDetalhado.estado && ` / ${enderecoDetalhado.estado}`}
                        </span>
                      </div>

                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Número da casa</label>
                        <div className="input-wrapper">
                          <input
                            type="text" placeholder="Nº (ex: 123)"
                            value={enderecoDetalhado.numero}
                            onChange={e => {
                              const num = e.target.value;
                              setEnderecoDetalhado(prev => ({ ...prev, numero: num }));
                              montarEnderecoCompletoComNumero(num);
                            }}
                            style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15 }}
                          />
                        </div>
                      </div>

                      {enderecoDetalhado.numero && (
                        <div style={{ background: "#fff3e0", padding: "10px 14px", borderRadius: 10, border: "1px solid #ffe0b2" }}>
                          <strong style={{ color: "#e65100", display: "block", marginBottom: 4, fontSize: 13 }}>Endereço de entrega:</strong>
                          <span style={{ color: "#341608", fontSize: 14 }}>{enderecoCompleto}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* FORMA DE PAGAMENTO — sempre visível se tiver endereço configurado */}
            {(enderecoDoPerfil && enderecoDetalhado.numero) || (!enderecoDoPerfil && enderecoCompleto) ? (
              <>
                <div className="input-group" style={{ marginBottom: 0, marginTop: 20 }}>
                  <label>Forma de pagamento</label>
                  <div className="input-wrapper">
                    <select
                      value={formaPagamento}
                      onChange={e => setFormaPagamento(e.target.value)}
                      style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15, fontWeight: 600, color: "#341608", cursor: "pointer" }}
                    >
                      {formasPagamento.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 25 }}>
                  <button
                    className="menu-btn"
                    style={{ background: "#555", boxShadow: "none" }}
                    onClick={() => setEtapaCheckout(false)}
                  >
                    Voltar
                  </button>
                  <button
                    className="menu-btn"
                    onClick={handleFinalizar}
                    disabled={enviando}
                    style={{ opacity: enviando ? 0.6 : 1, flex: 1 }}
                  >
                    {enviando ? "Finalizando..." : `Confirmar pedido • R$ ${totalCarrinho().toFixed(2).replace(".", ",")}`}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </DashboardLayout>
      );
    }

    // ========== TELA CARRINHO ==========
    if (etapaCarrinho) {
      return (
        <DashboardLayout>
          <div className="home-top">
            <div className="welcome">
              <h1>🛒 Carrinho</h1>
              <p>Revise os itens antes de finalizar</p>
            </div>
          </div>

          {carrinho.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
              <h2 style={{ color: "#341608", marginBottom: 10 }}>Seu carrinho está vazio</h2>
              <p style={{ color: "#888", marginBottom: 24, fontSize: 16 }}>
                Adicione pizzas deliciosas ao carrinho!
              </p>
              <button className="menu-btn" onClick={() => { setEtapaCarrinho(false); }}>
                🍕 Montar pizza
              </button>
            </div>
          ) : (
            <div className="orders">
              {carrinho.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "14px 12px", borderBottom: "1px solid #f0f0f0",
                    alignItems: "center", background: i % 2 === 0 ? "#fafafa" : "transparent",
                    borderRadius: 8
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ color: "#341608", fontSize: 16 }}>{item.pizza}</strong>
                      {item.tamanho && (
                        <span style={{ background: "#f0e6d9", padding: "2px 8px", borderRadius: 12, fontSize: 12, color: "#553b31" }}>
                          {item.tamanho}
                        </span>
                      )}
                    </div>
                    {item.adicionais.length > 0 && (
                      <div style={{ fontSize: 13, color: "#888", marginTop: 4, marginLeft: 2 }}>
                        <span style={{ color: "#341608", fontWeight: 500 }}>+ </span>
                        {item.adicionais.join(", ")}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <strong style={{ color: "#d53a24", fontSize: 17 }}>
                      R$ {item.valor.toFixed(2).replace(".", ",")}
                    </strong>
                    <button
                      onClick={() => removerDoCarrinho(i)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#d0312d", fontSize: 20, padding: "4px 8px",
                        borderRadius: 6, lineHeight: 1
                      }}
                      title="Remover item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "18px 12px", marginTop: 8
              }}>
                <span style={{ color: "#888", fontSize: 15 }}>Total do pedido</span>
                <strong style={{ fontSize: 28, color: "#d53a24" }}>
                  R$ {totalCarrinho().toFixed(2).replace(".", ",")}
                </strong>
              </div>

              <div style={{
                display: "flex", gap: 12, marginTop: 20
              }}>
                <button
                  className="menu-btn"
                  style={{ background: "#555", boxShadow: "none", flex: 1 }}
                  onClick={() => setEtapaCarrinho(false)}
                >
                  ← Continuar montando
                </button>
                <button
                  className="menu-btn"
                  style={{
                    background: "#2e7d32", boxShadow: "0 10px 25px rgba(46,125,50,.35)",
                    flex: 1
                  }}
                  onClick={() => {
                    if (carrinho.length === 0) {
                      alert("Carrinho vazio!");
                      return;
                    }
                    setEtapaCarrinho(false);
                    setEtapaCheckout(true);
                  }}
                >
                  Finalizar pedido 🚀
                </button>
              </div>
            </div>
          )}
        </DashboardLayout>
      );
    }

  // ========== TELA PRINCIPAL — WIZARD ==========
  return (
    <DashboardLayout>
      {/* CABEÇALHO */}
      <div className="home-top">
        <div className="welcome">
          <h1>🍕 Monte sua Pizza</h1>
          <p>Escolha o sabor, tamanho e adicionais</p>
        </div>
      </div>

      {/* MINI CARRINHO — sempre visível */}
      {carrinho.length > 0 && (
        <div className="carrinho-mini">
          <div className="carrinho-mini-info">
            <span className="carrinho-mini-icon">🛒</span>
            <div className="carrinho-mini-text">
              <strong>{carrinho.length}</strong> pizza{carrinho.length > 1 ? "s" : ""} no carrinho
            </div>
          </div>
          <div className="carrinho-itens">
            {carrinho.map((item, i) => (
              <span key={i} className="carrinho-item-tag">
                {item.pizza} {item.tamanho && `(${item.tamanho})`}
                <span className="remover-item" onClick={() => removerDoCarrinho(i)}>×</span>
              </span>
            ))}
          </div>
          <button className="menu-btn" onClick={() => setEtapaCarrinho(true)} style={{ flexShrink: 0 }}>
            Revisar pedido • R$ {totalCarrinho().toFixed(2).replace(".", ",")}
          </button>
        </div>
      )}

      {/* STEP INDICATOR */}
      {pedido.sabor && (
        <div className="wizard-steps">
          {ETAPAS.map((e) => (
            <div key={e} className={`wizard-step ${statusEtapa(e, etapa)}`}>
              <span className="wizard-step-num">
                {statusEtapa(e, "resumo") === "concluido" ? "✓" : ETAPAS.indexOf(e) + 1}
              </span>
              {e === "sabor" ? "Sabor" : e === "tamanho" ? "Tamanho" : e === "adicionais" ? "Adicionais" : "Resumo"}
            </div>
          ))}
        </div>
      )}

      {/* CONTEÚDO DINÂMICO */}
      {carregando ? (
        <p style={{ color: "#888", fontSize: 18 }}>Carregando...</p>
      ) : (
        <>
          {/* ETAPA SABOR */}
          {etapa === "sabor" && (
            <>
              <PizzaSelector pizzas={pizzas} pedido={pedido} onSelecionar={selecionarSabor} />
              {pedido.sabor && (
                <div className="wizard-botoes">
                  <span />
                  <button className="menu-btn" onClick={avancarEtapa}>
                    Continuar →
                  </button>
                </div>
              )}
            </>
          )}

          {/* ETAPA TAMANHO */}
          {etapa === "tamanho" && (
            <>
              <SizeSelector pedido={pedido} onSelecionar={selecionarTamanho} />
              <div className="wizard-botoes">
                <button className="menu-btn" style={{ background: "#555", boxShadow: "none" }} onClick={voltarEtapa}>
                  ← Voltar
                </button>
                <button className="menu-btn" onClick={avancarEtapa}>
                  Continuar →
                </button>
              </div>
            </>
          )}

          {/* ETAPA ADICIONAIS */}
          {etapa === "adicionais" && (
            <>
              <ExtrasSelector pedido={pedido} onToggle={toggleAdicional} />
              <div className="wizard-botoes">
                <button className="menu-btn" style={{ background: "#555", boxShadow: "none" }} onClick={voltarEtapa}>
                  ← Voltar
                </button>
                <button className="menu-btn" onClick={avancarEtapa}>
                  Ver resumo →
                </button>
              </div>
            </>
          )}

          {/* ETAPA RESUMO */}
          {etapa === "resumo" && (
            <>
              <OrderSummary pedido={pedido} calcularTotal={calcularTotal} />
              <div className="wizard-botoes">
                <button className="menu-btn" style={{ background: "#555", boxShadow: "none" }} onClick={voltarEtapa}>
                  ← Voltar
                </button>
                <button
                  className="menu-btn"
                  onClick={adicionarAoCarrinho}
                  style={{ background: "#2e7d32", boxShadow: "0 10px 25px rgba(46,125,50,.35)" }}
                >
                  🛒 Adicionar ao carrinho • R$ {calcularTotal().toFixed(2).replace(".", ",")}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default NovoPedido;