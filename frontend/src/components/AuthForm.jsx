import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario, cadastrarUsuario } from "../services/api";

function AuthForm({ mode = "login" }) {
  const navigate = useNavigate();

  const isLogin = mode === "login";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (isLogin) {
        const { resposta, dados } = await loginUsuario({ email, senha });

        if (!resposta.ok) {
          alert(dados.erro || "Erro ao realizar login");
          return;
        }

        alert(dados.sucesso || "Login realizado com sucesso!");

        // armazena dados do usuario + token JWT no navegador
        sessionStorage.setItem(
          "usuarioLogado",
          JSON.stringify({ ...dados.usuario, token: dados.token })
        );
        // redireciona pra home
        navigate("/home");
        return;
        
      } else {
        const { resposta, dados } = await cadastrarUsuario({
          nome,
          email,
          senha,
        });

        if (!resposta.ok) {
          alert(dados.erro || "Erro ao realizar cadastro");
          return;
        }

        alert(dados.mensagem || "Cadastro realizado com sucesso!");

        // depois do cadastro, manda pro login
        navigate("/");
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  }

  return (
    <main className="login-section">
      <div className="login-card">
        <div className="card-header">
          <h2>{isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}</h2>
          <div className="red-line"></div>
          <p>
            {isLogin
              ? "Faça login para continuar"
              : "Preencha os dados para se cadastrar"}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="nome">Nome</label>
              <div className="input-wrapper">
                <i className="fa-regular fa-user input-icon"></i>
                <input
                  type="text"
                  id="nome"
                  placeholder="Digite seu nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope input-icon"></i>
              <input
                type="email"
                id="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock input-icon"></i>
              <input
                type={mostrarSenha ? "text" : "password"}
                id="senha"
                placeholder="Digite sua senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <i
                className={`fa-regular ${mostrarSenha ? "fa-eye" : "fa-eye-slash"} toggle-password`}
                onClick={() => setMostrarSenha(!mostrarSenha)}
              ></i>
            </div>
          </div>

          {isLogin && (
            <div className="form-actions">
              <div className="remember-me">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Lembrar-me</label>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary">
            <i
              className={
                isLogin
                  ? "fa-solid fa-arrow-right-to-bracket"
                  : "fa-solid fa-user-plus"
              }
            ></i>
            {isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="separator">
          <div className="separator-line"></div>
          <span>ou</span>
          <div className="separator-line"></div>
        </div>

        {isLogin ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/cadastro")}
          >
            <i className="fa-regular fa-user"></i>
            Criar uma conta
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/")}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Voltar para login
          </button>
        )}

        <div className="social-links-container">
          <p>Siga-nos nas redes sociais</p>

          <div className="social-icons">
            <a href="#" className="instagram" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" className="facebook" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" className="whatsapp" aria-label="WhatsApp">
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthForm;