// src/components/Card.tsx
import React from 'react';
import { useGameStore } from '../store/GameStore';
import type { Card as CardModel } from '../models/Card';
import './Card.css';

// 定义宝石类型到颜色的映射表
const gemColors: Record<string, string> = {
    metal: '#C0C0C0',
    wood: '#4CAF50',
    water: '#1E90FF',
    fire: '#FF7F7F',
    earth: '#FFD700',
    special: '#7E0478'
};

interface CardProps {
    card: CardModel;
}

const CardComponent: React.FC<CardProps> = ({ card }) => {
    const { state, dispatch } = useGameStore();

    // 点击卡牌时执行选择逻辑
    const onSelect = () => {
        if (state.period === 'capture') { dispatch({ type: 'CAPTURE_CREATURE', payload: card }); }
        if (state.period === 'reserve') { dispatch({ type: 'RESERVE_CREATURE', payload: card }); }
        dispatch({ type: 'CHECK_GAME_END' });
    };
    // const onCapture = () => {
    //     if (state.period === 'capture') { dispatch({ type: 'CAPTURE_CREATURE', payload: card }); }
    //     dispatch({ type: 'CHECK_GAME_END' });
    // };
    // const onReserve = () => {
    //     if (state.period === 'reserve') { dispatch({ type: 'RESERVE_CREATURE', payload: card }); }
    //     dispatch({ type: 'CHECK_GAME_END' });
    // };

    // 2. 根据 rewardGemType 决定卡牌背景和左上角点数圆圈颜色
    const rewardColor = gemColors[card.rewardGemType] ?? '#000000';

    return (
        <div
            className="card"
            onClick={onSelect}
            style={{ backgroundColor: rewardColor }}
        >   <div className="card-content">
                {/* 卡牌头部：左上角点数 & 右上角永久宝石 */}
                <div className="card-header">
                    {/* 左上角点数方块 */}
                    <div className="card-points">
                        {card.points}
                    </div>
                    {/* 右上角永久宝石圆球 */}
                    {/* 右上角永久宝石：根据 rewardGemCount 显示对应数量的实心圆 */}
                    <div className="card-rewards">
                        {Array.from({ length: card.rewardGemCount }).map((_, i) => (
                            <div
                                key={i}
                                className="card-reward"
                                style={{ backgroundColor: rewardColor }}
                            />
                        ))}
                    </div>
                </div>

                {/* 卡牌图片 */}
                <img src={card.imageUrl} alt="Creature" className="card-image" />

                {/* 购买需求宝石 */}
                <div className="card-cost">
                    {Object.entries(card.cost).map(([gemType, value]) => {
                        // 根据 gemType 决定消耗宝石的圆圈颜色
                        const costColor = gemColors[gemType] ?? '#ccc';
                        return (
                            <div
                                key={gemType}
                                className="cost-gem"
                                style={{ backgroundColor: costColor }}
                            >
                                {value}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CardComponent;
