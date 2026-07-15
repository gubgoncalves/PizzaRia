#!/bin/python3
from flask import Flask, request, jsonify

# Objeto app criado
app = Flask(__name__)


# O flask INTERCEPTA as requisições (nosso ouvinte nc)
# Intercepta, valida/verifica e retorna JSON
# React irá exibir nossa resposta

# Rota para login
# Entrar e visualizar painel de login: por padrão é GET
# Na hora que o usuário clicar no botão "fazer login"
# Nossos dados caminharão via POST pra submissão
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        return do_the_login()

# adicionamos qual o método que será utilizado ao acessar "/"
@app.route("/", methods=["POST"])
def hello_world():
    return "<p> Olá, mundo! <p>"

# Exemplo de submissão (usamos POST)
# dados ocultos na URL
@app.route("/login", methods=["POST"])
def loginSubmit():
    return "<h1> Login concedido </h1>"


# Retorna pra nossa página de validação dos dados
def do_the_login():
    return
if __name__ == '__main__':
    app.run(debug=False)