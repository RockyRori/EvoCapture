import React, { useCallback } from 'react';
import Board from '../components/Board';
import PlayerBoard from '../components/PlayerBoard';
import PlayerController from '../components/PlayerController';
import { useGameStore } from '../store/GameStore';
import './GameView.css';

const GameView: React.FC = () => {
    const { state, dispatch } = useGameStore();

    // 使用 useCallback 缓存事件处理函数，避免不必要的函数重建
    const startGame = useCallback(() => {
        dispatch({ type: 'INIT_GAME' });
    }, [dispatch]);

    const gameOver = useCallback(() => {
        window.location.reload();
    }, []);

    // 如果游戏尚未开始，显示开始界面
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
                {/* 玩家控制器 */}
                <PlayerController />
                <div className="players-container">
                    {state.players.map((player) => (
                        <PlayerBoard key={player.id} player={player} />
                    ))}
                </div>
            </div>
            {state.isGameOver && (
                <div className="game-over">
                    <div>
                        {state.players[state.currentPlayerIndex].name} 是真正的精灵大师
                    </div>
                    <button onClick={gameOver}>游戏结束 再来一局</button>
                </div>
            )}
        </div>
    );
};

export default GameView;
