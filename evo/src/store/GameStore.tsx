// src/store/GameStore.tsx
import React, { createContext, useContext, useReducer } from 'react';
import type { Card } from '../models/Card';
import type { Player } from '../models/Player';
import type { Token } from '../models/Token';

// 从外部 JSON 文件中引入所有卡牌数据
import boardLevelsData from '../data/cards.json';

// 示例宝石代币数据：6种宝石
const sampleTokensPool: Token[] = [
  { type: 'metal', count: 5 },
  { type: 'wood', count: 5 },
  { type: 'water', count: 5 },
  { type: 'fire', count: 5 },
  { type: 'earth', count: 5 },
  { type: 'special', count: 5 },
];

// 示例玩家数据
const samplePlayers: Player[] = [
  {
    id: 1,
    name: 'John',
    avatar: '/avatar/John.png',
    tokens: [
      { type: 'metal', count: 0 },
      { type: 'wood', count: 0 },
      { type: 'water', count: 0 },
      { type: 'fire', count: 0 },
      { type: 'earth', count: 0 },
      { type: 'special', count: 0 },
    ],
    cards: [],
    reservedCards: [],
    points: 0,
  },
  {
    id: 2,
    name: 'Emma',
    avatar: '/avatar/Emma.png',
    tokens: [
      { type: 'metal', count: 0 },
      { type: 'wood', count: 0 },
      { type: 'water', count: 0 },
      { type: 'fire', count: 0 },
      { type: 'earth', count: 0 },
      { type: 'special', count: 0 },
    ],
    cards: [],
    reservedCards: [],
    points: 0,
  },{
    id: 3,
    name: 'Mike',
    avatar: '/avatar/Mike.png',
    tokens: [
      { type: 'metal', count: 0 },
      { type: 'wood', count: 0 },
      { type: 'water', count: 0 },
      { type: 'fire', count: 0 },
      { type: 'earth', count: 0 },
      { type: 'special', count: 0 },
    ],
    cards: [],
    reservedCards: [],
    points: 0,
  },{
    id: 4,
    name: 'Lucy',
    avatar: '/avatar/Lucy.png',
    tokens: [
      { type: 'metal', count: 0 },
      { type: 'wood', count: 0 },
      { type: 'water', count: 0 },
      { type: 'fire', count: 0 },
      { type: 'earth', count: 0 },
      { type: 'special', count: 0 },
    ],
    cards: [],
    reservedCards: [],
    points: 0,
  },{
    id: 5,
    name: 'David',
    avatar: '/avatar/David.png',
    tokens: [
      { type: 'metal', count: 0 },
      { type: 'wood', count: 0 },
      { type: 'water', count: 0 },
      { type: 'fire', count: 0 },
      { type: 'earth', count: 0 },
      { type: 'special', count: 0 },
    ],
    cards: [],
    reservedCards: [],
    points: 0,
  },{
    id: 6,
    name: 'Anna',
    avatar: '/avatar/Anna.png',
    tokens: [
      { type: 'metal', count: 0 },
      { type: 'wood', count: 0 },
      { type: 'water', count: 0 },
      { type: 'fire', count: 0 },
      { type: 'earth', count: 0 },
      { type: 'special', count: 0 },
    ],
    cards: [],
    reservedCards: [],
    points: 0,
  }
];

// 如果需要洗牌，可在此定义一个 shuffle 函数
function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export interface GameState {
  // 牌库：存放所有卡牌
  deckLevel1: Card[];
  deckLevel2: Card[];
  deckLevel3: Card[];
  deckLevel9: Card[];

  // 桌面：实际展示的卡牌
  boardLevel1: Card[];
  boardLevel2: Card[];
  boardLevel3: Card[];
  boardLevel9: Card[];

  tokensPool: Token[];
  players: Player[];
  currentPlayerIndex: number;
  isGameOver: boolean;
}

// 初始状态：先把所有卡牌放到 deck 里，board 为空
const initialState: GameState = {
  deckLevel1: boardLevelsData.boardLevel1,
  deckLevel2: boardLevelsData.boardLevel2,
  deckLevel3: boardLevelsData.boardLevel3,
  deckLevel9: boardLevelsData.boardLevel9,

  boardLevel1: [],
  boardLevel2: [],
  boardLevel3: [],
  boardLevel9: [],

  tokensPool: sampleTokensPool,
  players: samplePlayers,
  currentPlayerIndex: 0,
  isGameOver: false,
};

type Action =
  | { type: 'INIT_GAME' }
  | { type: 'NEXT_TURN' }
  | { type: 'PICK_TOKENS'; payload: string[] }
  | { type: 'BUY_CARD'; payload: Card }
  | { type: 'RESERVE_CARD'; payload: Card }
  | { type: 'CHECK_GAME_END' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT_GAME': {
      // 复制初始状态，避免直接修改 initialState
      const newDeck1 = [...initialState.deckLevel1];
      const newDeck2 = [...initialState.deckLevel2];
      const newDeck3 = [...initialState.deckLevel3];
      const newDeck9 = [...initialState.deckLevel9];

      // 如果需要洗牌，可以在此处对每个数组 shuffle
      // const newDeck1 = shuffle([...initialState.deckLevel1]);
      // const newDeck2 = shuffle([...initialState.deckLevel2]);
      // const newDeck3 = shuffle([...initialState.deckLevel3]);
      // const newDeck9 = shuffle([...initialState.deckLevel9]);

      // 从玩家列表长度推断展示卡牌数量
      const playerCount = initialState.players.length;

      // 抽取对应数量的卡牌到桌面
      const newBoard1 = newDeck1.splice(0, playerCount + 1);
      const newBoard2 = newDeck2.splice(0, playerCount + 1);
      const newBoard3 = newDeck3.splice(0, playerCount + 1);
      const newBoard9 = newDeck9.splice(0, 2);

      return {
        ...initialState,
        // 更新剩余牌库
        deckLevel1: newDeck1,
        deckLevel2: newDeck2,
        deckLevel3: newDeck3,
        deckLevel9: newDeck9,
        // 更新桌面展示
        boardLevel1: newBoard1,
        boardLevel2: newBoard2,
        boardLevel3: newBoard3,
        boardLevel9: newBoard9,
      };
    }
    case 'NEXT_TURN':
      return {
        ...state,
        currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
      };
    case 'PICK_TOKENS':
      return state;
    case 'BUY_CARD':
      return state;
    case 'RESERVE_CARD':
      return state;
    case 'CHECK_GAME_END':
      return state;
    default:
      return state;
  }
}

interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

export const useGameStore = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameStore 必须在 GameProvider 中使用');
  }
  return context;
};
