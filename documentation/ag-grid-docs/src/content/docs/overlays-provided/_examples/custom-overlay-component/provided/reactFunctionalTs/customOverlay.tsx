import React from 'react';

import type { CustomOverlayProps } from 'ag-grid-react';

export default (props: CustomOverlayProps & { loadingMessage: string; noRowsMessage: string }) => {
    let message = '';
    if (props.overlayType === 'loading') {
        message = props.loadingMessage;
    } else if (props.overlayType === 'noRows') {
        message = props.noRowsMessage;
    }

    return (
        <div className="overlay-center" role="presentation">
            {props.overlayType === 'loading' ? (
                <div
                    role="presentation"
                    className="custom-loading-overlay"
                    style={{
                        height: 100,
                        width: 100,
                        background:
                            'url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat',
                        margin: '0 auto',
                    }}
                ></div>
            ) : null}
            <div aria-live="polite" aria-atomic="true">
                {message}
            </div>
        </div>
    );
};
