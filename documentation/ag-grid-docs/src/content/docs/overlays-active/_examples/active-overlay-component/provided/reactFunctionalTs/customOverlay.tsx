import React from 'react';

import type { CustomOverlayProps } from 'ag-grid-react';

export interface CustomParams {
    count: number;
}

export const CustomOverlay = (props: CustomOverlayProps & CustomParams) => {
    const statusText = `Custom overlay shown. Count ${props.count}.`;

    return (
        <div className="my-custom-overlay">
            <span>Custom Overlay: {props.count}</span>
            <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
                {statusText}
            </span>
        </div>
    );
};
