// src/components/Board.tsx
import React, { useCallback } from 'react';
import { useGameStore } from '../store/GameStore';
import CardRow from './CardRow';
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
    const onConfirmToken = useCallback(() => {
        dispatch({ type: 'CONFIRM_TOKENS' });
        dispatch({ type: 'NEXT_TURN' });
        dispatch({ type: 'CHECK_GAME_END' });
    }, [dispatch]);

    return (
        <div className="board">
            {/* 渲染公共卡牌行 */}
            <CardRow className="board-level9" cards={state.boardLevel9} />
            <CardRow cards={state.boardLevel3} />
            <CardRow cards={state.boardLevel2} />
            <CardRow cards={state.boardLevel1} />

            {/* tokensPool 渲染 */}
            <div className="tokens-pool">
                {state.tokensPool.map((token) => (
                    <TokenComponent key={token.type} token={token} handlePick={onPickToken} />
                ))}
            </div>

            {/* 已选 token 渲染 */}
            {state.tokensSelected.length > 0 ? (
                <div className="tokens-pool">
                    {state.tokensSelected.map((token) => (
                        <TokenComponent key={token.type} token={token} handlePick={onReturnToken} />
                    ))}
                    <button onClick={onConfirmToken}>Accept</button>
                </div>
            ) : (
                <div style={{ minHeight: 28 }}></div>
            )}
            <div className='reserved-cards'>
                {/* 使用 map 遍历 players 数组，渲染每位玩家的 reservedCards */}
                {state.players.map((player, index) => (
                    <CardRow className="reserved-card" key={index} cards={player.reservedCards} />
                ))}
            </div>
        </div>
    );
};

export default Board;
