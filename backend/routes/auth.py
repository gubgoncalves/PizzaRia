#!/bin/python3
from flask import Blueprint, request, jsonify
import json

from auth_middleware import gerar_token
from schemas import CadastroSchema, LoginSchema
from pydantic import ValidationError

"""
Código de retorno HTTP e seus significados:
https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Reference/Status
"""

# React irá me retornar os dados de e-mail e senha no formato JSON


# Crie um objeto Blueprint chamado auth, associado ao módulo atual
auth_bp = Blueprint('auth', __name__)
 

usuarios = "data/usuarios.json"
@auth_bp.route('/login', methods=['POST']) # forçar options
def login():

    if request.method == "POST":

        # pegar dados
        dados = request.get_json() or {}

        ## VALIDAÇÃO COM PYDANTIC ##
        try:
            schema = LoginSchema(**dados)
        except ValidationError as e:
            # Traduz erros do Pydantic pra mensagens amigáveis
            erros = e.errors()
            primeiro_erro = erros[0]
            campo = primeiro_erro["loc"][0]
            msg = primeiro_erro["msg"]
            return jsonify({"erro": f"{campo}: {msg}"}), 400

        email = schema.email
        senha = schema.senha

        # abre nosso "BD" de usuários
        with open(usuarios, "r") as file:
            usuarios_json = json.load(file) # transforma nosso JSON em uma lista python

        ###############################
        #       SUCESSO NO LOGIN      #
        ###############################
        for usuario in usuarios_json:
            if usuario["email"] == email and usuario["senha"] == senha:
                # Gera token JWT (Req 3b)
                token = gerar_token(usuario["id"])
                return jsonify({
                    "sucesso": "Login realizado",
                    "token": token,
                    "usuario": { # naõ podemos passar o objeto "usuario" direto, por conta que irá retornar a senha também
                        "id": usuario["id"],
                        "nome": usuario["nome"],
                        "email": usuario["email"]
                    }
                }), 200

        return jsonify({
            "erro": "Credenciais inválidas"
        }), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    dados = request.get_json()

    # === VALIDAÇÃO COM PYDANTIC (Req 2c.iv) ===
    try:
        schema = CadastroSchema(**dados)
    except ValidationError as e:
        erros = e.errors()
        primeiro_erro = erros[0]
        campo = primeiro_erro["loc"][0]
        msg = primeiro_erro["msg"]
        return jsonify({"erro": f"{campo}: {msg}"}), 400

    nome = schema.nome
    email = schema.email
    senha = schema.senha

    ###############################
    #   VERIFICAÇÃO NO CADASTRO   #
    ###############################

    # abre nosso "BD" de usuários
    with open(usuarios, "r") as file:
        usuarios_json = json.load(file) # transforma nosso JSON em uma lista python


    # verificação de usuário já cadastrado
    for usuario in usuarios_json:
        if(usuario["email"] == email):
            return jsonify({
                "erro": f"E-mail {usuario['email']} já cadastrado"
                }), 409 

    ###############################
    #    SUCESSO NO CADASTRO   #
    ###############################
    
    # cria um novo usuário pra ser adicionado na nossa lista de usuários
    # Pega o maior ID existente + 1
    ids_existentes = [u["id"] for u in usuarios_json if "id" in u]
    novo_id = (max(ids_existentes) + 1) if ids_existentes else 1
    novo_usuario = {
        "id": novo_id,
        "nome": nome,
        "email": email,
        "senha": senha,
        "telefone": "",
        "cep": "",
        "endereco_padrao": ""
    }

    # adicionar usuário no arquivo
    usuarios_json.append(novo_usuario)

    # salvar no arquivo
    with open(usuarios, "w") as file:
        # dump(): Converte de volta para lista python -> json puro
        json.dump(usuarios_json, file)

    return jsonify({
        "mensagem": f"Usuário {novo_usuario['nome']} adicionado com sucesso!"
    }), 200