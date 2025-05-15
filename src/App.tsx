// App.tsx
import { useEffect } from 'react'
import { useStore } from './stores/useStore'
import { Scheduler } from './core/scheduler'
import Building from './components/Building'
import StartScreen from './components/StartScreen' // 确保引入StartScreen

function App() {
  const { initialized, config, requests, processMovement } = useStore()
  const scheduler = new Scheduler(useStore.getState().elevators)

  // 处理请求队列
  useEffect(() => {
    if (requests.length > 0) {
      const [request] = requests
      const elevatorId = scheduler.assignRequest(request)
      
      if (elevatorId !== -1) {
        useStore.getState().updateElevator(elevatorId, {
          targetFloors: [...useStore.getState().elevators[elevatorId].targetFloors, request.floor]
        })
        useStore.setState({ requests: requests.slice(1) })
      }
    }
  }, [requests])

  // 启动电梯移动循环
  useEffect(() => {
    const interval = setInterval(() => {
      processMovement()
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!initialized) return <StartScreen />

  return (
    <div className="app">
      <h1>电梯模拟系统（楼层数：{config.floors}）</h1>
      <div className="simulator-container">
        <Building />
      </div>
    </div>
  )
}

export default App