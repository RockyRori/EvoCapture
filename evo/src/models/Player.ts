import type { Card } from './Card';
export interface Player {
    id: number;
    name: string;
    avatar: string;
    gems: { [gemType: string]: number };    // 玩家持有的永久宝石
    tokens: { [gemType: string]: number };  // 玩家持有的临时宝石
    cards: Card[];                          // 已购买的卡牌
    reservedCards: Card[];                  // 预留卡牌（如果有此规则）
    points: number;                         // 玩家当前得分
}
