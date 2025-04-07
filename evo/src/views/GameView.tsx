// src/views/GameView.tsx
import React, { useEffect } from 'react';
import Board from '../components/Board';
import PlayerBoard from '../components/PlayerBoard';
import { useGameStore } from '../store/GameStore';
import './GameView.css';

const GameView: React.FC = () => {
    const { state, dispatch } = useGameStore();

    // 页面加载时自动初始化游戏
    useEffect(() => {
        dispatch({ type: 'INIT_GAME' });
    }, [dispatch]);

    const restartGame = () => {
        dispatch({ type: 'INIT_GAME' });
    };

    return (
        <div className="game-view">
            <div className="board-container">
                <Board />
            </div>
            <div className="action-container">
                <div className="players-container">
                    {state.players.map((player) => (
                        <PlayerBoard key={player.id} player={player} />
                    ))}
                </div></div>

            {state.isGameOver && (
                <div className="game-over">
                    <p>游戏结束</p>
                    <button onClick={restartGame}>重新开始</button>
                </div>
            )}
        </div>
    );
};

export default GameView;
