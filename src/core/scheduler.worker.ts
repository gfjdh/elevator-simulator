// scheduler.worker.ts
self.onmessage = function (e) {
    const { elevators, request } = e.data

    const calculateScore = (elevator: any) => {
        if (elevator.alarm || elevator.status === 'doorOpen') return Infinity // 增加门开启状态排除
        const currentFloor = elevator.currentFloor
        const targetFloors = [...elevator.targetFloors]
        const direction = elevator.direction

        let baseTime = 0
        let lastFloor = currentFloor
        const basePath = calculateLOOKPath(targetFloors, direction)
        for (const floor of basePath) {
            baseTime += Math.abs(floor - lastFloor)
            lastFloor = floor
        }

        const newPath = calculateLOOKPath([...targetFloors, request.floor], direction)
        let newTime = 0
        lastFloor = currentFloor
        for (const floor of newPath) {
            newTime += Math.abs(floor - lastFloor)
            lastFloor = floor
        }

        const timeDiff = newTime - baseTime
        const loadFactor = targetFloors.length * 0.3
        const directionMatch = isDirectionMatch(elevator, request) ? -0.5 : 99
        const distance = Math.abs(currentFloor - request.floor) * 0.2

        return timeDiff + loadFactor + directionMatch + distance
    }

    const calculateLOOKPath = (floors: number[], direction: string) => {
        const uniqueFloors = [...new Set(floors)]
        if (direction === 'up') return uniqueFloors.sort((a, b) => a - b)
        if (direction === 'down') return uniqueFloors.sort((a, b) => b - a)
        const current = floors.length > 0 ? floors[0] : 0
        return uniqueFloors.sort((a, b) => Math.abs(a - current) - Math.abs(b - current))
    }

    const isDirectionMatch = (elevator: any, request: any) => {
        // 电梯空闲时匹配任何请求
        if (elevator.direction === 'none') return true
        
        // 电梯上行时：只匹配请求楼层高于当前且方向一致的上行请求
        if (elevator.direction === 'up') {
          return request.floor >= elevator.currentFloor && request.direction === 'up'
        }
        
        // 电梯下行时：只匹配请求楼层低于当前且方向一致的下行请求
        if (elevator.direction === 'down') {
          return request.floor <= elevator.currentfloor && request.direction === 'down'
        }
        return false
      }

    const scores = elevators.map((elevator: any) => ({
        id: elevator.id,
        score: calculateScore(elevator)
    }))

    const bestElevator = scores.reduce((prev: any, curr: any) =>
        curr.score < prev.score ? curr : prev
        , { id: -1, score: Infinity })

    self.postMessage({ bestElevatorId: bestElevator.id })
}