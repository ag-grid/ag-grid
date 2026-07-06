import React from 'react';

import type { CustomLoadingOverlayProps } from 'ag-grid-react';

type CustomLoadingOverlayParams = {
    loading: { overlayText: string };
};

export default (props: CustomLoadingOverlayProps & CustomLoadingOverlayParams) => {
    return (
        <div className="overlay-loading-center">
            <div
                aria-hidden="true"
                className="custom-loading-overlay"
                style={{
                    height: 100,
                    width: 100,
                    background:
                        'url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat',
                    margin: '0 auto',
                }}
            ></div>
            <div>{props.loading.overlayText}</div>
        </div>
    );
};
