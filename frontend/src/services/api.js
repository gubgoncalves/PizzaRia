const API_URL = "http://127.0.0.1:5000";

/** Lê o token JWT do sessionStorage e monta header de autenticação */
function authHeaders() {
  const raw = sessionStorage.getItem("usuarioLogado");
  if (!raw) return {};
  try {
    const user = JSON.parse(raw);
    if (user.token) {
      return { "Authorization": `Bearer ${user.token}` };
    }
  } catch {}
  return {};
}

// ========== AUTH ==========

export async function loginUsuario({ email, senha }) {
  const resposta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const dados = await resposta.json();
  return { resposta, dados };
}

export async function cadastrarUsuario({ nome, email, senha }) {
  const resposta = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
  const dados = await resposta.json();
  return { resposta, dados };
}

// ========== PIZZAS ==========

export async function listarPizzas() {
  const resposta = await fetch(`${API_URL}/pizzas`);
  const dados = await resposta.json();
  return { resposta, dados };
}

// ========== PEDIDOS ==========

/** Lista pedidos do usuário autenticado via token JWT */
export async function listarPedidos() {
  const resposta = await fetch(`${API_URL}/pedidos`, {
    headers: { ...authHeaders() },
  });
  const dados = await resposta.json();
  return { resposta, dados };
}

/** Cria pedido — usuario_id vem do token JWT, não precisa enviar */
export async function criarPedido({ itens, endereco, forma_pagamento }) {
  const resposta = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ itens, endereco, forma_pagamento }),
  });
  const dados = await resposta.json();
  return { resposta, dados };
}

/** Cancela pedido — usuario_id vem do token JWT */
export async function cancelarPedido(pedidoId) {
  const resposta = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  const dados = await resposta.json();
  return { resposta, dados };
}

/** Atualiza status do pedido */
export async function atualizarStatusPedido(pedidoId, status) {
  const resposta = await fetch(`${API_URL}/pedidos/${pedidoId}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const dados = await resposta.json();
  return { resposta, dados };
}

// ========== PERFIL ==========

/** Busca perfil do usuário autenticado via token JWT */
export async function buscarPerfil() {
  const resposta = await fetch(`${API_URL}/user/perfil`, {
    headers: { ...authHeaders() },
  });
  const dados = await resposta.json();
  return { resposta, dados };
}

/** Atualiza perfil — usuario_id vem do token JWT */
export async function atualizarPerfil({ nome, email, telefone, cep, endereco_padrao }) {
  const resposta = await fetch(`${API_URL}/user/perfil`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, telefone, cep, endereco_padrao }),
  });
  const dados = await resposta.json();
  return { resposta, dados };
}

// ========== CEP (BrasilAPI) ==========

export async function buscarCep(cep) {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    return { erro: "CEP deve ter 8 dígitos" };
  }
  try {
    const resposta = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
    const dados = await resposta.json();
    if (!resposta.ok) {
      return { erro: dados.message || "CEP não encontrado" };
    }
    return {
      cep: dados.cep,
      estado: dados.state,
      cidade: dados.city,
      bairro: dados.neighborhood,
      rua: dados.street,
    };
  } catch (err) {
    return { erro: "Erro ao consultar CEP" };
  }
}