import React from 'react';

export interface StatusOverlayParams {
    myCounter?: number;
}

const StatusOverlay = ({ myCounter }: StatusOverlayParams = {}) => {
    return <div className="status-overlay">custom: {myCounter}</div>;
};

export default StatusOverlay;
