from flask import Flask, request, jsonify

app = Flask(__name__)


"""
jsonify: 
    Ele também configura automaticamente o header:
    Content-Type: application/json
"""

@app.route('/usuario', methods=["POST", "GET"])
def criar_usuario():


    # get para ler/pegar os dados
    dados = request.get_json()

    # exibe os dados no formato json
    # flask trata/converte o JSON recebido como um dicionário (dict) -> estrutura semelhante

    # Flask transforma o dicionário em JSON antes de retornar
    return jsonify({
        "mensagem": f"Seja vem vindo(a) {dados["nome"]}",
        "dados_recebidos": dados
    })

    

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)



