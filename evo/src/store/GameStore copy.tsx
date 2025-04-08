import React, { createContext, useContext, useReducer } from 'react';
import type { Card } from '../models/Card';
import type { Player } from '../models/Player';
import type { Token } from '../models/Token';

interface GameState {
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
  boardLevel1: [],
  boardLevel2: [],
  boardLevel3: [],
  tokensPool: [],
  players: [],
  currentPlayerIndex: 0,
  isGameOver: false,
};

type Action =
  | { type: 'INIT_GAME' }
  | { type: 'NEXT_TURN' }
  | { type: 'PICK_TOKENS'; payload: string[] }
  | { type: 'BUY_CARD'; payload: Card }
  | { type: 'RESERVE_CARD'; payload: Card }
  | { type: 'CHECK_GAME_END_WITH_NEXT_TURN' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT_GAME':
      // 初始化逻辑：加载卡牌、玩家、宝石数据等
      return { ...state, isGameOver: false, currentPlayerIndex: 0 };
    case 'NEXT_TURN':
      return { ...state, currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length };
    case 'PICK_TOKENS':
      // 根据规则更新 tokensPool 及当前玩家的 tokens
      return state;
    case 'BUY_CARD':
      // 检查宝石是否足够、更新玩家卡牌和分数等
      return state;
    case 'RESERVE_CARD':
      // 实现预留卡牌逻辑
      return state;
    case 'CHECK_GAME_END_WITH_NEXT_TURN':
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
