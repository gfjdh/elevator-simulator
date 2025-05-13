// scheduler.ts
import type { ElevatorRequest, ElevatorState } from "./type"

export class Scheduler {
    private elevators: ElevatorState[]
    
    constructor(initialState: ElevatorState[]) {
      this.elevators = initialState
    }
  
    assignRequest(request: ElevatorRequest): number {
      // 简单实现：选择最近的可用电梯
      const available = this.elevators.filter(
        e => e.status === 'idle' || 
             e.direction === request.direction
      )
  
      const closest = available.reduce((prev, curr) => {
        const prevDist = Math.abs(prev.currentFloor - request.floor)
        const currDist = Math.abs(curr.currentFloor - request.floor)
        return currDist < prevDist ? curr : prev
      }, available[0])
  
      return closest?.id ?? -1
    }
  }