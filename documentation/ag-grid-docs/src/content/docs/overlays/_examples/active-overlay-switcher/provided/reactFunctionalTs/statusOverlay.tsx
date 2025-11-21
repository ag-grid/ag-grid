import React from 'react';

export interface StatusOverlayParams {
    myCounter: number;
}

function StatusOverlay({ myCounter }: StatusOverlayParams) {
    return <div className="status-overlay">custom: {myCounter}</div>;
};

export default StatusOverlay;
