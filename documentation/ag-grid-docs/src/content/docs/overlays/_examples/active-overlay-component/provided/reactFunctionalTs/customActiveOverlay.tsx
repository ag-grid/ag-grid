import React from 'react';

type CustomActiveOverlayProps = {
    heading?: string;
    message?: string;
};

const CustomActiveOverlay: React.FC<CustomActiveOverlayProps> = ({
    heading = 'Active Overlay',
    message = 'This overlay is rendered via activeOverlay.',
}) => {
    return (
        <div className="custom-active-overlay" role="presentation" aria-live="polite" aria-atomic="true">
            <div className="custom-active-overlay__body">
                <h2>{heading}</h2>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default CustomActiveOverlay;
