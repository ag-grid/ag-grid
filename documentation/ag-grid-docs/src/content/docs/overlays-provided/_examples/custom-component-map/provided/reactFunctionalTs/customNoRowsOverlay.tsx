import React from 'react';

import type { CustomNoRowsOverlayProps } from 'ag-grid-react';

type CustomNoRowsOverlayParams = {
    noRows: { overlayText: string };
};

export default (props: CustomNoRowsOverlayProps & CustomNoRowsOverlayParams) => {
    return (
        <div className="overlay-loading-center" style={{ backgroundColor: '#b4bebe', height: '9%' }}>
            <span className="far fa-frown" aria-hidden="true"></span>{' '}
            <span role="status">{props.noRows.overlayText}</span>
        </div>
    );
};
