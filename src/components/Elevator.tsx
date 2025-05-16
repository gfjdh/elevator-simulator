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
      backgroundColor: '#fff',
      border: '2px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold'
    }}>
      <div style={{ fontSize: 10 }}>
      <div>目标: {data.targetFloors.map(floor => floor + 1).join(',')}</div>
        <div>方向: {data.direction}</div>
      </div>
    </div>
  )
}

export default Elevator