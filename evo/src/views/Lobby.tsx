// Lobby.tsx
import React from 'react';
import { useGameStore } from '../store/GameStore';

// 从外部 JSON 文件中引入所有玩家数据
import usersData from '../data/users.json';
const AvailableRoles = usersData.Players;

const Lobby: React.FC = () => {
    const { state, dispatch } = useGameStore();

    // 加入游戏操作：点击某个角色后派发 JOIN_GAME 动作
    const joinGame = (role: typeof AvailableRoles[0]) => {
        dispatch({ type: 'JOIN_GAME', payload: role });
    };

    // 开始游戏操作：至少需要 1 个玩家才能点击开始
    const startGame = () => {
        if (state.players.length > 0) {
            dispatch({ type: 'INIT_GAME' });
        }
    };

    const checkRules = () => {
        window.open('https://github.com/RockyRori/EvoCapture/blob/main/README.md', '_blank');
    };

    return (
        <div className="lobby-screen">
            <h1>EvoCapture - 大厅</h1>
            <div className="available-roles">
                <h2>游戏规则</h2>
                <button className="rule" onClick={checkRules}>https://github.com/RockyRori/EvoCapture/blob/main/README.md</button>
                <h2>选择角色加入游戏</h2>
                {AvailableRoles.map(role => (
                    <div key={role.id} className="role-item">
                        <img src={role.avatar} alt={role.name} style={{ width: '50px', height: '50px' }} />
                        <span>{role.name}</span>
                        <button
                            onClick={() => joinGame(role)}
                            disabled={state.players.some(player => player.id === role.id)}
                        >
                            {state.players.some(player => player.id === role.id) ? '已加入' : '加入'}
                        </button>
                    </div>
                ))}
            </div>
            <div className="joined-players">
                <h2>已加入玩家</h2>
                {state.players.length > 0 ? (
                    state.players.map(player => <div key={player.id}>{player.name}</div>)
                ) : (
                    <div>暂无玩家加入</div>
                )}
            </div>
            <button onClick={startGame} disabled={state.players.length === 0}>
                开始游戏
            </button>
        </div>
    );
};

export default Lobby;
