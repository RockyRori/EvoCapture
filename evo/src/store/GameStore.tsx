// src/store/GameStore.tsx
import React, { createContext, useContext, useReducer } from 'react';
import type { Card } from '../models/Card';
import type { Player } from '../models/Player';
import type { Token } from '../models/Token';

/** 示例数据 */

// 示例卡牌数据
const sampleBoardLevel1: Card[] = [
  {
    id: 1,
    level: 1,
    cost: { red: 1, blue: 1 },
    rewardGemType: 'red',
    points: 1,
    imageUrl: '/level1/1001.png',
  },
  {
    id: 2,
    level: 1,
    cost: { red: 2 },
    rewardGemType: 'blue',
    points: 0,
    imageUrl: 'OTHER',
  },
];

const sampleBoardLevel2: Card[] = [
  {
    id: 3,
    level: 2,
    cost: { blue: 2, green: 1 },
    rewardGemType: 'green',
    points: 2,
    imageUrl: '/level2/2001.png',
  },
];

const sampleBoardLevel3: Card[] = [
  {
    id: 4,
    level: 3,
    cost: { red: 3, green: 2 },
    rewardGemType: 'blue',
    points: 3,
    imageUrl: '/level3/3001.png',
  },
];

// 示例宝石代币数据
const sampleTokensPool: Token[] = [
  { type: 'red', count: 5 },
  { type: 'blue', count: 5 },
  { type: 'green', count: 5 },
  { type: 'yellow', count: 5 },
  { type: 'black', count: 5 },
];

// 示例玩家数据
const samplePlayers: Player[] = [
  {
    id: 1,
    name: 'Alice',
    tokens: { red: 1, blue: 0, green: 0, yellow: 0, black: 0 },
    cards: [],
    reservedCards: [],
    points: 0,
  },
  {
    id: 2,
    name: 'Bob',
    tokens: { red: 0, blue: 1, green: 0, yellow: 0, black: 0 },
    cards: [],
    reservedCards: [],
    points: 0,
  },
];

export interface GameState {
  deckLevel1: Card[];
  deckLevel2: Card[];
  deckLevel3: Card[];
  boardLevel1: Card[];
  boardLevel2: Card[];
  boardLevel3: Card[];
  tokensPool: Token[];
  players: Player[];
  currentPlayerIndex: number;
  isGameOver: boolean;
}

const initialState: GameState = {
  deckLevel1: [],
  deckLevel2: [],
  deckLevel3: [],
  boardLevel1: sampleBoardLevel1,
  boardLevel2: sampleBoardLevel2,
  boardLevel3: sampleBoardLevel3,
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
    case 'INIT_GAME':
      // 重置游戏状态为初始数据
      return { ...initialState };
    case 'NEXT_TURN':
      return {
        ...state,
        currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
      };
    case 'PICK_TOKENS':
      // 根据规则更新 tokensPool 及当前玩家的 tokens，这里暂时不做逻辑处理
      return state;
    case 'BUY_CARD':
      // 检查宝石是否足够、更新玩家卡牌和分数等，暂时返回当前状态
      return state;
    case 'RESERVE_CARD':
      // 实现预留卡牌逻辑
      return state;
    case 'CHECK_GAME_END':
      // 判断游戏结束条件
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
