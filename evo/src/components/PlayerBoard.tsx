import React from 'react';
import type { Player } from '../models/Player';
import { useGameStore } from '../store/GameStore';
import TokenComponent from './Token';
import './PlayerBoard.css';

interface PlayerBoardProps {
    player: Player;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({ player }) => {
    const { state, dispatch } = useGameStore();
    const onPickToken = (tokenType: string) => {
        dispatch({ type: 'PICK_TOKENS', payload: [tokenType] });
    };
    return (
        <div className="board">
            <div className="tokens-pool">
                {state.tokensPool.map((token) => (
                    <TokenComponent key={token.type} token={token} onPick={onPickToken} />
                ))}
            </div>
            <div className="player-board">


                <h2>
                    {player.name} (得分: {player.points})
                </h2>
                <div className="tokens">
                    {Object.entries(player.tokens).map((pair) => (
                        <TokenComponent key={pair[0]} token={pair[1]} onPick={onPickToken} />
                    ))}
                </div>
                <div className="cards-owned">
                    {player.cards.map((card) => (
                        <div key={card.id} className="owned-card">
                            <img src={card.imageUrl} alt={card.rewardGemType} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlayerBoard;
