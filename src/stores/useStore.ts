// useStore.ts
import { create } from 'zustand'
import type { BuildingConfig, ElevatorRequest, ElevatorState } from '../core/type'

interface StoreState {
  elevators: ElevatorState[]
  requests: ElevatorRequest[]
  config: BuildingConfig
  initialized: boolean
  initializeConfig: (floors: number, elevators: number) => void
  addRequest: (request: ElevatorRequest) => void
  updateElevator: (id: number, update: Partial<ElevatorState>) => void
  processMovement: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  elevators: Array.from({ length: 8 }, (_, i) => ({
    id: i,
    currentFloor: 0,
    targetFloors: [],
    status: 'idle' as const,
    direction: 'none' as const
  })),
  requests: [],
  config: {
    floors: 0,
    elevators: 0,
    floorHeight: 0, // px
    movementSpeed: 0
  },
  initialized: false,
  addRequest: (request) =>
    set(state => ({ requests: [...state.requests, request] })),

  updateElevator: (id, update) =>
    set(state => ({
      elevators: state.elevators.map(elev => {
        if (elev.id === id) {
          const updatedElev = { ...elev, ...update }
          
          // 智能合并目标楼层
          if (update.targetFloors) {
            const mergedFloors = [...new Set([...elev.targetFloors, ...update.targetFloors])]
            
            // 动态方向判断
            const currentDirection = updatedElev.direction
            const currentFloor = updatedElev.currentFloor
            
            // LOOK算法排序
            if (currentDirection === 'up') {
              mergedFloors.sort((a, b) => a - b)
              // 移除已经过的楼层
              updatedElev.targetFloors = mergedFloors.filter(f => f >= currentFloor)
            } else if (currentDirection === 'down') {
              mergedFloors.sort((a, b) => b - a)
              // 移除已经过的楼层
              updatedElev.targetFloors = mergedFloors.filter(f => f <= currentFloor)
            } else {
              // 空闲时按最近距离排序
              mergedFloors.sort((a, b) => 
                Math.abs(a - currentFloor) - Math.abs(b - currentFloor)
              )
            }
          }
          return updatedElev
        }
        return elev
      })
    })),

  processMovement: () => {
    const state = get()
    state.elevators.forEach(elev => {
      if (elev.targetFloors.length > 0) {
        const target = elev.targetFloors[0]
        if (elev.currentFloor !== target) {
          const direction = target > elev.currentFloor ? 'up' : 'down'
          const newFloor = elev.currentFloor + (direction === 'up' ? 1 : -1)
          set({
            elevators: state.elevators.map(e =>
              e.id === elev.id ? {
                ...e,
                currentFloor: newFloor,
                status: 'moving',
                direction: direction
              } : e
            )
          })
        } else {
          // 到达目标楼层
          const nextTarget = elev.targetFloors[1]
          const newDirection = nextTarget !== undefined ?
            (nextTarget > elev.currentFloor ? 'up' : 'down') : 'none'
          set({
            elevators: state.elevators.map(e =>
              e.id === elev.id ? {
                ...e,
                targetFloors: e.targetFloors.slice(1),
                status: e.targetFloors.length > 1 ? 'moving' : 'idle',
                direction: newDirection
              } : e
            )
          })
        }
      }
    })
  },
  initializeConfig: (floors, elevators) => set({
    config: {
      floors,
      elevators,
      floorHeight: 73, // px
      movementSpeed: 0.7
    },
    elevators: Array.from({ length: elevators }, (_, i) => ({
      id: i,
      currentFloor: 0,
      targetFloors: [],
      status: 'idle',
      direction: 'none'
    })),
    initialized: true
  }),
}))