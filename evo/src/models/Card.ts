export interface Card {
    id: number;
    level: number;        // 卡牌等级：1, 2, 3 等
    cost: { [gemType: string]: number };  // 消耗宝石数量，例如 { red: 2, blue: 1 }
    rewardGemType: string;  // 购买后获得的永久宝石类型（颜色）
    rewardGemCount: number; // 永久宝石数量，取值 0~3
    points: number;         // 获得的胜利点数
    imageUrl: string;       // 卡牌图片地址
}
