// GameView.tsx
import React, { useCallback } from 'react';
import Board from '../components/Board';
import PlayerBoard from '../components/PlayerBoard';
import PlayerController from '../components/PlayerController';
import Lobby from './Lobby';
import { useGameStore } from '../store/GameStore';
import './GameView.css';

const GameView: React.FC = () => {
    const { state } = useGameStore();

    // 游戏结束后重载页面的函数
    const gameOver = useCallback(() => {
        window.location.reload();
    }, []);

    // 如果游戏尚未开始，则展示大厅
    if (!state.hasStarted) {
        return <Lobby />;
    }

    return (
        <div className="game-view">
            <div className="board-container">
                <Board />
            </div>
            <div className="action-container">
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
