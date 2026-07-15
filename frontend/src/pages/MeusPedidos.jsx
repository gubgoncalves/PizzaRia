import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { listarPedidos, cancelarPedido, atualizarStatusPedido } from "../services/api";

function MeusPedidos() {
  const navigate = useNavigate();
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado")) || {};
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [timers, setTimers] = useState({});
  const timersRef = useRef({});

  function parseTimestamp(pedido) {
    if (pedido.status_atualizado_em)
      return new Date(pedido.status_atualizado_em).getTime();
    if (pedido.data) {
      const [date, time] = pedido.data.split(" ");
      const [d, m, y] = date.split("/");
      const [h, min] = time.split(":");
      return new Date(y, m - 1, d, h, min).getTime();
    }
    return Date.now();
  }

  function formatTimer(segundos) {
    if (segundos <= 0) return "00:00";
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function calcularTimers(pedidosLista) {
    const agora = Date.now();
    const novos = {};
    pedidosLista.forEach((p) => {
      if (p.status === "Em preparo" || p.status === "Saiu para entrega") {
        const inicio = parseTimestamp(p);
        const decorrido = Math.floor((agora - inicio) / 1000);
        // ? 25 * 60 (saiu p entrega) : 35 * 60 (entregue)
        const limite = p.status === "Em preparo" ? 25 * 60 : 35 * 60;
        const restante = limite - decorrido;
        novos[p.id] = { restante, limite };
      }
    });
    return novos;
  }

  async function carregarPedidos() {
    if (!usuario.id) return;
    setCarregando(true);
    try {
      const { resposta, dados } = await listarPedidos(usuario.id);
      if (resposta.ok) {
        setPedidos(Array.isArray(dados) ? dados : []);
      }
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (!usuario.id) {
      navigate("/");
      return;
    }
    carregarPedidos();
  }, []);

  // Temporizador: atualiza contadores a cada 1s e faz transições automáticas
  useEffect(() => {
    const tick = setInterval(async () => {
      setPedidos((prev) => {
        const novosTimers = calcularTimers(prev);
        setTimers(novosTimers);

        // Verificar se algum timer zerou
        const atualizados = prev.map((p) => {
          const t = novosTimers[p.id];
          if (!t || t.restante > 0) return p;
          const proxStatus =
            p.status === "Em preparo" ? "Saiu para entrega" : "Entregue";
          // Chamada assíncrona sem travar o loop
          atualizarStatusPedido(p.id, proxStatus).catch(() => {});
          return {
            ...p,
            status: proxStatus,
            status_atualizado_em: new Date().toISOString(),
          };
        });
        return atualizados;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Recalcular timers quando pedidos mudam (após carregamento ou transição)
  useEffect(() => {
    timersRef.current = calcularTimers(pedidos);
    setTimers(timersRef.current);
  }, [pedidos]);

  async function handleCancelar(pedidoId) {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;
    try {
      const { resposta, dados } = await cancelarPedido(pedidoId, usuario.id);
      if (resposta.ok) {
        alert(dados.mensagem);
        carregarPedidos();
      } else {
        alert(dados.erro || "Erro ao cancelar pedido");
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor");
    }
  }

  const pedidosFiltrados =
    filtro === "todos"
      ? pedidos
      : filtro === "cancelados"
        ? pedidos.filter((p) => p.status === "Cancelado")
        : pedidos.filter((p) => p.status === "Entregue");

  const statusDisponiveis = [
    { key: "todos", label: "Todos" },
    { key: "cancelados", label: "Cancelados" },
    { key: "concluidos", label: "Concluídos" },
  ];

  return (
    <DashboardLayout>
      <div className="home-top">
        <div className="welcome">
          <h1>Meus Pedidos 📦</h1>
          <p>Consulte e gerencie todos os seus pedidos</p>
        </div>
      </div>

      <div
        className="filtros-status"
        style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        {statusDisponiveis.map((s) => (
          <button
            key={s.key}
            onClick={() => setFiltro(s.key)}
            style={{
              padding: "8px 18px",
              border: "none",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background: filtro === s.key ? "#d53a24" : "#f0e6d9",
              color: filtro === s.key ? "#fff" : "#5a3d2b",
              transition: ".2s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {carregando ? (
        <p style={{ color: "#888", fontSize: 18 }}>Carregando pedidos...</p>
      ) : pedidosFiltrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>📭</div>
          <h2 style={{ color: "#5a3d2b", marginBottom: 10 }}>
            Nenhum pedido encontrado
          </h2>
          <p style={{ marginBottom: 20 }}>
            {filtro !== "todos"
              ? "Nenhum pedido com este status."
              : "Você ainda não fez nenhum pedido."}
          </p>
          <button className="menu-btn" onClick={() => navigate("/novo-pedido")}>
            Fazer primeiro pedido
          </button>
        </div>
      ) : (
        <div className="orders">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Pizzas</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Tempo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: "#341608" }}>#{p.id}</td>
                  <td>{p.data}</td>
                  <td>
                    {p.itens ? (
                      p.itens.map((item, i) => (
                        <div key={i}>
                          {item.pizza}
                          {item.tamanho ? ` (${item.tamanho})` : ""}
                          {item.adicionais && item.adicionais.length > 0
                            ? ` + ${item.adicionais.join(", ")}`
                            : ""}
                        </div>
                      ))
                    ) : Array.isArray(p.pizzas) ? (
                      p.pizzas.map((pi) => (
                        <div key={pi.id}>
                          {pi.nome}{" "}
                          {pi.quantidade > 1 ? `(x${pi.quantidade})` : ""}
                        </div>
                      ))
                    ) : (
                      <span style={{ color: "#aaa" }}>---</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: "#d53a24" }}>
                    R$ {p.total.toFixed(2).replace(".", ",")}
                  </td>
                  <td>
                    <span
                      className={`status ${p.status === "Cancelado" ? "cancel" : p.status === "Entregue" ? "ok" : "pendente"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 14, fontWeight: 600 }}>
                    {p.status === "Em preparo" ||
                    p.status === "Saiu para entrega" ? (
                      <span
                        style={{
                          color:
                            timers[p.id]?.restante > 0 ? "#d53a24" : "#888",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        ⏱ {formatTimer(timers[p.id]?.restante ?? 0)}
                      </span>
                    ) : (
                      <span style={{ color: "#aaa", fontSize: 13 }}>---</span>
                    )}
                  </td>
                  <td>
                    {p.status === "Saiu para entrega" ? (
                      <span style={{ fontSize: 28, lineHeight: 1 }} title="Saiu para entrega">🏍️</span>
                    ) : p.status === "Em preparo" || p.status === "Pendente" ? (
                      <button
                        onClick={() => handleCancelar(p.id)}
                        style={{
                          padding: "7px 16px",
                          border: "none",
                          borderRadius: 8,
                          background: "#ffe3e3",
                          color: "#d0312d",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        Cancelar
                      </button>
                    ) : (
                      <span style={{ color: "#aaa", fontSize: 13 }}>---</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

export default MeusPedidos;
