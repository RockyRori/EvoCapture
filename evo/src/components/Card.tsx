// src/components/Card.tsx
import React, { useCallback, useRef, useEffect } from 'react';
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
    place: string;
}

// 提取卡牌头部显示组件
interface CardHeaderProps {
    points: number;
    rewardGemType: string;
    rewardGemCount: number;
}

const CardHeader: React.FC<CardHeaderProps> = ({ points, rewardGemType, rewardGemCount }) => {
    const backgroundColor = gemColors[rewardGemType] ?? '#000000';
    return (
        <div className="card-header">
            <div className="card-points">{points}</div>
            <div className="card-rewards">
                {Array.from({ length: rewardGemCount }).map((_, i) => (
                    <div key={i} className="card-reward" style={{ backgroundColor }} />
                ))}
            </div>
        </div>
    );
};

const CardComponent: React.FC<CardProps> = ({ card, place }) => {
    const { state, dispatch } = useGameStore();
    const currentPlayer = state.players[state.currentPlayerIndex];

    // 使用 ref 存储最新 capturedcards（或 captured，依据你实际的字段名称）
    const capturedRef = useRef(state.captured);
    useEffect(() => {
        capturedRef.current = state.captured;
    }, [state.captured]);

    const onSelect = useCallback(() => {
        if (state.period === 'capture') {
            if (place === 'public' || place === currentPlayer.name) {
                dispatch({ type: 'CAPTURE_CREATURE', payload: card, place });
            }
        } else if (state.period === 'reserve') {
            if (place === 'public' && currentPlayer.reservedCards.length <= 0) {
                dispatch({ type: 'RESERVE_CREATURE', payload: card });
            }
        }
    }, [state.period, place, currentPlayer, card, dispatch]);

    // useEffect 监听变化
    useEffect(() => {
        // 这里假设 capturedcards 是存放在 currentPlayer 里的字段
        if (state.captured) {
            state.captured = false;
            dispatch({ type: 'CHECK_GAME_END_WITH_NEXT_TURN' });
        }
        // 注意这里的依赖以确保 useEffect 在 capturedcards 改变时触发
    }, [currentPlayer.capturedcards, dispatch]);

    // 辅助函数渲染卡牌成本
    const renderCost = () => (
        <div className="card-cost">
            {Object.entries(card.cost).map(([gemType, value]) => {
                const costColor = gemColors[gemType] ?? '#ccc';
                return (
                    <div key={gemType} className="cost-gem" style={{ backgroundColor: costColor }}>
                        {value}
                    </div>
                );
            })}
        </div>
    );

    // 根据 rewardGemType 决定卡牌背景颜色
    const rewardColor = gemColors[card.rewardGemType] ?? '#000000';

    return (
        <div className="card" onClick={onSelect} style={{ backgroundColor: rewardColor }}>
            <div className="card-content">
                {/* 使用抽取出来的 CardHeader 组件 */}
                <CardHeader
                    points={card.points}
                    rewardGemType={card.rewardGemType}
                    rewardGemCount={card.rewardGemCount}
                />
                {/* 卡牌图片 */}
                <div>{card.id % 100}:{card.name}</div>
                <img src={card.imageUrl} alt="Creature" className="card-image" />
                {/* 显示购买成本 */}
                {renderCost()}
            </div>
        </div>
    );
};

export default CardComponent;
