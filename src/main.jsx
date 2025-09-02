import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import TodoList from './TodoList.jsx'
import TodoTest from './TodoTest.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>

    <TodoList />
    {/* <TodoTest /> */}
  </StrictMode>,
)
