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
          // 应用更新，并处理 targetFloors 的排序
          const updatedElev = { ...elev, ...update };
          if (update.targetFloors) {
            // 去重并排序
            let sortedFloors = [...new Set(update.targetFloors)];
            if (updatedElev.direction === 'up') {
              sortedFloors.sort((a, b) => a - b);
            } else if (updatedElev.direction === 'down') {
              sortedFloors.sort((a, b) => b - a);
            } else {
              // 空闲时按距离当前楼层排序
              sortedFloors.sort((a, b) =>
                Math.abs(a - updatedElev.currentFloor) - Math.abs(b - updatedElev.currentFloor)
              );
            }
            updatedElev.targetFloors = sortedFloors;
          }
          return updatedElev;
        }
        return elev;
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
      movementSpeed: 0.5
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