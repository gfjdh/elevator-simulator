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
      elevators: state.elevators.map(elev =>
        elev.id === id ? { ...elev, ...update } : elev
      )
    })),

  processMovement: () => {
    const state = get()
    state.elevators.forEach(elev => {
      if (elev.targetFloors.length > 0) {
        const target = elev.targetFloors[0]
        if (elev.currentFloor !== target) {
          const newFloor = elev.currentFloor + (target > elev.currentFloor ? 1 : -1)
          set({
            elevators: state.elevators.map(e =>
              e.id === elev.id ? {
                ...e,
                currentFloor: newFloor,
                status: 'moving',
                direction: target > newFloor ? 'up' : 'down'
              } : e
            )
          })
        } else {
          // 到达目标楼层
          set({
            elevators: state.elevators.map(e =>
              e.id === elev.id ? {
                ...e,
                targetFloors: e.targetFloors.slice(1),
                status: e.targetFloors.length > 1 ? 'moving' : 'idle'
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