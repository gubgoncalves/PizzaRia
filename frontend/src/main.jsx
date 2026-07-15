// main.jsx não controla as rotas, ele apenas:
// - Inicia o react
// - Renderiza o APP PRINCIPAL

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './styles/global.css'

//  "Nosso script js"
// Método do react para renderizar tudo isso
// createRoot: para criar uma rota, de onde vai ser renderizado nossos componentes
createRoot(document.getElementById('root')).render(
  // dentro da nossa div com id root (index.html), irei renderizar algo:
  <StrictMode>
    <App />
  </StrictMode>,
)
