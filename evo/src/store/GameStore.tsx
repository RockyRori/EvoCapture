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
  winTarget: number;
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
  winTarget: 0,
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

// 洗牌函数：返回一个新的洗牌数组
function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function distributeTokens(players: Player[]): Player[] {
  const gemTypes = ['metal', 'wood', 'water', 'fire', 'earth', 'special'];
  // 额外奖励宝石的种类，排除 special
  const rewardGemTypes = gemTypes.filter(gem => gem !== 'special');

  return players.map((player, index) => {
    // 初始化所有宝石，每种宝石都获得1个
    const tokens: { [gemType: string]: number } = {};
    gemTypes.forEach(gem => {
      tokens[gem] = 1;
    });

    // 确定额外奖励宝石数量（第一个玩家无额外奖励）
    const extraCount = index;
    // 为额外奖励宝石随机分配种类（不能选择 special）
    for (let i = 0; i < extraCount; i++) {
      const randomIndex = Math.floor(Math.random() * rewardGemTypes.length);
      const randomGem = rewardGemTypes[randomIndex];
      tokens[randomGem] += 1;
    }

    return {
      ...player,
      tokens: tokens,
    };
  });
}

// 辅助函数：检查当前玩家是否能支付 cost
function canAfford(
  tokens: { [gem: string]: number },
  gems: { [gem: string]: number },
  cost: { [gem: string]: number }
): boolean {
  for (let gem in cost) {
    const available = (tokens[gem] || 0) + (gems[gem] || 0);
    if (available < cost[gem]) return false;
  }
  return true;
}

interface SubtractCostResult {
  newTokens: { [gem: string]: number };
  tokenPayment: { [gem: string]: number };
}

// 辅助函数：从 tokens 中减去 gems 不足以支付的 cost 部分，并返回 tokenPayment 记录
function subtractCost(
  tokens: { [gem: string]: number },
  gems: { [gem: string]: number },
  cost: { [gem: string]: number }
): SubtractCostResult {
  const newTokens = { ...tokens };
  const tokenPayment: { [gem: string]: number } = {};

  // 遍历 cost 中的每种宝石
  for (let gem in cost) {
    const permanentGemCount = gems[gem] || 0;       // 永久宝石数量（默认为0）
    const requiredCost = cost[gem];                  // 本次所需数量
    // 计算需要额外用 token 补齐的数量
    const payment = requiredCost > permanentGemCount ? requiredCost - permanentGemCount : 0;
    tokenPayment[gem] = payment;
    // 从 tokens 中扣除补齐数量
    newTokens[gem] = (tokens[gem] || 0) - payment;
  }

  return { newTokens, tokenPayment };
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

      // 游戏开始时，根据玩家加入顺序动态分配宝石
      const updatedPlayers = distributeTokens(state.players);
      // 设计胜利目标
      let target = 3 * (state.players.length) + 4

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
        players: updatedPlayers,
        isGameOver: false,
        hasStarted: true,
        period: Period.ready,
        winTarget: target,
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
          newTokensSelected.reduce((s: number, t: Token) => s + t.count, 0) + Object.values(state.players[state.currentPlayerIndex].tokens)
            .reduce((sum, count) => sum + count, 0) < 11 &&
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
      // 买得起吗
      if (!canAfford(currentPlayer.tokens, currentPlayer.gems, action.payload.cost)) return state;
      // 买得起，扣除
      const { newTokens: newPlayerTokens, tokenPayment: tokenPayment } = subtractCost(currentPlayer.tokens, currentPlayer.gems, action.payload.cost);
      // 使用 tokenPayment 更新 token 池
      const updatedPool = state.tokensPool.map(token => {
        if (tokenPayment[token.type]) {
          return { ...token, count: token.count + tokenPayment[token.type] };
        }
        return token;
      });
      // 增加永久宝石
      const newPlayerGems = {
        ...currentPlayer.gems,
        [action.payload.rewardGemType]: (currentPlayer.gems[action.payload.rewardGemType] || 0) + action.payload.rewardGemCount,
      };

      const newPlayers = state.players.map((player, idx) => {
        if (idx === state.currentPlayerIndex) {
          return {
            ...player,
            tokens: newPlayerTokens,
            gems: newPlayerGems,
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

            // 更新当前玩家的 capturedcards：
            // 先复制 capturedcards 数组，然后移除原卡，再加入进化卡牌
            const newCaptured = currentPlayer.capturedcards.slice();
            newCaptured.splice(i, 1); // 移除原卡

            // 更新永久宝石:
            // 移除原卡的增益，并加入进化卡牌的增益
            const newPlayerGems = {
              ...currentPlayer.gems,
              [captured.rewardGemType]: (currentPlayer.gems[captured.rewardGemType] || 0) - captured.rewardGemCount,
              [evolveCard.rewardGemType]: (currentPlayer.gems[evolveCard.rewardGemType] || 0) + evolveCard.rewardGemCount,
            };

            // 将进化卡牌加入 capturedcards
            newCaptured.push(evolveCard);

            // 更新当前玩家的信息：capturedcards 和 gems
            const newPlayers = newState.players.map((player, idx) => {
              if (idx === newState.currentPlayerIndex) {
                return { ...player, capturedcards: newCaptured, gems: newPlayerGems, points: player.points - captured.points + evolveCard.points };
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
      const gameOver = state.players.some(player => player.points >= state.winTarget);
      if (gameOver) {
        return { ...state, isGameOver: true };
      } else return state
    }
    case 'CHECK_GAME_END_WITH_NEXT_TURN': {
      const gameOver = state.players.some(player => player.points >= state.winTarget);
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
