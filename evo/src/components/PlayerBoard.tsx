import React from 'react';
import type { Player } from '../models/Player';
import { useGameStore } from '../store/GameStore';
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

const PlayerBoard: React.FC<PlayerBoardProps> = ({ player }) => {
    // @ts-ignore TS6133
    const { state, dispatch } = useGameStore();
    // @ts-ignore TS6133
    const onPickToken = (tokenType: string) => {
        dispatch({ type: 'PICK_TOKENS', payload: [tokenType] });
    };
    return (
        <div className="player-board">
            <div className="player-header">
                <div className="player-name">{player.name}: {player.points}<img src={player.avatar} alt="player-avatar" className="player-image" /></div>
            </div>
            <div className="tokens">
                {Object.entries(player.tokens).map(([gemType, value]) => {
                    // 根据 gemType 决定消耗宝石的圆圈颜色
                    const costColor = gemColors[gemType] ?? '#ccc';
                    return (
                        <div
                            key={gemType}
                            className="owned-gem"
                            style={{ backgroundColor: costColor }}
                        >
                            {value}
                        </div>
                    );
                })}
            </div>
            <div className="cards-owned">
                {player.cards.map((card) => (
                    <div key={card.id} className="owned-card">
                        <img src={card.imageUrl} alt={card.rewardGemType} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerBoard;
