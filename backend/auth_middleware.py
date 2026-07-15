#!/usr/bin/python3
"""Middleware de autenticação JWT para o PizzaRia.

Responsabilidades:
- Gerar tokens JWT após autenticação do usuário;
- Validar tokens em rotas protegidas;
- Disponibilizar o ID do usuário autenticado para a rota.

Uso:
    from auth_middleware import gerar_token, token_required

    # No login:
    token = gerar_token(usuario["id"])

    # Em uma rota protegida:
    @rota_bp.route("/recurso")
    @token_required
    def minha_rota(usuario_id):
        ...
"""

import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

# Chave utilizada para assinar e validar os tokens JWT
# Em produção essa chave deve ficar em uma variável de ambiente
SECRET_KEY = "pizzaria-secret-key-xdes03-2026"

# Algoritmo usado para assinar o token
ALGORITHM = "HS256"

# Tempo que o usuário fica logado
TOKEN_EXPIRY_HOURS = 24


def gerar_token(usuario_id: int) -> str:

    # Informações que vão ficar dentro do token
    payload = {
        "usuario_id": usuario_id,

        # Momento em que o token foi criado
        "iat": datetime.utcnow(),

        # Momento em que o token vai expirar
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        # Pega o token enviado no cabeçalho da requisição
        auth_header = request.headers.get("Authorization", "")

        # Verifica se o token foi enviado no formato Bearer
        if not auth_header.startswith("Bearer "):
            return jsonify({"erro": "Token de autenticação não fornecido"}), 401

        try:
            # Remove o Bearer e decodifica o token
            token = auth_header.split(" ", 1)[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

            # Passa o id do usuário autenticado para a rota
            kwargs["usuario_id"] = payload["usuario_id"]

        # Token expirou
        except jwt.ExpiredSignatureError:
            return jsonify({"erro": "Sessão expirada. Faça login novamente"}), 401

        # Token inválido ou alterado
        except jwt.InvalidTokenError:
            return jsonify({"erro": "Token inválido"}), 401

        # Continua a execução da rota
        return f(*args, **kwargs)

    return decorated