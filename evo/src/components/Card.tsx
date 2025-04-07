import React from 'react';
import type { Card } from '../models/Card';
import { useGameStore } from '../store/GameStore';
import './Card.css';

interface CardProps {
    card: Card;
}

const CardComponent: React.FC<CardProps> = ({ card }) => {
    const { dispatch } = useGameStore();

    const onBuyCard = () => {
        dispatch({ type: 'BUY_CARD', payload: card });
    };

    return (
        <div className={`card level-${card.level}`} onClick={onBuyCard}>
            <img src={card.imageUrl} alt="card" className="card-image" />
            <div className="card-info">
                <p>点数: {card.points}</p>
                <p>永久宝石: {card.rewardGemType}</p>
                <div className="cost">
                    {Object.entries(card.cost).map(([gemType, value]) => (
                        <span key={gemType}>
                            {gemType}: {value}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CardComponent;
