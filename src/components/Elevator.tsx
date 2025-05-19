// Elevator.tsx
import { useStore } from '../stores/useStore'
import type { ElevatorState } from '../core/type'

// Elevator.tsx
const Elevator = ({ data }: { data: ElevatorState }) => {
  const { config } = useStore()

  const yPosition = (config.floors - 1 - data.currentFloor) * config.floorHeight

  return (
    <div style={{
      position: 'absolute',
      top: yPosition,
      left: data.id * 80,
      transition: `top ${config.movementSpeed}s linear`,
      width: '60px',
      height: '60px',
      border: '2px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      backgroundColor: data.alarm ? '#ff4444' : '#fff',
      borderColor: data.doorStatus === 'open' ? '#4CAF50' : '#333'
    }}>
      <div style={{ fontSize: 10 }}>
        {data.alarm && <div>警报!</div>}
        <div>门: {data.doorStatus === 'open' ? '开' : '关'}</div>
        <div>目标: {data.targetFloors.map(floor => floor + 1).join(',') || '无'}</div>
        <div>方向: {data.direction}</div>
      </div>
    </div>
  )
}

export default Elevator