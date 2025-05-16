// Elevator.tsx
import { useStore } from '../stores/useStore'
import type { ElevatorState } from '../core/type'
import { useState, useEffect } from 'react'

// Elevator.tsx
const Elevator = ({ data }: { data: ElevatorState }) => {
  const { config } = useStore()
  const [optimizedPath, setOptimizedPath] = useState<number[]>([])

  useEffect(() => {
    const optimizePath = () => {
      if (data.targetFloors.length === 0) return []
      
      const sorted = data.direction === 'up' 
        ? [...new Set(data.targetFloors)].sort((a, b) => a - b)
        : [...new Set(data.targetFloors)].sort((a, b) => b - a)
      
      // 移除当前楼层
      return sorted.filter(floor => floor !== data.currentFloor)
    }
    
    setOptimizedPath(optimizePath())
  }, [data.targetFloors, data.direction, data.currentFloor])

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
        <div>目标: {optimizedPath.join(',')}</div>
        <div>方向: {data.direction}</div>
      </div>
    </div>
  )
}

export default Elevator