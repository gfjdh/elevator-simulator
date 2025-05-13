// Building.tsx
import { useStore } from '../stores/useStore'
import Elevator from './Elevator'
import Floor from './Floor'

const Building = () => {
  const { elevators, config } = useStore()
  console.log('Current elevators:', elevators) // 调试输出
  return (
    <div className="building" style={{
      position: 'relative', // 添加定位上下文
      height: `${config.floors * config.floorHeight}px`,
      width: '800px' // 宽度限制
    }}>
      {/* 楼层渲染 */}
      {[...Array(config.floors)].map((_, i) => (
        <Floor key={i} number={config.floors - i - 1} />
      ))}

      {/* 电梯井道 */}
      <div className="elevator-shafts" style={{
        width: config.elevators * 80, // 根据电梯数量计算宽度
        position: 'absolute',
        top: 0,
        left: 70,
      }}>
        <div style={{ width: config.elevators * 80, height: `${config.floors * config.floorHeight}px`, background: 'gray' }}>电梯井道</div>
        {elevators.map(elev => (<Elevator key={elev.id} data={elev} />))}
      </div>
    </div>
  )
}

export default Building