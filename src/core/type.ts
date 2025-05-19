// type.ts
export interface ElevatorState {
  id: number
  currentFloor: number
  targetFloors: number[]
  status: 'idle' | 'moving' | 'doorOpen'
  direction: 'up' | 'down' | 'none'
  doorStatus: 'open' | 'closed'
  alarm: boolean
  doorTimer?: number
}

export interface BuildingConfig {
  floors: number
  elevators: number
  floorHeight: number
  movementSpeed: number  // 秒/层
}

export type ElevatorRequest = {
  floor: number
  direction: 'up' | 'down'
}