// 新建一个 CardRow.tsx
import React from 'react';
import CardComponent from './Card';
import type { Card } from '../models/Card';

interface CardRowProps {
    className?: string;
    cards: Card[];
    place?: string;
}

const CardRow: React.FC<CardRowProps> = ({ className = '', cards, place = 'public' }) => {
    return (
        <div className={`card-row ${className}`}>
            {cards.map((card) => (
                <CardComponent key={card.id} card={card} place={place} />
            ))}
        </div>
    );
};

export default CardRow;
