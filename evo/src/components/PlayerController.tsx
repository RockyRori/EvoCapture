// src/components/PlayerController.tsx
import React from 'react';
import { useGameStore } from '../store/GameStore';
import './PlayerController.css';

const PlayerController: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const currentPlayer = state.players[state.currentPlayerIndex];

  const periodPickTokens = () => {
    dispatch({ type: 'STASH' });
    dispatch({ type: 'CHANGE_PERIOD', payload: 'gem' });
  };

  const periodReserveCreature = () => {
    dispatch({ type: 'STASH' });
    dispatch({ type: 'CHANGE_PERIOD', payload: 'reserve' });
  };

  const periodCaptureCreature = () => {
    dispatch({ type: 'STASH' });
    dispatch({ type: 'CHANGE_PERIOD', payload: 'capture' });
  };

  const periodSkip = () => {
    dispatch({ type: 'STASH' });
    dispatch({ type: 'CHANGE_PERIOD', payload: 'ready' });

    dispatch({ type: 'NEXT_TURN' });
    dispatch({ type: 'CHECK_GAME_END' });
  };

  return (
    <div className="player-controller">
      <h2>Player {currentPlayer.name} is manipulating {state.period}</h2>
      <div className="controller-buttons">
        <button onClick={periodPickTokens}>Gem</button>
        <button onClick={periodReserveCreature}>Reserve</button>
        <button onClick={periodCaptureCreature}>Capture</button>
        <button onClick={periodSkip}>Skip</button>
      </div>
    </div>
  );
};

export default PlayerController;
