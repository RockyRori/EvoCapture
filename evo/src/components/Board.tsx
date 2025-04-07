// src/components/Board.tsx
import React from 'react';
import { useGameStore } from '../store/GameStore';
import CardComponent from './Card';
import TokenComponent from './Token';
import './Board.css';

const Board: React.FC = () => {
    const { state, dispatch } = useGameStore();

    const onPickToken = (tokenType: string) => {
        if (state.period === 'gem') { dispatch({ type: 'PICK_TOKENS', payload: tokenType }); }
    };
    const onReturnToken = (tokenType: string) => {
        if (state.period === 'gem') { dispatch({ type: 'RETURN_TOKENS', payload: tokenType }); }
    };
    const onConfirmToken = () => {
        dispatch({ type: 'CONFIRM_TOKENS' });
        dispatch({ type: 'NEXT_TURN' });
        dispatch({ type: 'CHECK_GAME_END' });
    }

    return (
        <div className="board">
            <div className="card-row board-level9">
                {state.boardLevel9.map((card) => (
                    <CardComponent key={card.id} card={card} place='public' />
                ))}
            </div>

            <div className="card-row">
                {state.boardLevel3.map((card) => (
                    <CardComponent key={card.id} card={card} place='public' />
                ))}
            </div>
            <div className="card-row">
                {state.boardLevel2.map((card) => (
                    <CardComponent key={card.id} card={card} place='public' />
                ))}
            </div>
            <div className="card-row">
                {state.boardLevel1.map((card) => (
                    <CardComponent key={card.id} card={card} place='public' />
                ))}
            </div>

            <div className="tokens-pool">
                {state.tokensPool.map((token) => (
                    <TokenComponent key={token.type} token={token} handlePick={onPickToken} />
                ))}
            </div>
            {state.tokensSelected.length > 0 ?
                <div className="tokens-pool">
                    {state.tokensSelected.map((token) => (
                        <TokenComponent key={token.type} token={token} handlePick={onReturnToken} />
                    ))}
                    <button onClick={onConfirmToken}>Accept</button>
                </div>
                : <div style={{ minHeight: 28 }}></div>}
        </div >
    );
};

export default Board;
