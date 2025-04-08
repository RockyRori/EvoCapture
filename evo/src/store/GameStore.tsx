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

// 定义游戏阶段常量
const Period = {
  ready: 'ready',
  gem: 'gem',
  reserve: 'reserve',
  capture: 'capture',
  evolve: 'evolve',
  skip: 'skip',
};

// 洗牌函数：返回一个新的洗牌数组
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
  captured: boolean;
  period: string;
}

// 初始状态：将所有卡牌放到 deck 里，board 为空
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
  players: [],
  currentPlayerIndex: 0,
  isGameOver: false,
  hasStarted: false,
  captured: false,
  period: Period.ready,
};

type Action =
  | { type: 'JOIN_GAME'; payload: Player }
  | { type: 'INIT_GAME' }
  | { type: 'CHANGE_PERIOD'; payload: string }
  | { type: 'STASH' }
  | { type: 'PICK_TOKENS'; payload: string }
  | { type: 'RETURN_TOKENS'; payload: string }
  | { type: 'CONFIRM_TOKENS' }
  | { type: 'RESERVE_CREATURE'; payload: Card }
  | { type: 'CAPTURE_CREATURE'; payload: Card; place: string }
  | { type: 'EVOLVE' }
  | { type: 'CHECK_GAME_END_ONLY' }
  | { type: 'CHECK_GAME_END_WITH_NEXT_TURN' };

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

// 辅助函数：抽取一张卡并更新对应等级的桌面与牌库
function drawCard(board: Card[], deck: Card[]): { updatedBoard: Card[]; updatedDeck: Card[] } {
  if (deck.length > 0) {
    const drawn = deck.slice(0, 1);
    return { updatedBoard: [...board, ...drawn], updatedDeck: deck.slice(1) };
  }
  return { updatedBoard: board, updatedDeck: deck };
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'JOIN_GAME': {
      // 限制最大玩家数为6，并防止重复加入
      if (state.players.length < 6 && !state.players.find(p => p.id === action.payload.id)) {
        return { ...state, players: [...state.players, action.payload] };
      }
      return state;
    }
    case 'INIT_GAME': {
      const newDeck1 = shuffle([...initialState.deckLevel1]);
      const newDeck2 = shuffle([...initialState.deckLevel2]);
      const newDeck3 = shuffle([...initialState.deckLevel3]);
      const newDeck9 = shuffle([...initialState.deckLevel9]);

      // 根据玩家数量设置公共桌面卡牌数量
      const playerCount = state.players.length;
      let level1 = playerCount <= 3 ? 3 : playerCount <= 4 ? 4 : 5;
      let level2 = level1 > 1 ? level1 - 1 : 1;
      let level3 = level2 > 1 ? level2 - 1 : 1;
      let level9 = 2;

      const newBoard1 = newDeck1.splice(0, level1);
      const newBoard2 = newDeck2.splice(0, level2);
      const newBoard3 = newDeck3.splice(0, level3);
      const newBoard9 = newDeck9.splice(0, level9);

      let count = 2 * playerCount - 1 > 4 ? 2 * playerCount - 1 : 4;
      const updatedTokensPool = state.tokensPool.map(token => ({
        ...token,
        count: count,
      }));

      return {
        ...initialState,
        deckLevel1: newDeck1,
        deckLevel2: newDeck2,
        deckLevel3: newDeck3,
        deckLevel9: newDeck9,
        boardLevel1: newBoard1,
        boardLevel2: newBoard2,
        boardLevel3: newBoard3,
        boardLevel9: newBoard9,
        tokensPool: updatedTokensPool,
        tokensSelected: [],
        players: state.players,
        isGameOver: false,
        hasStarted: true,
        period: Period.ready,
      };
    }
    case 'CHANGE_PERIOD':
      return { ...state, period: action.payload };
    case 'STASH': {
      const updatedPool = state.tokensPool.map(poolToken => {
        const selected = state.tokensSelected.find(token => token.type === poolToken.type);
        return selected ? { ...poolToken, count: poolToken.count + selected.count } : poolToken;
      });
      return { ...state, tokensPool: updatedPool, tokensSelected: [] };
    }
    case 'PICK_TOKENS': {
      const newTokensSelected = [...state.tokensSelected];
      const newTokensPool = state.tokensPool.map(token => {
        if (
          action.payload === token.type &&
          token.count > 0 &&
          token.type !== 'special' &&
          (
            newTokensSelected.length === 0 ||
            (newTokensSelected.length === 1 && newTokensSelected.reduce((s, t) => s + t.count, 0) === 1) ||
            (newTokensSelected.length === 2 &&
              newTokensSelected.reduce((s, t) => s + t.count, 0) === 2 &&
              newTokensSelected.findIndex(t => t.type === token.type) < 0)
          )
        ) {
          const idx = newTokensSelected.findIndex(t => t.type === token.type);
          if (idx >= 0) {
            newTokensSelected[idx] = { ...newTokensSelected[idx], count: newTokensSelected[idx].count + 1 };
          } else {
            newTokensSelected.push({ ...token, count: 1 });
          }
          return { ...token, count: token.count - 1 };
        }
        return token;
      });
      return { ...state, tokensPool: newTokensPool, tokensSelected: newTokensSelected };
    }
    case 'RETURN_TOKENS': {
      const tokenType = action.payload;
      const updatedTokensSelected = state.tokensSelected
        .map(token => (token.type === tokenType ? { ...token, count: token.count - 1 } : token))
        .filter(token => token.count > 0);
      const updatedTokensPool = state.tokensPool.map(token =>
        token.type === tokenType ? { ...token, count: token.count + 1 } : token
      );
      return { ...state, tokensPool: updatedTokensPool, tokensSelected: updatedTokensSelected };
    }
    case 'CONFIRM_TOKENS': {
      const newPlayers = state.players.map((player, idx) => {
        if (idx === state.currentPlayerIndex) {
          const newPlayerTokens = { ...player.tokens };
          state.tokensSelected.forEach(token => {
            newPlayerTokens[token.type] = (newPlayerTokens[token.type] || 0) + token.count;
          });
          return { ...player, tokens: newPlayerTokens };
        }
        return player;
      });
      return { ...state, tokensSelected: [], players: newPlayers, period: Period.ready };
    }
    case 'CAPTURE_CREATURE': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (action.place !== 'public' && action.place !== currentPlayer.name) return state;
      if (!canAfford(currentPlayer.tokens, action.payload.cost)) return state;

      const newPlayerTokens = subtractCost(currentPlayer.tokens, action.payload.cost);
      const updatedPool = state.tokensPool.map(token => {
        if (action.payload.cost[token.type]) {
          return { ...token, count: token.count + action.payload.cost[token.type] };
        }
        return token;
      });

      const newPlayers = state.players.map((player, idx) => {
        if (idx === state.currentPlayerIndex) {
          return {
            ...player,
            tokens: newPlayerTokens,
            capturedcards: [...player.capturedcards, action.payload],
            points: player.points + action.payload.points,
          };
        }
        return player;
      });

      let newState = { ...state, players: newPlayers, tokensPool: updatedPool };
      if (action.place === 'public') {
        let newBoard: Card[] = [];
        let newDeck: Card[] = [];
        switch (action.payload.level) {
          case 1:
            newBoard = state.boardLevel1.filter(c => c.id !== action.payload.id);
            ({ updatedBoard: newBoard, updatedDeck: newDeck } = drawCard(newBoard, [...state.deckLevel1]));
            newState = { ...newState, deckLevel1: newDeck, boardLevel1: newBoard };
            break;
          case 2:
            newBoard = state.boardLevel2.filter(c => c.id !== action.payload.id);
            ({ updatedBoard: newBoard, updatedDeck: newDeck } = drawCard(newBoard, [...state.deckLevel2]));
            newState = { ...newState, deckLevel2: newDeck, boardLevel2: newBoard };
            break;
          case 3:
            newBoard = state.boardLevel3.filter(c => c.id !== action.payload.id);
            ({ updatedBoard: newBoard, updatedDeck: newDeck } = drawCard(newBoard, [...state.deckLevel3]));
            newState = { ...newState, deckLevel3: newDeck, boardLevel3: newBoard };
            break;
          case 9:
            newBoard = state.boardLevel9.filter(c => c.id !== action.payload.id);
            ({ updatedBoard: newBoard, updatedDeck: newDeck } = drawCard(newBoard, [...state.deckLevel9]));
            newState = { ...newState, deckLevel9: newDeck, boardLevel9: newBoard };
            break;
          default:
            break;
        }
      } else if (action.place === newPlayers[state.currentPlayerIndex].name) {
        const newReserved = newPlayers[state.currentPlayerIndex].reservedCards.filter(card => card.id !== action.payload.id);
        newPlayers[state.currentPlayerIndex] = { ...newPlayers[state.currentPlayerIndex], reservedCards: newReserved };
        newState = { ...newState, players: newPlayers };
      }
      return {
        ...newState,
        period: Period.ready,
        captured: true,
      };
    }
    case 'RESERVE_CREATURE': {
      const currentPlayerTokens = { ...state.players[state.currentPlayerIndex].tokens };
      const updatedTokensPool = state.tokensPool.map(token => {
        if (token.type === 'special' && token.count > 0) {
          currentPlayerTokens['special'] += 1;
          return { ...token, count: token.count - 1 };
        }
        return token;
      });

      const newPlayers = state.players.map((player, idx) => {
        if (idx === state.currentPlayerIndex) {
          return {
            ...player,
            reservedCards: [...player.reservedCards, action.payload],
            tokens: currentPlayerTokens,
          };
        }
        return player;
      });

      let newBoard: Card[] = [];
      let newDeck: Card[] = [];
      switch (action.payload.level) {
        case 1:
          newBoard = state.boardLevel1.filter(c => c.id !== action.payload.id);
          ({ updatedBoard: newBoard, updatedDeck: newDeck } = drawCard(newBoard, [...state.deckLevel1]));
          return {
            ...state,
            tokensPool: updatedTokensPool,
            players: newPlayers,
            deckLevel1: newDeck,
            boardLevel1: newBoard,
            period: Period.ready,
            currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
          };
        case 2:
          newBoard = state.boardLevel2.filter(c => c.id !== action.payload.id);
          ({ updatedBoard: newBoard, updatedDeck: newDeck } = drawCard(newBoard, [...state.deckLevel2]));
          return {
            ...state,
            tokensPool: updatedTokensPool,
            players: newPlayers,
            deckLevel2: newDeck,
            boardLevel2: newBoard,
            period: Period.ready,
            currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
          };
        case 3:
          newBoard = state.boardLevel3.filter(c => c.id !== action.payload.id);
          ({ updatedBoard: newBoard, updatedDeck: newDeck } = drawCard(newBoard, [...state.deckLevel3]));
          return {
            ...state,
            tokensPool: updatedTokensPool,
            players: newPlayers,
            deckLevel3: newDeck,
            boardLevel3: newBoard,
            period: Period.ready,
            currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
          };
        case 9:
          newBoard = state.boardLevel9.filter(c => c.id !== action.payload.id);
          ({ updatedBoard: newBoard, updatedDeck: newDeck } = drawCard(newBoard, [...state.deckLevel9]));
          return {
            ...state,
            tokensPool: updatedTokensPool,
            players: newPlayers,
            deckLevel9: newDeck,
            boardLevel9: newBoard,
            period: Period.ready,
            currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
          };
        default:
          return state;
      }
    }
    case 'EVOLVE': {
      // EVOLVE 功能：遍历当前玩家的 capturedcards，
      // 若 capturedcard 的 level 为 1，则查看 boardLevel2；
      // 若为 2，则查看 boardLevel3；
      // 若为 3或者9，则不进行进化。
      let newState = state;
      let evolved = false;
      do {
        evolved = false;
        const currentPlayer = newState.players[newState.currentPlayerIndex];
        // 遍历 capturedcards（复制一份以便修改时不会影响循环）
        for (let i = 0; i < currentPlayer.capturedcards.length; i++) {
          const captured = currentPlayer.capturedcards[i];
          let boardArrayName: keyof GameState | null = null;
          let deckName: keyof GameState | null = null;
          // 根据 captured 卡牌的 level 判断可进化目标
          if (captured.level === 1) {
            boardArrayName = 'boardLevel2';
            deckName = 'deckLevel2';
          } else if (captured.level === 2) {
            boardArrayName = 'boardLevel3';
            deckName = 'deckLevel3';
          } else if (captured.level === 3) {
            // level 3 的卡牌不再进化
            continue;
          } else if (captured.level === 9) {
            // level 9 的卡牌不再进化
            continue;
          }
          if (!boardArrayName || !deckName) continue; // 无法进化
          const boardArray = newState[boardArrayName] as Card[];
          // 查找公共区中是否存在与 captured 卡牌相同 id 的卡牌（代表进化版）
          const cardIndex = boardArray.findIndex(card => card.id % 100 === captured.id % 100);
          if (cardIndex !== -1) {
            evolved = true;
            // 找到进化卡牌，从公共区中移除该卡牌
            const evolveCard = boardArray[cardIndex];
            const updatedBoard = boardArray.filter((_, idx) => idx !== cardIndex);
            newState = { ...newState, [boardArrayName]: updatedBoard };

            // 更新当前玩家：移除原 captured 卡牌，并将进化后的卡牌加入 capturedcards
            const newCaptured = currentPlayer.capturedcards.slice();
            newCaptured.splice(i, 1); // 移除原卡
            newCaptured.push(evolveCard); // 加入进化卡牌
            const newPlayers = newState.players.map((player, idx) => {
              if (idx === newState.currentPlayerIndex) {
                return { ...player, capturedcards: newCaptured };
              }
              return player;
            });
            newState = { ...newState, players: newPlayers };

            // 补充公共区：从对应牌库抽取一张卡补充到公共区
            const deckArray = newState[deckName] as Card[];
            const { updatedBoard: replenishedBoard, updatedDeck } = drawCard(updatedBoard, deckArray);
            newState = { ...newState, [boardArrayName]: replenishedBoard, [deckName]: updatedDeck };

            // 进化成功后退出当前 for 循环，重新遍历 capturedcards
            break;
          }
        }
      } while (evolved);
      return newState;
    }
    case 'CHECK_GAME_END_ONLY': {
      const gameOver = state.players.some(player => player.points >= 3 * (state.players.length));
      if (gameOver) {
        return { ...state, isGameOver: true };
      } else return state
    }
    case 'CHECK_GAME_END_WITH_NEXT_TURN': {
      const gameOver = state.players.some(player => player.points >= 3 * (state.players.length));
      if (gameOver) {
        return { ...state, isGameOver: true };
      } else return { ...state, captured: false, period: 'ready', currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length };
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
