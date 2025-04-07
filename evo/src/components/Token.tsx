import React from 'react';
import type { Token } from '../models/Token';
import './Token.css';

interface TokenProps {
    token: Token;
    onPick: (tokenType: string) => void;
}

const TokenComponent: React.FC<TokenProps> = ({ token, onPick }) => {
    const pickToken = () => {
        if (token.count > 0) {
            onPick(token.type);
        }
    };

    return (
        <div className={`token ${token.type}`} onClick={pickToken}>
            <p>
                {token.type} ({token.count})
            </p>
        </div>
    );
};

export default TokenComponent;
