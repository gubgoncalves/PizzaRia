from flask import Blueprint, jsonify
import json


pizzas_bp = Blueprint(
    "pizzas",
    __name__
)


@pizzas_bp.route("/pizzas", methods=["GET"])
def listar_pizzas():

    with open("data/pizzas.json") as file:
        pizzas = json.load(file)


    return jsonify(pizzas)