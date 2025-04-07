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

const TokensSelected: Token[] = [];

const Period = {
  ready: 'ready',
  gem: 'gem',
  reserve: 'reserve',
  capture: 'capture',
  skip: 'skip',
};

// 示例玩家数据
const Players: Player[] = [
  {
    id: 1,
    name: 'John',
    avatar: '/EvoCapture/avatar/John.png',
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
    avatar: '/EvoCapture/avatar/Emma.png',
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
    avatar: '/EvoCapture/avatar/Mike.png',
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
    avatar: '/EvoCapture/avatar/Lucy.png',
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
    avatar: '/EvoCapture/avatar/David.png',
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
    avatar: '/EvoCapture/avatar/Anna.png',
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
  tokensSelected: Token[];
  players: Player[];
  currentPlayerIndex: number;
  isGameOver: boolean;
  hasStarted: boolean;
  period: string;
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
  tokensSelected: TokensSelected,
  players: Players,
  currentPlayerIndex: 0,
  isGameOver: false,
  hasStarted: false,
  period: Period.ready,
};

type Action =
  | { type: 'INIT_GAME' }
  | { type: 'CHANGE_PERIOD'; payload: string }
  | { type: 'STASH' }
  | { type: 'NEXT_TURN' }
  | { type: 'PICK_TOKENS'; payload: string }
  | { type: 'RETURN_TOKENS'; payload: string }
  | { type: 'CONFIRM_TOKENS' }
  | { type: 'CAPTURE_CREATURE'; payload: Card }
  | { type: 'RESERVE_CREATURE'; payload: Card }
  | { type: 'CHECK_GAME_END' };

// 辅助函数：检查当前玩家是否能支付 cost
function canAfford(tokens: { [gem: string]: number }, cost: { [gem: string]: number }): boolean {
  for (let gem in cost) {
    if ((tokens[gem] || 0) < cost[gem]) return false;
  }
  return true;
}


// 辅助函数：从 tokens 中减去 cost
function subtractCost(tokens: { [gem: string]: number }, cost: { [gem: string]: number }): { [gem: string]: number } {
  const newTokens = { ...tokens };
  for (let gem in cost) {
    newTokens[gem] = (newTokens[gem] || 0) - cost[gem];
  }
  return newTokens;
}

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
        tokensSelected: [],
        // 更新代币
        isGameOver: false,
        hasStarted: true,
        period: Period.ready,
      };
    }
    case 'CHANGE_PERIOD': {
      return { ...state, period: action.payload };
    }
    case 'STASH': {
      // 更新 tokensPool，将 tokensSelected 中每种宝石数量加回到总的 tokensPool 中
      const newTokensPool = state.tokensPool.map(poolToken => {
        // 在 tokensSelected 中查找相同类型的宝石
        const selectedToken = state.tokensSelected.find(token => token.type === poolToken.type);
        if (selectedToken) {
          return {
            ...poolToken,
            count: poolToken.count + selectedToken.count,
          };
        }
        return poolToken;
      });

      return {
        ...state,
        tokensPool: newTokensPool,
        tokensSelected: [],
      };
    }
    case 'NEXT_TURN': {
      // 切换到下一位玩家
      return {
        ...state,
        currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
      };
    }
    case 'PICK_TOKENS': {
      // payload: array of token types选取
      const newTokensSelected = [...state.tokensSelected];
      const newTokensPool = state.tokensPool.map((token) => {
        const typeCount = newTokensSelected.length;
        const totalCount = newTokensSelected.reduce((sum, token) => sum + token.count, 0);
        // 只能选择非紫色的普通五行胶囊不同的3个或者相同的两个
        if (action.payload === token.type && token.count > 0 && token.type != 'special' && (typeCount == 0 || typeCount == 1 && totalCount == 1 || typeCount == 2 && totalCount == 2 && newTokensSelected.findIndex(t => t.type === token.type) < 0)) {
          const index = newTokensSelected.findIndex(t => t.type === token.type);
          if (index >= 0) {
            // 如果已经存在，则创建新的对象，增加 count
            newTokensSelected[index] = {
              ...newTokensSelected[index],
              count: newTokensSelected[index].count + 1,
            };
          } else {
            // 如果不存在，则添加新的 token，初始 count 为 1
            newTokensSelected.push({ ...token, count: 1 });
          }
          return { ...token, count: token.count - 1 };
        }
        return token;
      });
      return { ...state, tokensPool: newTokensPool, tokensSelected: newTokensSelected };
    }
    case 'RETURN_TOKENS': {
      // 假设 action.payload 是要返回的代币类型（例如 "ruby"）
      const tokenTypeToReturn = action.payload;

      // 更新 tokensSelected：找到对应的代币，数量减1，若减到0则过滤掉该代币
      const newTokensSelected = state.tokensSelected
        .map(token => {
          if (token.type === tokenTypeToReturn) {
            return { ...token, count: token.count - 1 };
          }
          return token;
        })
        .filter(token => token.count > 0);

      // 更新 tokensPool：找到对应的代币，数量加1
      const newTokensPool = state.tokensPool.map(token => {
        if (token.type === tokenTypeToReturn) {
          return { ...token, count: token.count + 1 };
        }
        return token;
      });

      return { ...state, tokensPool: newTokensPool, tokensSelected: newTokensSelected };
    }
    case 'CONFIRM_TOKENS': {
      const newPlayers = state.players.map((player, idx) => {
        if (idx === state.currentPlayerIndex) {
          // 复制当前玩家的 tokens 对象，避免直接修改 state
          const newPlayerTokens = { ...player.tokens };
          // 遍历 tokensSelected 数组，累加 token 数量
          state.tokensSelected.forEach(token => {
            newPlayerTokens[token.type] = (newPlayerTokens[token.type] || 0) + token.count;
          });
          return { ...player, tokens: newPlayerTokens };
        }
        return player;
      });
      // 清空 tokensSelected 数组
      return { ...state, tokensSelected: [], players: newPlayers, period: Period.ready };
    }
    case 'CAPTURE_CREATURE': {
      // payload: 卡牌对象，假设该卡牌在当前桌面中存在（不考虑预留情况）
      const currentPlayer = state.players[state.currentPlayerIndex];
      // 判断是否有足够代币支付
      if (!canAfford(currentPlayer.tokens, action.payload.cost)) {
        // 如果不能支付，直接返回状态不变（或可提示错误）
        return state;
      }
      // 扣除玩家代币
      const newPlayerTokens = subtractCost(currentPlayer.tokens, action.payload.cost);
      // 添加卡牌到玩家已购卡牌，累加分数
      const newPlayers = state.players.map((player, idx) => {
        if (idx === state.currentPlayerIndex) {
          return {
            ...player,
            tokens: newPlayerTokens,
            cards: [...player.cards, action.payload],
            points: player.points + action.payload.points,
          };
        }
        return player;
      });
      // 从对应等级的桌面中移除卡牌，并尝试补充（这里简单地 filter 移除，补充逻辑可根据需求扩展）
      let newBoard: Card[] = [];
      if (action.payload.level === 1) {
        newBoard = state.boardLevel1.filter((c) => c.id !== action.payload.id);
      } else if (action.payload.level === 2) {
        newBoard = state.boardLevel2.filter((c) => c.id !== action.payload.id);
      } else if (action.payload.level === 3) {
        newBoard = state.boardLevel3.filter((c) => c.id !== action.payload.id);
      } else if (action.payload.level === 9) {
        newBoard = state.boardLevel9.filter((c) => c.id !== action.payload.id);
      }
      // 补充逻辑：从牌库抽一张卡补到桌面（若有剩余）
      let newDeck: Card[] = [];
      let updatedBoard: Card[] = newBoard;
      if (action.payload.level === 1) {
        newDeck = state.deckLevel1;
        if (newDeck.length > 0) {
          const drawn = newDeck.splice(0, 1);
          updatedBoard = [...newBoard, ...drawn];
        }
      } else if (action.payload.level === 2) {
        newDeck = state.deckLevel2;
        if (newDeck.length > 0) {
          const drawn = newDeck.splice(0, 1);
          updatedBoard = [...newBoard, ...drawn];
        }
      } else if (action.payload.level === 3) {
        newDeck = state.deckLevel3;
        if (newDeck.length > 0) {
          const drawn = newDeck.splice(0, 1);
          updatedBoard = [...newBoard, ...drawn];
        }
      } else if (action.payload.level === 9) {
        newDeck = state.deckLevel9;
        if (newDeck.length > 0) {
          const drawn = newDeck.splice(0, 1);
          updatedBoard = [...newBoard, ...drawn];
        }
      }
      // 更新对应等级的 deck 与 board
      let newState = { ...state, players: newPlayers };
      if (action.payload.level === 1) {
        newState = { ...newState, deckLevel1: newDeck, boardLevel1: updatedBoard };
      } else if (action.payload.level === 2) {
        newState = { ...newState, deckLevel2: newDeck, boardLevel2: updatedBoard };
      } else if (action.payload.level === 3) {
        newState = { ...newState, deckLevel3: newDeck, boardLevel3: updatedBoard };
      } else if (action.payload.level === 9) {
        newState = { ...newState, deckLevel9: newDeck, boardLevel9: updatedBoard };
      }
      return { ...newState, period: Period.ready, currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length };
    }

    case 'RESERVE_CREATURE': {
      // payload: 要预留的卡牌，移除该卡牌从桌面，并加入当前玩家的 reservedCards
      // 从对应等级的桌面中移除卡牌，并尝试补充（这里简单地 filter 移除，补充逻辑可根据需求扩展）
      const newUserTokens = { ...state.players[state.currentPlayerIndex].tokens };
      // 给当前玩家增加这张卡到 reservedCards，并尝试给予1个 special 代币（如果代币池有剩余）
      let newTokensPool = state.tokensPool.map((token) => {
        if (token.type === 'special' && token.count > 0) {
          newUserTokens['special'] = newUserTokens['special'] + 1;
          return { ...token, count: token.count - 1 };
        }
        return token;
      });

      const newPlayers = state.players.map((player, idx) => {
        if (idx === state.currentPlayerIndex) {
          return {
            ...player,
            reservedCards: [...player.reservedCards, action.payload],
            tokens: newUserTokens,
          };
        }
        return player;
      });

      let newBoard: Card[] = [];
      if (action.payload.level === 1) {
        newBoard = state.boardLevel1.filter((c) => c.id !== action.payload.id);
      } else if (action.payload.level === 2) {
        newBoard = state.boardLevel2.filter((c) => c.id !== action.payload.id);
      } else if (action.payload.level === 3) {
        newBoard = state.boardLevel3.filter((c) => c.id !== action.payload.id);
      } else if (action.payload.level === 9) {
        newBoard = state.boardLevel9.filter((c) => c.id !== action.payload.id);
      }
      // 补充逻辑：从牌库抽一张卡补到桌面（若有剩余）
      let newDeck: Card[] = [];
      let updatedBoard: Card[] = newBoard;
      if (action.payload.level === 1) {
        newDeck = state.deckLevel1;
        if (newDeck.length > 0) {
          const drawn = newDeck.splice(0, 1);
          updatedBoard = [...newBoard, ...drawn];
        }
      } else if (action.payload.level === 2) {
        newDeck = state.deckLevel2;
        if (newDeck.length > 0) {
          const drawn = newDeck.splice(0, 1);
          updatedBoard = [...newBoard, ...drawn];
        }
      } else if (action.payload.level === 3) {
        newDeck = state.deckLevel3;
        if (newDeck.length > 0) {
          const drawn = newDeck.splice(0, 1);
          updatedBoard = [...newBoard, ...drawn];
        }
      } else if (action.payload.level === 9) {
        newDeck = state.deckLevel9;
        if (newDeck.length > 0) {
          const drawn = newDeck.splice(0, 1);
          updatedBoard = [...newBoard, ...drawn];
        }
      }
      // 更新对应等级的 deck 与 board
      let newState = { ...state, tokensPool: newTokensPool, players: newPlayers };
      if (action.payload.level === 1) {
        newState = { ...newState, deckLevel1: newDeck, boardLevel1: updatedBoard };
      } else if (action.payload.level === 2) {
        newState = { ...newState, deckLevel2: newDeck, boardLevel2: updatedBoard };
      } else if (action.payload.level === 3) {
        newState = { ...newState, deckLevel3: newDeck, boardLevel3: updatedBoard };
      } else if (action.payload.level === 9) {
        newState = { ...newState, deckLevel9: newDeck, boardLevel9: updatedBoard };
      }
      return { ...newState, period: Period.ready, currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length };
    }
    case 'CHECK_GAME_END': {
      // 简单逻辑：当有玩家分数达到或超过16时结束游戏
      const gameOver = state.players.some((player) => player.points >= 16);
      if (gameOver) {
        return { ...state, currentPlayerIndex: (state.currentPlayerIndex - 1) % state.players.length, isGameOver: gameOver };
      }
      return { ...state };
    }
    default:
      return state;
  }
}

// 创建全局游戏状态管理上下文
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
