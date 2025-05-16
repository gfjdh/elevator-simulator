// scheduler.worker.ts
self.onmessage = function (e) {
    const { elevators, request } = e.data

    const calculateScore = (elevator: any) => {
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
        const directionMatch = isDirectionMatch(elevator, request) ? -0.5 : 0
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
        if (elevator.direction === 'none') return true
        if (elevator.direction === 'up' && request.floor >= elevator.currentFloor) return true
        if (elevator.direction === 'down' && request.floor <= elevator.currentFloor) return true
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