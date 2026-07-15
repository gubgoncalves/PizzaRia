import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { buscarPerfil, atualizarPerfil, buscarCep } from "../services/api";

function Perfil() {
  const navigate = useNavigate();
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado")) || {};

  const [perfil, setPerfil] = useState({ nome: "", email: "", telefone: "", endereco_padrao: "" });
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", cep: "", endereco_padrao: "" });
  const [enderecoDetalhado, setEnderecoDetalhado] = useState({ rua: "", numero: "", bairro: "", cidade: "", estado: "" });
  const [cepBuscando, setCepBuscando] = useState(false);

  useEffect(() => {
    if (!usuario.id) {
      navigate("/");
      return;
    }
    async function fetchPerfil() {
      try {
        const { resposta, dados } = await buscarPerfil(usuario.id);
        if (resposta.ok) {
          setPerfil(dados);
          setForm(dados);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      } finally {
        setCarregando(false);
      }
    }
    fetchPerfil();
  }, []);

  async function handleSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const { resposta, dados } = await atualizarPerfil({
        usuario_id: usuario.id,
        ...form,
      });
      if (resposta.ok) {
        setPerfil(dados.usuario);
        setForm(dados.usuario);
        // Atualizar o sessionStorage com o novo nome
        const usuarioAtualizado = { ...usuario, nome: dados.usuario.nome };
        sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));
        setEditando(false);
        alert("Perfil atualizado com sucesso!");
      } else {
        alert(dados.erro || "Erro ao atualizar perfil");
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor");
    } finally {
      setSalvando(false);
    }
  }

  async function handleBuscarCep() {
    const cep = (form.cep || "").replace(/\D/g, "");
    if (cep.length !== 8) {
      alert("Digite um CEP válido com 8 dígitos");
      return;
    }
    setCepBuscando(true);
    try {
      const res = await buscarCep(cep);
      if (res.erro) {
        alert(res.erro);
        return;
      }
      const enderecoDet = { rua: res.rua || "", numero: "", bairro: res.bairro || "", cidade: res.cidade || "", estado: res.estado || "" };
      setEnderecoDetalhado(enderecoDet);
      const partes = [res.rua, "", res.bairro, res.cidade, res.estado].filter(Boolean);
      const enderecoStr = `${res.rua || "Rua não informada"}, ${res.bairro ? `${res.bairro} - ` : ""}${res.cidade}${res.estado ? `/${res.estado}` : ""}`;
      setForm(prev => ({ ...prev, endereco_padrao: enderecoStr }));
    } catch {
      alert("Erro ao consultar CEP");
    } finally {
      setCepBuscando(false);
    }
  }

  function handleNumeroChange(valor) {
    // Construir endereço completo a partir do enderecoDetalhado + novo número
    const rua = enderecoDetalhado.rua || "";
    const bairro = enderecoDetalhado.bairro || "";
    const cidade = enderecoDetalhado.cidade || "";
    const estado = enderecoDetalhado.estado || "";
    const partes = [];
    if (rua) partes.push(rua);
    if (valor) partes.push(`, ${valor}`);
    if (bairro) partes.push(` - ${bairro}`);
    if (cidade) partes.push(`, ${cidade}`);
    if (estado) partes.push(`/${estado}`);
    setEnderecoDetalhado(prev => ({ ...prev, numero: valor }));
    setForm(prev => ({ ...prev, endereco_padrao: partes.join("") }));
  }

  const infoRow = (label, value) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0", borderBottom: "1px solid #f0f0f0"
    }}>
      <span style={{ color: "#888", fontWeight: 500, fontSize: 15 }}>{label}</span>
      <span style={{ color: "#341608", fontWeight: 600, fontSize: 16 }}>{value || "—"}</span>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="home-top" style={{ maxWidth: 780, margin: "0 auto" }}>
        <div className="welcome">
          <h1>Meu Perfil 👤</h1>
          <p>Gerencie suas informações pessoais</p>
        </div>
        {!editando && (
          <button className="menu-btn" onClick={() => setEditando(true)}>
            Editar perfil
          </button>
        )}
      </div>

      {carregando ? (
        <p style={{ color: "#888" }}>Carregando...</p>
      ) : (
        <div className="orders" style={{ maxWidth: 780, margin: "0 auto" }}>
          {!editando ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 25 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "#d53a24", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 36, fontWeight: 700, margin: "0 auto 15px"
                }}>
                  {perfil.nome ? perfil.nome.charAt(0).toUpperCase() : "?"}
                </div>
                <h2 style={{ color: "#341608", margin: 0 }}>{perfil.nome}</h2>
              </div>

              {infoRow("E-mail", perfil.email)}
              {infoRow("Telefone", perfil.telefone)}
              {infoRow("CEP", perfil.cep)}
              {infoRow("Endereço padrão", perfil.endereco_padrao)}

              <div style={{ marginTop: 25, textAlign: "center" }}>
                <button
                  className="menu-btn"
                  onClick={() => setEditando(true)}
                  style={{ background: "#341608", boxShadow: "0 10px 25px rgba(52,22,8,.35)" }}
                >
                  ✏️ Editar informações
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSalvar}>
              <h3 style={{ color: "#341608", marginBottom: 20 }}>Editar Informações</h3>

              <div className="input-group">
                <label>Nome</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15 }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>E-mail</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15 }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Telefone</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={form.telefone}
                    onChange={e => setForm({ ...form, telefone: e.target.value })}
                    style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15 }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>CEP</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={form.cep || ""}
                      onChange={e => {
                        const cep = e.target.value;
                        setForm({ ...form, cep: cep });
                        // Se tiver 8 dígitos, busca automaticamente
                        if (cep.replace(/\D/g, "").length === 8) {
                          handleBuscarCep();
                        }
                      }}
                      style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15 }}
                      maxLength={9}
                    />
                  </div>
                  <button
                    type="button"
                    className="menu-btn"
                    onClick={handleBuscarCep}
                    disabled={cepBuscando}
                    style={{
                      padding: "0 18px", height: 52, whiteSpace: "nowrap",
                      background: "#341608", opacity: cepBuscando ? 0.6 : 1,
                      fontSize: 14
                    }}
                  >
                    {cepBuscando ? "..." : "Buscar"}
                  </button>
                </div>
              </div>

              {(enderecoDetalhado.rua || enderecoDetalhado.bairro || enderecoDetalhado.cidade) ? (
                <>
                  <div className="address-grid-2">
                    <div className="input-group">
                      <label>Rua</label>
                      <div className="input-wrapper">
                        <input type="text" value={enderecoDetalhado.rua} readOnly
                          style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15, color: "#555" }} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Número</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="Nº"
                          value={enderecoDetalhado.numero}
                          onChange={e => handleNumeroChange(e.target.value)}
                          style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15 }} />
                      </div>
                    </div>
                  </div>
                  <div className="address-grid-1-1">
                    <div className="input-group">
                      <label>Bairro</label>
                      <div className="input-wrapper">
                        <input type="text" value={enderecoDetalhado.bairro} readOnly
                          style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15, color: "#555" }} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Cidade / Estado</label>
                      <div className="input-wrapper">
                        <input type="text"
                          value={`${enderecoDetalhado.cidade}${enderecoDetalhado.estado ? `/${enderecoDetalhado.estado}` : ""}`}
                          readOnly
                          style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15, color: "#555" }} />
                      </div>
                    </div>
                  </div>
                  {enderecoDetalhado.cidade && (
                    <div style={{ background: "#e8f5e9", padding: "12px 16px", borderRadius: 10, border: "1px solid #c8e6c9" }}>
                      <strong style={{ color: "#2e7d32", display: "block", marginBottom: 4 }}>Endereço completo:</strong>
                      <span style={{ color: "#341608", fontSize: 14 }}>{form.endereco_padrao}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="input-group">
                  <label>Endereço padrão</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Rua, número, bairro - Cidade"
                      value={form.endereco_padrao}
                      onChange={e => setForm({ ...form, endereco_padrao: e.target.value })}
                      style={{ flex: 1, height: 52, border: "none", outline: "none", background: "transparent", fontSize: 15 }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 25 }}>
                <button
                  type="button"
                  className="menu-btn"
                  style={{ background: "#555", boxShadow: "none" }}
                  onClick={() => { setEditando(false); setForm(perfil); setEnderecoDetalhado({ rua: "", numero: "", bairro: "", cidade: "", estado: "" }); }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="menu-btn"
                  disabled={salvando}
                  style={{ opacity: salvando ? .6 : 1 }}
                >
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Perfil;