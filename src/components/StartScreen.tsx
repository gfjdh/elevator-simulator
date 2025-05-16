// StartScreen.tsx
import { useState } from 'react'
import { useStore } from '../stores/useStore'

const StartScreen = () => {
  const [floors, setFloors] = useState(20)
  const [elevators, setElevators] = useState(5)
  const [speed, setSpeed] = useState(0.7) // 添加速度状态
  const initialize = useStore(state => state.initializeConfig)

  return (
    <div className="start-screen" style={{
      maxWidth: '500px',
      margin: '50px auto',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px'
    }}>
      <h2>电梯模拟系统配置</h2>
      
      {/* 楼层配置 */}
      <div style={{ margin: '20px 0' }}>
        <label>
          楼层数 (2-40):
          <input
            type="range"
            min="2"
            max="40"
            value={floors}
            onChange={e => setFloors(Number(e.target.value))}
          />
          {floors}
        </label>
      </div>

      {/* 电梯数量配置 */}
      <div style={{ margin: '20px 0' }}>
        <label>
          电梯数量 (1-10):
          <input
            type="range"
            min="1"
            max="10"
            value={elevators}
            onChange={e => setElevators(Number(e.target.value))}
          />
          {elevators}
        </label>
      </div>

      {/* 新增速度配置 */}
      <div style={{ margin: '20px 0' }}>
        <label>
          运行速度 (0.1-2 秒/层):
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed} 秒/层
        </label>
      </div>

      <button 
        onClick={() => initialize(floors, elevators, speed)}
        style={{ padding: '10px 20px' }}
      >
        开始模拟
      </button>
    </div>
  )
}

export default StartScreen