// App.tsx
import { useEffect } from 'react'
import { useStore } from './stores/useStore'
import { Scheduler } from './core/scheduler'
import Building from './components/Building'
import StartScreen from './components/StartScreen'
import ControlPanel from './components/ControlPanel'

function App() {
  const { initialized, config, requests } = useStore()
  const scheduler = new Scheduler(useStore.getState().elevators)

  // 添加定时器处理电梯移动
  useEffect(() => {
    const interval = setInterval(() => {
      useStore.getState().processMovement()
    }, config.movementSpeed * 1000) // 根据移动速度设置间隔
    return () => clearInterval(interval)
  }, [config.movementSpeed])
 
  // 处理请求队列
  useEffect(() => {
    const processRequests = async () => {
      if (requests.length > 0) {
        const [request] = requests
        try {
          const elevatorId = await scheduler.assignRequest(request)
          
          if (elevatorId !== -1) {
            useStore.getState().updateElevator(elevatorId, {
              targetFloors: [
                ...useStore.getState().elevators[elevatorId].targetFloors,
                request.floor
              ]
            })
            // 保持最新状态引用
            useStore.setState(state => ({
              requests: state.requests.slice(1)
            }))
          }
        } catch (error) {
          console.error('调度失败:', error)
        }
      }
    }
  
    processRequests()
  }, [requests])

  if (!initialized) return <StartScreen />

  return (
    <div className="app">
      <h1>电梯模拟系统（楼层数：{config.floors}）</h1>
      <div style={{ display: 'flex' }}>
        <div className="simulator-container">
          <Building />
        </div>
        <ControlPanel />
      </div>
    </div>
  )
}

export default App