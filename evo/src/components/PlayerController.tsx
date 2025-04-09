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

  const periodCaptureEvolve = useCallback(() => {
    changePeriod('evolve', () => {
      dispatch({ type: 'EVOLVE' });
      dispatch({ type: 'CHECK_GAME_END_ONLY' });
    });
  }, [changePeriod, dispatch]);

  const periodSkip = useCallback(() => {
    changePeriod('ready', () => {
      dispatch({ type: 'CHECK_GAME_END_WITH_NEXT_TURN' });
    });
  }, [changePeriod, dispatch]);

  const checkRules = () => {
    window.open('https://github.com/RockyRori/EvoCapture/blob/main/RULE.md', '_blank');
  };

  return (
    <div className="player-controller">
      <h3>
        玩法跟【璀璨宝石：宝可梦】一样，点击看看规则<button className="rule" onClick={checkRules}>https://github.com/RockyRori/EvoCapture/blob/main/RULE.md</button>
      </h3>
      <h2>
        Player {currentPlayer.name} now {state.period}
      </h2>
      <div className="controller-buttons">
        <button className="btn btn-gem" onClick={periodPickTokens}>
          拿精灵球
        </button>
        <button className="btn btn-reserve" onClick={periodReserveCreature}>
          拿大师球
        </button>
        <button className="btn btn-capture" onClick={periodCaptureCreature}>
          捕获精灵
        </button>
        <button className="btn btn-evolve" onClick={periodCaptureEvolve}>
          自由进化
        </button>
        <button className="btn btn-skip" onClick={periodSkip}>
          跳过回合
        </button>
      </div>
    </div>
  );
};

export default PlayerController;
