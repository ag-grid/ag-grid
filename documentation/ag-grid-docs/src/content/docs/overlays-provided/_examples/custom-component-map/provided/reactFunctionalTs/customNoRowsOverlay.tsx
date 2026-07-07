import React from 'react';

import type { CustomNoRowsOverlayProps } from 'ag-grid-react';

export default (props: CustomNoRowsOverlayProps & { noRowsMessageFunc: () => string }) => {
    return (
        <div className="overlay-loading-center" style={{ backgroundColor: '#b4bebe', height: '9%' }}>
            <i className="far fa-frown"> {props.noRowsMessageFunc()}</i>
        </div>
    );
};
