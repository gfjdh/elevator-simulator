# 电梯模拟系统运行指南  
> 操作系统课程作业文档  

---

## 目录  
1. [环境要求](#环境要求)  
2. [启动步骤](#启动步骤)  
3. [项目背景与需求](#项目背景与需求)  
4. [系统架构](#系统架构)  
   - [文件结构](#文件结构)  
   - [核心类与组件](#核心类与组件)  
5. [核心功能实现](#核心功能实现)  
   - [调度算法](#调度算法)  
   - [状态管理](#状态管理)  
   - [电梯移动逻辑](#电梯移动逻辑)  
6. [用户交互](#用户交互)  
7. [运行流程](#运行流程)   

---

## 环境要求  
- **Node.js**: v16 或更高版本（需支持 ES6 模块和 Web Workers）  
- **包管理器**: npm 或 yarn  
- **浏览器**: 现代浏览器（推荐 Chrome 90+，需支持 CSS3 动画和 Web Workers）  
- **网络环境**: 本地开发无需网络，生产环境需确保端口 3000 未被占用  

---

## 启动步骤  
1. **克隆项目**：  
   ```bash  
   git clone https://github.com/gfjdh/elevator-simulator.git  
   cd elevator-simulator  
   ```  

2. **安装依赖**：  
   ```bash  
   npm install --legacy-peer-deps  
   ```  
   *注：使用 `--legacy-peer-deps` 以兼容部分旧版依赖*  

3. **启动开发服务器**（调试用）：  
   ```bash  
   npm run dev  
   ```  
   访问 `http://localhost:5173`（Vite 默认端口）  

4. **构建生产版本**：  
   ```bash  
   npm run build  
   ```  

5. **启动生产服务器**：  
   ```bash  
   npx serve -s build  
   ```  
   访问 `http://localhost:3000`  

---

## 项目背景与需求  
### 功能需求  
1. **基础功能**：  
   - 模拟 20 层建筑，配置 5 部互联电梯（具体配置可调节） 
   - 每部电梯支持数字键、开关门、报警、方向指示等功能  
   - 楼层按钮联动：按下某一楼层的上行/下行按钮，等效按下所有电梯对应按钮 

2. **调度需求**：  
   - 初始状态所有电梯停靠 1 层（索引为 0）  
   - 若无请求，电梯保持静止  
   - 动态调度：基于电梯当前状态（方向、负载、距离）分配最优电梯  

3. **可视化需求**：  
   - 实时显示电梯位置、状态、目标楼层  
   - 楼层按钮状态反馈（按下/未按下）  
   - 报警状态红色提示  

---

## 系统架构  
### 核心文件结构  
```sh  
elevator-simulator  
│  
├─build/                 # 生产构建输出  
│  
└─src/  
   ├─components/         # React 组件  
   │  Building.tsx       # 建筑主体渲染  
   │  ControlPanel.tsx   # 电梯控制面板  
   │  Elevator.tsx       # 单部电梯可视化  
   │  Floor.tsx          # 单层楼按钮与显示  
   │  StartScreen.tsx    # 初始配置界面  
   │  
   ├─core/               # 核心逻辑  
   │  scheduler.ts       # 调度器类（主线程）  
   │  scheduler.worker.ts # Web Worker 调度计算  
   │  type.ts            # 类型定义（电梯状态、配置等）  
   │  
   ├─stores/  
   │  useStore.ts        # Zustand 全局状态管理  
   │  
   ├─App.tsx             # 根组件  
   └─main.tsx            # 应用入口  
```  

---

### 核心类与组件  
#### 1. **Scheduler 类**  
- **职责**：电梯请求分配与路径规划  
- **继承关系**：封装为独立类，与 Web Worker 协同工作  
- **关键方法**：  
  ```typescript  
  assignRequest(request: ElevatorRequest): Promise<number>  
  ```  
  - **功能**：通过 Web Worker 计算最佳电梯  
  - **流程**：  
    1. 克隆当前电梯状态
    2. 发送数据到 Web Worker  
    3. 接收计算结果并返回最佳电梯 ID  

- **Web Worker 逻辑**（`scheduler.worker.ts`）：  
  ```typescript  
  self.onmessage = (e) => {  
    const { elevators, request } = e.data;  
    // 计算每个电梯的调度评分  
    const scores = elevators.map(calculateScore);  
    // 选择评分最低的（响应最快）电梯  
    const bestElevator = scores.reduce((prev, curr) => ... );  
    self.postMessage({ bestElevatorId: bestElevator.id });  
  }  
  ```  

#### 2. **StoreState 类（useStore.ts）**  
- **技术栈**：基于 Zustand 实现全局状态管理  
- **核心状态**：  
  ```typescript  
  interface StoreState {  
    elevators: ElevatorState[];  // 所有电梯状态  
    requests: ElevatorRequest[]; // 请求队列  
    config: BuildingConfig;      // 楼层/电梯数/速度  
    initialized: boolean;        // 是否完成初始化  
  }  
  ```  

- **关键方法**：  
  - `processMovement()`：驱动电梯移动的主循环  
    ```typescript  
    // 每 N 秒触发（N = movementSpeed）  
    elevators.forEach(elev => {  
      if (elev.targetFloors.length > 0) {  
        const nextFloor = elev.targetFloors[0];  
        // 移动电梯或开门  
      }  
    });  
    ```  
  - `updateElevator()`：更新电梯状态并重新排序目标楼层  
    ```typescript  
    // 示例：插入新目标楼层并按 LOOK 算法排序  
    if (direction === 'up') {  
      targetFloors = [...upFloors, ...downFloors];  
    }  
    ```  

#### 3. **Elevator 组件（Elevator.tsx）**  
- **功能**：可视化单部电梯的实时状态  
- **核心属性**：  
  - `yPosition`: 基于 `currentFloor` 计算的垂直位置  
  - `transition`: 平滑移动动画（时长由 `movementSpeed` 控制）  
- **状态反馈**：  
  - 背景色：红色表示报警，绿色边框表示门已开  
  - 文字显示：目标楼层、方向、门状态  

#### 4. **Floor 组件（Floor.tsx）**  
- **功能**：渲染楼层按钮与电梯状态显示  
- **交互逻辑**：  
  ```typescript  
  const handleCall = (direction: 'up' | 'down') => {  
    addRequest({ floor: number, direction }); // 全局状态更新  
  }  
  ```  
- **UI 元素**：  
  - 上行/下行按钮（▲/▼）  
  - 当前楼层标签  

---

## 核心功能实现  
### 调度算法  
#### 1. **评分模型**  
- **计算公式**：  
  ```  
  score = timeDiff + loadFactor + directionMatch + distance  
  ```  
  - **timeDiff**：插入新请求后路径时间差  
  - **loadFactor**：当前目标数 × 0.3（负载惩罚）  
  - **directionMatch**：方向匹配奖励（-0.5）或不匹配惩罚（99）  
  - **distance**：电梯与请求楼层的距离 × 0.2  

- **路径规划**（LOOK 算法）：  
  ```typescript  
  function calculateLOOKPath(floors: number[], direction: string) {  
    if (direction === 'up') return floors.sort((a, b) => a - b);  
    if (direction === 'down') return floors.sort((a, b) => b - a);  
    // 空闲状态按最近距离排序  
  }  
  ```  

#### 2. **方向匹配规则**  
- **上行电梯**：仅响应 `floor >= currentFloor` 的上行请求  
- **下行电梯**：仅响应 `floor <= currentFloor` 的下行请求  
- **空闲电梯**：响应任意方向请求  

#### 3. **动态排除规则**  
- **排除条件**：  
  - 电梯处于报警状态  
  - 电梯门未关闭（`doorStatus === 'open'`）  

---

### 状态管理  
#### 1. **电梯状态更新**  
- **关键字段**：  
  ```typescript  
  interface ElevatorState {  
    status: 'idle' | 'moving' | 'doorOpen';  
    direction: 'up' | 'down' | 'none';  
    targetFloors: number[];      // 目标楼层队列  
    doorTimer?: number;          // 自动关门定时器  
  }  
  ```  

#### 2. **请求队列处理**  
- **流程**：  
  1. 用户按下楼层按钮，触发 `addRequest`  
  2. 主线程通过 `scheduler.assignRequest` 分配电梯  
  3. 更新目标楼层队列并重新排序  

---

### 电梯移动逻辑  
1. **逐层移动**：  
   - 每次 `processMovement` 调用，电梯移动一层  
   - 方向由目标队列的第一个楼层决定  

2. **自动开门/关门**：  
   - 到达目标楼层后，门自动开启并启动 5 秒定时器  
   - 定时结束或手动关门后，门关闭并检测下一目标  

3. **报警处理**：  
   - 触发报警时，清空目标队列并强制返回待机状态，此时电梯仅允许使用开门键  

---

## 用户交互  
### 控制面板（ControlPanel.tsx）  
- **功能**：  
  - 选择电梯并手动设置目标楼层  
  - 手动开关门  
  - 触发报警  

- **UI 元素**：  
  - 电梯选择下拉菜单  
  - 开关门按钮组  
  - 楼层按钮矩阵（按配置动态生成）  

### 初始配置界面（StartScreen.tsx）  
- **可配置参数**：  
  - 楼层数（2-40）  
  - 电梯数量（1-10）  
  - 运行速度（0.1-2 秒/层）  

---

## 运行流程  
1. **初始化**：用户配置楼层/电梯参数后进入模拟界面  
2. **请求发起**：用户按下楼层按钮，生成调度请求  
3. **调度计算**：Web Worker 计算最佳电梯并更新目标队列  
4. **电梯移动**：逐层移动并处理开关门逻辑  
5. **状态同步**：全局状态实时更新并渲染到界面  