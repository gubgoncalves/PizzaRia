from flask import Blueprint, request, jsonify
import json

from auth_middleware import token_required


# criando as rotas relacionadas ao usuário
user_bp = Blueprint('user', __name__)

# arquivo onde vou guardar os usuários enquanto não uso banco de dados
ARQUIVO = "data/usuarios.json"


def ler_usuarios():
    # tenta abrir o arquivo e pegar a lista de usuários salva
    try:
        with open(ARQUIVO, "r") as f:
            return json.load(f)

    # caso o arquivo não exista ou esteja vazio, começa com uma lista vazia
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def salvar_usuarios(lista):
    # salva novamente a lista depois de alguma alteração
    with open(ARQUIVO, "w") as f:
        json.dump(lista, f, indent=2, ensure_ascii=False)


@user_bp.route("/user/perfil", methods=["GET"])
@token_required
def obter_perfil(usuario_id):
    # pega os dados do usuário que está logado pelo id vindo do token

    if not usuario_id:
        return jsonify({"erro": "Usuário não autenticado"}), 401

    usuarios = ler_usuarios()

    # percorre a lista até encontrar o usuário pelo id
    for u in usuarios:
        if u.get("id") == usuario_id:

            # não retorna a senha junto com os outros dados
            return jsonify({
                "id": u["id"],
                "nome": u.get("nome", "Usuário"),
                "email": u.get("email", ""),
                "telefone": u.get("telefone", ""),
                "cep": u.get("cep", ""),
                "endereco_padrao": u.get("endereco_padrao", "")
            }), 200

    return jsonify({"erro": "Usuário não encontrado"}), 404


@user_bp.route("/user/perfil", methods=["PUT"])
@token_required
def atualizar_perfil(usuario_id):
    # recebe os novos dados do usuário e atualiza o perfil

    dados = request.get_json()

    if not usuario_id:
        return jsonify({"erro": "Usuário não autenticado"}), 401

    usuarios = ler_usuarios()

    for u in usuarios:
        if u.get("id") == usuario_id:

            # só altera os campos que foram enviados na requisição
            if "nome" in dados:
                u["nome"] = dados["nome"]

            if "email" in dados:
                u["email"] = dados["email"]

            if "telefone" in dados:
                u["telefone"] = dados["telefone"]

            if "cep" in dados:
                u["cep"] = dados["cep"]

            if "endereco_padrao" in dados:
                u["endereco_padrao"] = dados["endereco_padrao"]

            # depois de mudar os dados, salva a lista atualizada
            salvar_usuarios(usuarios)

            return jsonify({
                "mensagem": "Perfil atualizado com sucesso",
                "usuario": {
                    "id": u["id"],
                    "nome": u.get("nome", ""),
                    "email": u.get("email", ""),
                    "telefone": u.get("telefone", ""),
                    "cep": u.get("cep", ""),
                    "endereco_padrao": u.get("endereco_padrao", "")
                }
            }), 200

    return jsonify({"erro": "Usuário não encontrado"}), 404