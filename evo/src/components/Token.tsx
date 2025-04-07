import React from 'react';
import type { Token } from '../models/Token';
import './Token.css';

interface TokenProps {
    token: Token;
    handlePick: (tokenType: string) => void;
}

const TokenComponent: React.FC<TokenProps> = ({ token, handlePick }) => {
    const handleToken = () => {
        handlePick(token.type);
    };

    return (
        <div className={`token ${token.type}`} onClick={handleToken}>
            <p>
                {token.count}
            </p>
        </div>
    );
};

export default TokenComponent;
