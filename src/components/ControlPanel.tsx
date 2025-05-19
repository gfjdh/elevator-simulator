// ControlPanel.tsx
import { useStore } from '../stores/useStore'
import { useState } from 'react'

const ControlPanel = () => {
  const { elevators, config, updateElevator } = useStore()
  const [selectedElevator, setSelectedElevator] = useState(0)
  const currentElevator = elevators.find(e => e.id === selectedElevator)

  const handleFloorSelect = (floor: number) => {
    if (!currentElevator || currentElevator.alarm) return
    const newTargets = [...currentElevator.targetFloors, floor]
    updateElevator(selectedElevator, {
      targetFloors: [...new Set(newTargets)] // 去重
    })
  }

  const handleOpenDoor = () => {
    if (!currentElevator) return

    if (['idle', 'doorOpen'].includes(currentElevator.status)) {
      // 重置定时器
      if (currentElevator.doorTimer) clearTimeout(currentElevator.doorTimer)
      const timer = window.setTimeout(() => {
        useStore.getState().updateElevator(selectedElevator, {
          status: 'idle',
          doorStatus: 'closed',
          doorTimer: undefined
        })
      }, 5000)

      updateElevator(selectedElevator, {
        status: 'doorOpen',
        doorStatus: 'open',
        doorTimer: timer
      })
    }
  }

  const handleCloseDoor = () => {
    if (!currentElevator || currentElevator.status !== 'doorOpen') return
    if (currentElevator.doorTimer) clearTimeout(currentElevator.doorTimer)
    updateElevator(selectedElevator, {
      status: currentElevator.targetFloors.length ? 'moving' : 'idle',
      doorStatus: 'closed',
      doorTimer: undefined
    })
  }

  const handleAlarm = () => {
    if (currentElevator?.doorTimer) clearTimeout(currentElevator.doorTimer)
    updateElevator(selectedElevator, {
      alarm: true,
      targetFloors: [],
      status: 'idle',
      direction: 'none',
      doorTimer: undefined // 清除定时器
    })
  }

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: '300px',
      height: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderLeft: '2px solid #ddd'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <label>选择电梯：</label>
        <select
          value={selectedElevator}
          onChange={(e) => setSelectedElevator(Number(e.target.value))}
          style={{ padding: '5px', width: '100%' }}
        >
          {elevators.map(e => (
            <option key={e.id} value={e.id}>电梯 {e.id + 1}</option>
          ))}
        </select>
      </div>

      {currentElevator && (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <p>状态：{currentElevator.status === 'idle' ? '待机' : '运行中'}</p>
            <p>方向：{{
              'up': '上行 ▲',
              'down': '下行 ▼',
              'none': '停止'
            }[currentElevator.direction]}</p>
            <p>当前楼层：{currentElevator.currentFloor + 1} 层</p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <button
              onClick={handleOpenDoor}
              disabled={!['idle', 'doorOpen'].includes(currentElevator.status)}
            >
              开门
            </button>
            <button
              onClick={handleCloseDoor}
              disabled={currentElevator.status !== 'doorOpen'}
            >
              关门
            </button>
            <button
              onClick={handleAlarm}
              disabled={currentElevator.alarm}
            >
              警报
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px'
          }}>
            {[...Array(config.floors)].map((_, floor) => (
              <button
                key={floor}
                onClick={() => handleFloorSelect(floor)}
                style={{
                  padding: '10px',
                  background: currentElevator.targetFloors.includes(floor)
                    ? '#4CAF50'
                    : '#e0e0e0',
                  border: '1px solid #ccc'
                }}
              >
                {floor + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ControlPanel