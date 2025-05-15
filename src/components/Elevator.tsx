// Elevator.tsx
import { useStore } from '../stores/useStore'
import type { ElevatorState } from '../core/type'

const Elevator = ({ data }: { data: ElevatorState }) => {
  const { config } = useStore()
  const yPosition = (config.floors - 1 - data.currentFloor) * config.floorHeight;

  return (
    <div style={{ 
      position: 'absolute',
      top: yPosition,
      left: data.id * 80,
      transition: `top ${config.movementSpeed}s linear`
    }}>
      Elevator {data.id + 1}
    </div>
  )
}

export default Elevator