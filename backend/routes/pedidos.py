from flask import Blueprint, request, jsonify
import json
from datetime import datetime

from auth_middleware import token_required


# criando as rotas relacionadas aos pedidos
pedidos_bp = Blueprint('pedidos', __name__)

# arquivo onde vou guardar os pedidos
ARQUIVO = "data/pedidos.json"


def ler_pedidos():
    # tenta pegar os pedidos que já estão salvos no arquivo
    try:
        with open(ARQUIVO, "r") as f:
            return json.load(f)

    # se não existir arquivo ou estiver vazio, começa sem pedidos
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def salvar_pedidos(lista):
    # salva a lista atualizada de pedidos no arquivo
    with open(ARQUIVO, "w") as f:
        json.dump(lista, f, indent=2, ensure_ascii=False)


@pedidos_bp.route("/pedidos", methods=["GET"])
@token_required
def listar_pedidos(usuario_id):
    # pega somente os pedidos do usuário que está logado

    if not usuario_id:
        return jsonify({"erro": "Usuário não autenticado"}), 401

    todos = ler_pedidos()

    # filtra os pedidos para não mostrar pedidos de outros usuários
    pedidos_user = [p for p in todos if p["usuario_id"] == usuario_id]

    # deixa os pedidos mais recentes primeiro
    pedidos_user.sort(key=lambda p: p.get("data", ""), reverse=True)

    return jsonify(pedidos_user), 200


@pedidos_bp.route("/pedidos", methods=["POST"])
@token_required
def criar_pedido(usuario_id):
    # cria um novo pedido para o usuário que está logado

    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "Dados inválidos"}), 400

    endereco = dados.get("endereco")
    forma_pagamento = dados.get("forma_pagamento", "Dinheiro")

    # pega os itens que vieram do carrinho
    itens = dados.get("itens")

    if not itens or not endereco:
        return jsonify({"erro": "itens e endereco são obrigatórios"}), 400


    # soma o valor de todos os itens para calcular o total do pedido
    total = sum(float(item.get("valor", 0)) for item in itens)


    todos = ler_pedidos()

    # cria um id novo usando o maior id existente
    novo_id = (max(p["id"] for p in todos) + 1) if todos else 1


    novo_pedido = {
        "id": novo_id,
        "usuario_id": usuario_id,
        "itens": itens,
        "total": round(total, 2),
        "endereco": endereco,
        "forma_pagamento": forma_pagamento,
        "status": "Em preparo",
        "status_atualizado_em": datetime.now().isoformat(),
        "data": datetime.now().strftime("%d/%m/%Y %H:%M")
    }


    # adiciona o pedido novo junto com os antigos
    todos.append(novo_pedido)

    salvar_pedidos(todos)


    return jsonify({
        "mensagem": "Pedido realizado com sucesso!",
        "pedido": novo_pedido
    }), 201


@pedidos_bp.route("/pedidos/<int:pedido_id>", methods=["DELETE"])
@token_required
def cancelar_pedido(usuario_id, pedido_id):
    # cancela o pedido mudando o status, ao invés de apagar do arquivo

    todos = ler_pedidos()

    for p in todos:
        if p["id"] == pedido_id:

            # impede que alguém cancele pedido de outro usuário
            if usuario_id and p["usuario_id"] != usuario_id:
                return jsonify({"erro": "Este pedido não pertence ao usuário"}), 403


            # só deixa cancelar pedidos que ainda estão no começo
            if p["status"] not in ("Em preparo", "Pendente"):
                return jsonify({"erro": "Só é possível cancelar pedidos em preparo ou pendentes"}), 400


            p["status"] = "Cancelado"
            p["status_atualizado_em"] = datetime.now().isoformat()

            salvar_pedidos(todos)

            return jsonify({
                "mensagem": "Pedido cancelado",
                "pedido": p
            }), 200


    return jsonify({"erro": "Pedido não encontrado"}), 404


@pedidos_bp.route("/pedidos/<int:pedido_id>/status", methods=["PATCH"])
@token_required
def atualizar_status(usuario_id, pedido_id):
    # atualiza o andamento do pedido

    dados = request.get_json()

    novo_status = dados.get("status")

    status_validos = [
        "Pendente",
        "Em preparo",
        "Saiu para entrega",
        "Entregue",
        "Cancelado"
    ]


    # verifica se o status enviado existe na lista permitida
    if not novo_status or novo_status not in status_validos:
        return jsonify({
            "erro": f"Status inválido. Válidos: {', '.join(status_validos)}"
        }), 400


    todos = ler_pedidos()

    for p in todos:
        if p["id"] == pedido_id:

            p["status"] = novo_status
            p["status_atualizado_em"] = datetime.now().isoformat()

            salvar_pedidos(todos)

            return jsonify({
                "mensagem": "Status atualizado",
                "pedido": p
            }), 200


    return jsonify({"erro": "Pedido não encontrado"}), 404