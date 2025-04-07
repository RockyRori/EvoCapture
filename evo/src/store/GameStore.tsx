// src/store/GameStore.tsx
import React, { createContext, useContext, useReducer } from 'react';
import type { Card } from '../models/Card';
import type { Player } from '../models/Player';
import type { Token } from '../models/Token';

// 从外部 JSON 文件中引入所有卡牌数据
import cardsData from '../data/cards.json';

// 示例宝石代币数据：6种宝石
const TokensPool: Token[] = [
  { type: 'metal', count: 0 },
  { type: 'wood', count: 0 },
  { type: 'water', count: 0 },
  { type: 'fire', count: 0 },
  { type: 'earth', count: 0 },
  { type: 'special', count: 0 },
];

// 示例玩家数据
const Players: Player[] = [
  {
    id: 1,
    name: 'John',
    avatar: '/avatar/John.png',
    tokens: {
      "metal": 0,
      "wood": 0,
      "water": 0,
      "fire": 0,
      "earth": 0,
      "special": 0,
    },
    cards: [],
    reservedCards: [],
    points: 0,
  },
  {
    id: 2,
    name: 'Emma',
    avatar: '/avatar/Emma.png',
    tokens: {
      "metal": 0,
      "wood": 0,
      "water": 0,
      "fire": 0,
      "earth": 0,
      "special": 0,
    },
    cards: [],
    reservedCards: [],
    points: 0,
  }, {
    id: 3,
    name: 'Mike',
    avatar: '/avatar/Mike.png',
    tokens: {
      "metal": 0,
      "wood": 0,
      "water": 0,
      "fire": 0,
      "earth": 0,
      "special": 0,
    },
    cards: [],
    reservedCards: [],
    points: 0,
  }, {
    id: 4,
    name: 'Lucy',
    avatar: '/avatar/Lucy.png',
    tokens: {
      "metal": 0,
      "wood": 0,
      "water": 0,
      "fire": 0,
      "earth": 0,
      "special": 0,
    },
    cards: [],
    reservedCards: [],
    points: 0,
  }, {
    id: 5,
    name: 'David',
    avatar: '/avatar/David.png',
    tokens: {
      "metal": 0,
      "wood": 0,
      "water": 0,
      "fire": 0,
      "earth": 0,
      "special": 0,
    },
    cards: [],
    reservedCards: [],
    points: 0,
  }, {
    id: 6,
    name: 'Anna',
    avatar: '/avatar/Anna.png',
    tokens: {
      "metal": 0,
      "wood": 0,
      "water": 0,
      "fire": 0,
      "earth": 0,
      "special": 0,
    },
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
  deckLevel1: cardsData.Level1,
  deckLevel2: cardsData.Level2,
  deckLevel3: cardsData.Level3,
  deckLevel9: cardsData.Level9,

  boardLevel1: [],
  boardLevel2: [],
  boardLevel3: [],
  boardLevel9: [],

  tokensPool: TokensPool,
  players: Players,
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
      // 如果需要洗牌，可以在此处对每个数组 shuffle
      const newDeck1 = shuffle([...initialState.deckLevel1]);
      const newDeck2 = shuffle([...initialState.deckLevel2]);
      const newDeck3 = shuffle([...initialState.deckLevel3]);
      const newDeck9 = shuffle([...initialState.deckLevel9]);

      // 从玩家列表长度推断展示卡牌数量
      const playerCount = initialState.players.length;

      // 抽取对应数量的卡牌到桌面
      let level1: number = 1;
      switch (playerCount) {
        case 2: level1 = 3; break;
        case 3: level1 = 3; break;
        case 4: level1 = 4; break;
        case 5: level1 = 4; break;
        case 6: level1 = 5; break;
        default: level1 = 1;
      }
      let level2: number = level1 - 1 > 0 ? level1 - 1 : 1;
      let level3: number = level2 - 1 > 0 ? level2 - 1 : 1;
      let level9: number = 2;

      const newBoard1 = newDeck1.splice(0, level1);
      const newBoard2 = newDeck2.splice(0, level2);
      const newBoard3 = newDeck3.splice(0, level3);
      const newBoard9 = newDeck9.splice(0, level9);

      let tokensPool = initialState.tokensPool;
      tokensPool.forEach((token) => {
        token.count = playerCount + 1;
      })

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
        // 更新代币
        tokensPool: tokensPool,
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
