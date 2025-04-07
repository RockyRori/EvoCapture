// src/components/Board.tsx
import React from 'react';
import { useGameStore } from '../store/GameStore';
import CardComponent from './Card';
import TokenComponent from './Token';
import './Board.css';

const Board: React.FC = () => {
    const { state, dispatch } = useGameStore();

    const onPickToken = (tokenType: string) => {
        dispatch({ type: 'PICK_TOKENS', payload: [tokenType] });
    };

    return (
        <div className="board">
            <div className="card-row board-level9">
                {state.boardLevel9.map((card) => (
                    <CardComponent key={card.id} card={card} />
                ))}
            </div>

            <div className="card-row">
                {state.boardLevel3.map((card) => (
                    <CardComponent key={card.id} card={card} />
                ))}
            </div>
            <div className="card-row">
                {state.boardLevel2.map((card) => (
                    <CardComponent key={card.id} card={card} />
                ))}
            </div>
            <div className="card-row">
                {state.boardLevel1.map((card) => (
                    <CardComponent key={card.id} card={card} />
                ))}
            </div>

            <div className="tokens-pool">
                {state.tokensPool.map((token) => (
                    <TokenComponent key={token.type} token={token} onPick={onPickToken} />
                ))}
            </div>
        </div>
    );
};

export default Board;
