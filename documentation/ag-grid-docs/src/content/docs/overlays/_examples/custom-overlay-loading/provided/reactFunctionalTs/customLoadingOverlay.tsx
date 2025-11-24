import React from 'react';

import type { CustomLoadingOverlayProps } from 'ag-grid-react';

export default (props: CustomLoadingOverlayProps & { loadingMessage: string }) => {
    return (
        <div className="ag-overlay-loading-center" role="presentation">
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
            <div aria-live="polite" aria-atomic="true">
                {props.loadingMessage}
            </div>
        </div>
    );
};
