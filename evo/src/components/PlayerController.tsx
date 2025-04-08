import React, { useCallback } from 'react';
import { useGameStore } from '../store/GameStore';
import './PlayerController.css';

const PlayerController: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const currentPlayer = state.players[state.currentPlayerIndex];

  // 通用函数，用于切换周期，同时执行可选的额外操作
  const changePeriod = useCallback(
    (period: string, extraActions?: () => void) => {
      dispatch({ type: 'STASH' });
      dispatch({ type: 'CHANGE_PERIOD', payload: period });
      if (extraActions) extraActions();
    },
    [dispatch]
  );

  const periodPickTokens = useCallback(() => {
    changePeriod('gem');
  }, [changePeriod]);

  const periodReserveCreature = useCallback(() => {
    changePeriod('reserve');
  }, [changePeriod]);

  const periodCaptureCreature = useCallback(() => {
    changePeriod('capture');
  }, [changePeriod]);

  const periodSkip = useCallback(() => {
    changePeriod('ready', () => {
      dispatch({ type: 'NEXT_TURN' });
      dispatch({ type: 'CHECK_GAME_END' });
    });
  }, [changePeriod, dispatch]);

  return (
    <div className="player-controller">
      <h2>
        Player {currentPlayer.name} is manipulating {state.period}
      </h2>
      <div className="controller-buttons">
        <button className="btn btn-gem" onClick={periodPickTokens}>
          Gem
        </button>
        <button className="btn btn-reserve" onClick={periodReserveCreature}>
          Reserve
        </button>
        <button className="btn btn-capture" onClick={periodCaptureCreature}>
          Capture
        </button>
        <button className="btn btn-skip" onClick={periodSkip}>
          Skip
        </button>
      </div>
    </div>
  );
};

export default PlayerController;
