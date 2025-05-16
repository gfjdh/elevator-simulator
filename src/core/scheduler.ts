// scheduler.ts
import type { ElevatorRequest, ElevatorState } from "./type"

export interface ElevatorScore {
  id: number
  score: number
}

export class Scheduler {
  private elevators: ElevatorState[]
  
  constructor(initialState: ElevatorState[]) {
    this.elevators = initialState
  }

  async assignRequest(request: ElevatorRequest): Promise<number> {
    const worker = new Worker(new URL('./scheduler.worker.ts', import.meta.url))
    
    return new Promise((resolve) => {
      worker.postMessage({
        elevators: this.elevators.map(e => ({
          ...e,
          // 克隆目标楼层数组
          targetFloors: [...e.targetFloors]
        })),
        request
      })

      worker.onmessage = (e) => {
        resolve(e.data.bestElevatorId)
        worker.terminate()
      }
    })
  }
}