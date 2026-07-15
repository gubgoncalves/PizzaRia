#!/bin/python3

# Mostrando a existências dos BluesPrints
from flask import Flask
from routes.auth import auth_bp
from routes.pedidos import pedidos_bp
from routes.user import user_bp
from routes.pizzas import pizzas_bp

# importando flask colors  p/ permitir que a aplicação
# flask receba requisição do outro domínio (react)
from flask_cors import CORS

# Inicializa nosso objeto princial flask
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

# Registrando as rotas pro app
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(pedidos_bp)
app.register_blueprint(user_bp)
app.register_blueprint(pizzas_bp)

if __name__ == '__main__':
    app.run(debug=True) # n esquecer de desativar na aplicação real