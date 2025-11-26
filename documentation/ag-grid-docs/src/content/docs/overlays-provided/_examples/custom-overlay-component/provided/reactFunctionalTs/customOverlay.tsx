import React from 'react';

import type { CustomOverlayProps } from 'ag-grid-react';

export default (props: CustomOverlayProps & { loadingMessage: string; noRowsMessage: string }) => {

    let message = '';
    if (props.defaultOverlay === 'agLoadingOverlay') {
        message = props.loadingMessage;
    } else if (props.defaultOverlay === 'agNoRowsOverlay') {
        message = props.noRowsMessage;
    }

    return (
        <div className="overlay-center" role="presentation">
            {props.defaultOverlay === 'agLoadingOverlay' ? <div
                role="presentation"
                className="custom-loading-overlay"
                style={{
                    height: 100,
                    width: 100,
                    background:
                        'url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat',
                    margin: '0 auto',
                }}
            ></div> : null}
            <div aria-live="polite" aria-atomic="true">
                {message}
            </div>
        </div>
    );
};
