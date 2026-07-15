from flask import Flask

app = Flask(__name__)

# Decorator pra rota padrão 
@app.route("/")
def hello_world():
    return "<p> Olá, mundo! <p>"

# Decorator pra rota 'robots.txt'
@app.route("/robots.txt")
def robot():
    return 'key.txt'


if __name__ == '__main__':
    app.run(debug=False)