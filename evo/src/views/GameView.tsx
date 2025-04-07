// src/views/GameView.tsx
import React, { useEffect } from 'react';
import Board from '../components/Board';
import PlayerBoard from '../components/PlayerBoard';
import PlayerController from '../components/PlayerController.tsx';
import { useGameStore } from '../store/GameStore';
import './GameView.css';

const GameView: React.FC = () => {
    const { state, dispatch } = useGameStore();

    // 页面加载时自动初始化游戏
    const startGame = () => {
        dispatch({ type: 'INIT_GAME' });
    };

    const gameOver = () => {
        window.location.reload();
    };

    if (!state.hasStarted) {
        return (
            <div className="start-screen">
                <h1>EvoCapture</h1>
                <button onClick={startGame}>Start Game</button>
            </div>
        );
    }

    return (
        <div className="game-view">
            <div className="board-container">
                <Board />
            </div>
            <div className="action-container">
                {/* 玩家流转控制器 */}
                <PlayerController />
                <div className="players-container">
                    {state.players.map((player) => (
                        <PlayerBoard key={player.id} player={player} />
                    ))}
                </div></div>

            {state.isGameOver && (
                < div className="game-over">
                    <div>{state.players[state.currentPlayerIndex].name} 是真正的精灵大师</div>
                    <button onClick={gameOver}>游戏结束 再来一局</button>
                </div>
            )
            }
        </div >
    );
};

export default GameView;
