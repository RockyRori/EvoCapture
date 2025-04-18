# ​**​EvoCapture（精灵：进化收集）​**​  
​**​支持 1-6 人本地游玩 | 策略收集 & 进化对战​**​  

![EvoCapture 游戏封面](/evo/public/cover.jpg)

## ​**​🎮 游戏下载​**​  
[无需下载点击即玩](https://rockyrori.github.io/EvoCapture/)

---

## ​**​📜 游戏规则​**​  

### ​**​🎯 游戏目标​**​  
玩家扮演 ​**​宝可梦研究员​**​，通过收集 ​**​进化石​**​、进化宝可梦、吸引 ​**​传说宝可梦​**​ 来获得 ​**​研究点数​**​。  
​**​第一个达到 15 点的玩家获胜​**​！ 

---

### ​**​🛠️ 游戏配件​**​  
1. ​**​进化石（5种）​**​  
   - 金之石、木之石、水之石、火之石、土之石  

2. ​**​宝可梦卡牌​**​  
   - ​**​初级（Lv1）​**​：40 张（0-1 点）  
   - ​**​中级（Lv2）​**​：30 张（1-3 点）  
   - ​**​高级（Lv3）​**​：20 张（3-5 点）  
   - 每局随机翻开 ​**​4 张/等级​**​ 供购买  

3. ​**​传说宝可梦卡​**​  
   - 10 张独特传说精灵

---

### ​**​🔄 游戏流程​**​  
玩家轮流行动，每回合选择 ​**​以下 1 种操作​**​：  

#### ​**​1️⃣ 收集进化石​**​  
- ​**​拿 3 种不同精灵球​**​（各 1 个）  
- ​**​或拿 2 个同种精灵球​**

#### ​**​2️⃣ 进化宝可梦​**​  
- 支付卡牌标注的进化石，获得该宝可梦及其点数  
- ​**​永久效果​**​：每张宝可梦卡可减少未来进化所需的同色石头 

#### ​**​3️⃣ 研究宝可梦​**​  
- ​**​预定 1 张宝可梦卡​**​（放入你的研究区，未来可进化）  
- ​**​奖励​**​：同时拿 1 个稀有大师球（若已无大师球则跳过） 

---

### ​**​⚖️ 特殊规则​**​  
- ​**​资源上限​**​：进化石不能超过 10，超出需丢弃  
- ​**​补充卡牌​**​：每当场上宝可梦被购买/预定，从对应等级牌堆补 1 张  
- ​**​单人模式​**​：1 人游玩时，与 AI 对手竞争（难度可调）  

---

### ​**​🏆 胜利条件​**​  
- 首位达到 ​**​玩家总数3倍积分​**​ 的玩家获胜 

---

## ​**​🚀 开始游戏​**​  
[无需下载点击即玩](https://rockyrori.github.io/EvoCapture/)
创建房间并邀请好友（支持 1-6 人同屏/分屏游玩）  

​**​✨ 小提示​**​：长按宝可梦卡可查看进化树和传说触发条件！  

---

### ​**​📢 更新日志​**​  
- 2025.08.20：新增 6 人模式与 2 种传说宝可梦  
- 2025.07.15：优化 AI 逻辑，修复本地联机延迟  

​**​宝可梦训练家们，开始进化之旅吧！​**​ 🌟  

---

## 特性

- **本地多人游戏**  
  支持 1 到 6 人加入同一局游戏，各玩家通过选择预设角色进入游戏大厅。

- **角色选择**  
  游戏开始前提供大厅界面，用户可从固定角色列表中选择角色。已选角色将不可重复加入。

- **完整游戏逻辑**  
  游戏涉及卡牌抽取、公共区卡牌更新、宝石代币管理、捕获与进化等核心玩法。

- **状态管理**  
  使用 React 的 Context 和 useReducer 管理全局状态，灵活处理游戏各个阶段的逻辑和状态变更。

- **响应式界面设计**  
  游戏和大厅界面均支持良好的用户交互体验，内置动画效果和组件布局，提升游戏体验。

---

## 项目结构

```
EvoCapture/
├── public/                  # 静态资源（如图片、favicon 等）
├── src/
│   ├── components/          # 部分通用组件（例如 Board、PlayerBoard、PlayerController、Lobby 等）
│   ├── data/
│   │   └── cards.json       # 游戏卡牌数据
│   ├── models/              # 类型定义（如 Card、Player、Token 等）
│   ├── store/
│   │   └── GameStore.tsx    # 全局状态管理和游戏逻辑 reducer
│   ├── views/
│   │   └── GameView.tsx     # 游戏主视图（负责展示大厅与游戏界面）
│   ├── App.tsx              # 应用入口组件
│   └── main.tsx             # React DOM 渲染入口
├── package.json             # 项目依赖及脚本配置
└── README.md                # 本文件
```

---

## 本地安装与使用

### 环境要求

- Node.js ( 建议使用 14 以上版本 )
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆仓库**

   ```bash
   git clone https://github.com/your_username/EvoCapture.git
   cd EvoCapture
   ```

2. **安装依赖**

   使用 npm：
   ```bash
   npm install
   ```

3. **启动开发服务器**

   使用 npm：
   ```bash
   npm run dev
   ```

---

## 游戏玩法

1. **大厅角色选择**  
   在游戏初始界面（大厅）中，玩家可以从固定的角色列表中选择加入游戏。点击“加入”按钮将当前角色添加到已加入列表中。  
   (对应代码：Lobby.tsx 与 Lobby.css)

2. **开始游戏**  
   当至少有一位玩家加入后，点击“开始游戏”按钮会触发游戏初始化逻辑，进入游戏界面。  
   游戏界面包括公共区卡牌、玩家控制器以及各玩家的个人板块等。

3. **游戏流程**  
   游戏包含玩家轮流进行操作，每个回合内玩家可以进行宝石代币的选择、卡牌捕获或卡牌进化等操作，直至某个玩家达到游戏胜利条件。

---

## 技术细节

- **React 与 Hooks**  
  使用函数组件、useState、useEffect 以及 useReducer 等 Hooks 实现组件的状态管理和交互逻辑。

- **全局状态管理**  
  使用 React Context 和 useReducer 封装全局状态管理，从而在组件间传递游戏状态和 dispatch 操作。

- **游戏逻辑实现**  
  游戏核心逻辑如卡牌抽取、捕获、进化等均在 `GameStore.tsx` 的 reducer 中实现。加入游戏、开始游戏等操作均通过 dispatch 对应的 action 来触发状态变更。

- **样式与布局**  
  借助 CSS 文件（如 Lobby.css）设计游戏界面，保证各模块在不同屏幕下的良好展示效果。

---

## 后续扩展

- **网络多人对战**  
  可扩展实现网络多人游戏，通过 WebSocket 或其他实时通信协议支持在线对战。

- **角色自定义**  
  允许玩家在加入游戏之前自定义昵称、头像等信息，提升个性化体验。

- **游戏数据持久化**  
  引入后端 API，实现游戏数据存储、对局记录查询等功能。

---

## 许可证

本项目采用 [AGPL 许可证](LICENSE)

