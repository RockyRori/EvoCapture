import React from 'react';
import type { Player } from '../models/Player';
import './PlayerBoard.css';

interface PlayerBoardProps {
    player: Player;
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({ player }) => {
    return (
        <div className="player-board">
            <h2>
                {player.name} (得分: {player.points})
            </h2>
            <div className="tokens">
                {Object.entries(player.tokens).map(([gemType, count]) => (
                    <div key={gemType}>
                        {gemType}: {count}
                    </div>
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
    );
};

export default PlayerBoard;
