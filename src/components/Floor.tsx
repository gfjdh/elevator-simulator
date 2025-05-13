// Floor.tsx
import { useStore } from '../stores/useStore'

const Floor = ({ number }: { number: number }) => {
  const addRequest = useStore(state => state.addRequest)

  const handleCall = (direction: 'up' | 'down') => {
    addRequest({
      floor: number,
      direction
    })
  }

  return (
    <div className="floor" style={{ borderBottom: '1px solid #ccc' }}>
      <br />
      <span>Floor {number + 1}</span>
      <div className="buttons">
        <button onClick={() => handleCall('up')}>▲</button>
        <button onClick={() => handleCall('down')}>▼</button>
      </div>
    </div>
  )
}

export default Floor