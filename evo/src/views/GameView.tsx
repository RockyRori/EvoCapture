import React from 'react';
import Board from '../components/Board';
import PlayerBoard from '../components/PlayerBoard';
import { useGameStore } from '../store/GameStore';
import './GameView.css';

const GameView: React.FC = () => {
    const { state, dispatch } = useGameStore();

    const restartGame = () => {
        dispatch({ type: 'INIT_GAME' });
    };

    return (
        <div className="game-view">
            <h1>卡牌进化之地</h1>

            <div className="board-container">
                <Board />
            </div>

            <div className="players-container">
                {state.players.map((player) => (
                    <PlayerBoard key={player.id} player={player} />
                ))}
            </div>

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
