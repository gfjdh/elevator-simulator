// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useStore } from './stores/useStore'

// 初始化电梯状态
useStore.getState().config = {
  floors: 10,
  elevators: 4,
  floorHeight: 73, // px
  movementSpeed: 0.5
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)