// src/components/PlayerController.tsx
import React from 'react';
import { useGameStore } from '../store/GameStore';
import './PlayerController.css';

const PlayerController: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const currentPlayer = state.players[state.currentPlayerIndex];

  // 模拟获取宝石阶段：此处仅作为示例，每次点击模拟领取一种代币，然后切换玩家
  const handlePickTokens = () => {
    // 例如，当前玩家选择领取 'metal' 代币
    dispatch({ type: 'PICK_TOKENS', payload: ['metal'] });
    // 检查游戏是否达成结束条件
    dispatch({ type: 'CHECK_GAME_END' });
    // 阶段完成后，切换到下一位玩家
    dispatch({ type: 'NEXT_TURN' });
  };

  // 模拟捕捉精灵阶段
  const handleCapturePokemon = () => {
    // 此处可以添加捕捉精灵的具体逻辑，目前直接触发对应动作
    dispatch({ type: 'CAPTURE_POKEMON' });
    // 检查游戏是否达成结束条件
    dispatch({ type: 'CHECK_GAME_END' });
    // 阶段完成后，切换到下一位玩家
    dispatch({ type: 'NEXT_TURN' });
  };

  return (
    <div className="player-controller">
      <h2>当前玩家 {currentPlayer.name} 正在操作</h2>
      <div className="controller-buttons">
        <button onClick={handlePickTokens}>获取宝石</button>
        <button onClick={handleCapturePokemon}>捕捉精灵</button>
      </div>
    </div>
  );
};

export default PlayerController;
