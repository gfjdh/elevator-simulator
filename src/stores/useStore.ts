// useStore.ts
import { create } from 'zustand'
import type { BuildingConfig, ElevatorRequest, ElevatorState } from '../core/type'

interface StoreState {
  elevators: ElevatorState[]
  requests: ElevatorRequest[]
  config: BuildingConfig
  initialized: boolean
  initializeConfig: (floors: number, elevators: number, movementSpeed: number) => void
  addRequest: (request: ElevatorRequest) => void
  updateElevator: (id: number, update: Partial<ElevatorState>) => void
  processMovement: () => void
}

export const useStore = create<StoreState>((set) => ({
  elevators: Array.from({ length: 8 }, (_, i) => ({
    id: i,
    currentFloor: 0,
    targetFloors: [],
    status: 'idle' as const,
    direction: 'none' as const,
    doorStatus: 'closed' as const,
    alarm: false,
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
          // 清除旧定时器
          if (update.doorStatus === 'closed' || update.status === 'moving') {
            if (elev.doorTimer) clearTimeout(elev.doorTimer)
          }
          const updatedElev = { ...elev, ...update };
          // 处理警报状态
          if (update.alarm) {
            updatedElev.targetFloors = []
            updatedElev.status = 'idle'
            updatedElev.direction = 'none'
            if (updatedElev.doorTimer) {
              clearTimeout(updatedElev.doorTimer)
              updatedElev.doorTimer = undefined
            }
          }

          if (update.targetFloors) {
            const mergedFloors = [...new Set([...elev.targetFloors, ...update.targetFloors])];
            const currentFloor = updatedElev.currentFloor;
            const currentDirection = updatedElev.direction;

            // 新的排序逻辑
            if (currentDirection === 'up') {
              // 上行时：先处理所有上行目标，再处理下行目标
              const upFloors = mergedFloors.filter(f => f >= currentFloor).sort((a, b) => a - b);
              const downFloors = mergedFloors.filter(f => f < currentFloor).sort((a, b) => b - a);
              updatedElev.targetFloors = [...upFloors, ...downFloors];
            } else if (currentDirection === 'down') {
              // 下行时：先处理所有下行目标，再处理上行目标
              const downFloors = mergedFloors.filter(f => f <= currentFloor).sort((a, b) => b - a);
              const upFloors = mergedFloors.filter(f => f > currentFloor).sort((a, b) => a - b);
              updatedElev.targetFloors = [...downFloors, ...upFloors];
            } else {
              // 空闲时按最近距离排序
              mergedFloors.sort((a, b) =>
                Math.abs(a - currentFloor) - Math.abs(b - currentFloor)
              );
              updatedElev.targetFloors = mergedFloors;
            }
          }
          return updatedElev;
        }
        return elev;
      })
    })),

  processMovement: () => {
    set((state) => {
      // 原子化更新所有电梯状态
      const newElevators = state.elevators.map(elev => {
        if (elev.targetFloors.length === 0 || elev.status == 'doorOpen') return elev;

        // 独立处理每个电梯的移动逻辑
        const nextFloor = elev.targetFloors[0];
        const movement = nextFloor - elev.currentFloor;

        // 生成新状态但不立即应用
        const newState = { ...elev };

        if (movement !== 0) {
          newState.currentFloor += movement > 0 ? 1 : -1
        } else {
          newState.targetFloors = elev.targetFloors.slice(1)
          newState.status = 'doorOpen'
          newState.doorStatus = 'open'
          
          // 设置自动关门定时器
          if (elev.doorTimer) clearTimeout(elev.doorTimer)
          newState.doorTimer = window.setTimeout(() => {
            useStore.getState().updateElevator(elev.id, {
              status: newState.targetFloors.length ? 'moving' : 'idle',
              doorStatus: 'closed',
              direction: newState.targetFloors.length 
                ? (newState.targetFloors[0] > newState.currentFloor ? 'up' : 'down')
                : 'none',
              doorTimer: undefined
            })
          }, 5000)
        }

        return newState;
      });

      return { elevators: newElevators };
    });
  },
  initializeConfig: (floors, elevators, Speed) => set({
    config: {
      floors,
      elevators,
      floorHeight: 73, // px
      movementSpeed: Speed
    },
    elevators: Array.from({ length: elevators }, (_, i) => ({
      id: i,
      currentFloor: 0,
      targetFloors: [],
      status: 'idle',
      direction: 'none',
      doorStatus: 'closed',
      alarm: false,
    })),
    initialized: true
  }),
}))