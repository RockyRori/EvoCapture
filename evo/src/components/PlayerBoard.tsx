import React, { memo } from 'react';
import type { Player } from '../models/Player';
import './PlayerBoard.css';

// 定义宝石类型到颜色的映射表
const gemColors: Record<string, string> = {
    metal: '#C0C0C0',
    wood: '#4CAF50',
    water: '#1E90FF',
    fire: '#FF7F7F',
    earth: '#FFD700',
    special: '#7E0478'
};

interface PlayerBoardProps {
    player: Player;
}

// 将单个宝石渲染为一个独立组件
interface OwnedGemProps {
    gemType: string;
    value: number;
}

const OwnedGem: React.FC<OwnedGemProps> = ({ gemType, value }) => {
    const backgroundColor = gemColors[gemType] || '#ccc';
    return (
        <div className="owned-gem" style={{ backgroundColor }}>
            {value}
        </div>
    );
};

const PlayerBoard: React.FC<PlayerBoardProps> = ({ player }) => {
    return (
        <div className="player-board">
            {/* 保留的卡牌展示区域 */}
            <div className="cards-reserved">
                reserved:
                {player.reservedCards.length > 0 ? (
                    player.reservedCards.map((card) => (
                        <span className="cards-reserved-name" key={card.id}>
                            {card.name}
                        </span>
                    ))
                ) : (
                    <span className="cards-reserved-name">None</span>
                )}
            </div>

            {/* 玩家头部（名称、分数、头像） */}
            <div className="player-header">
                <div className="player-name">
                    {player.name}: {player.points}
                    <img
                        src={player.avatar}
                        alt="player-avatar"
                        className="player-image"
                    />
                </div>
            </div>

            {/* 玩家持有的 tokens */}
            <div className="tokens">
                {Object.entries(player.tokens).map(([gemType, count]) => (
                    <OwnedGem key={gemType} gemType={gemType} value={Number(count)} />
                ))}
            </div>

            {/* 玩家拥有的卡牌展示 */}
            <div className="cards-owned">
                {player.capturedcards.map((card) => (
                    <div key={card.id} className="owned-card">
                        <img src={card.imageUrl} alt={card.rewardGemType} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default memo(PlayerBoard);
