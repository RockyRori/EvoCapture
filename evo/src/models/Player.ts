import type { Card } from './Card';
import type { Token } from './Token';
export interface Player {
    id: number;
    name: string;
    avatar: string;
    tokens: Token[];  // 玩家持有的临时宝石
    cards: Card[];                          // 已购买的卡牌
    reservedCards: Card[];                  // 预留卡牌（如果有此规则）
    points: number;                         // 玩家当前得分
}
