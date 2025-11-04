import React from 'react';

type StatusOverlayProps = {
    heading?: string;
    message?: string;
};

const StatusOverlay = ({
    heading = 'Status Update',
    message = 'Custom overlay supplied from the components map.',
}: StatusOverlayProps) => {
    return (
        <div className="status-overlay" role="presentation" aria-live="polite" aria-atomic="true">
            <div className="status-overlay__body">
                <h2>{heading}</h2>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default StatusOverlay;
