// o App.jsx é o gerenciador principal, ele decide:
// Qual página aparece? Qual rota aparece? Qual layout aparece?

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import "./styles/forms.css";

import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Cardapio from './pages/Cardapio'
import MeusPedidos from './pages/MeusPedidos'
import NovoPedido from './pages/NovoPedido'
import Perfil from './pages/Perfil'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cardapio"
            element={
              <ProtectedRoute>
                <Cardapio />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meus-pedidos"
            element={
              <ProtectedRoute>
                <MeusPedidos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/novo-pedido"
            element={
              <ProtectedRoute>
                <NovoPedido />
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App