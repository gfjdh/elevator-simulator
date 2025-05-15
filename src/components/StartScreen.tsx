import { useState } from 'react'
import { useStore } from '../stores/useStore'

const StartScreen = () => {
  const [floors, setFloors] = useState(10)
  const [elevators, setElevators] = useState(4)
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
      <div style={{ margin: '20px 0' }}>
        <label>
          楼层数 (2-20):
          <input
            type="range"
            min="2"
            max="20"
            value={floors}
            onChange={e => setFloors(Number(e.target.value))}
          />
          {floors}
        </label>
      </div>
      <div style={{ margin: '20px 0' }}>
        <label>
          电梯数量 (1-8):
          <input
            type="range"
            min="1"
            max="8"
            value={elevators}
            onChange={e => setElevators(Number(e.target.value))}
          />
          {elevators}
        </label>
      </div>
      <button 
        onClick={() => initialize(floors, elevators)}
        style={{ padding: '10px 20px' }}
      >
        开始模拟
      </button>
    </div>
  )
}

export default StartScreen