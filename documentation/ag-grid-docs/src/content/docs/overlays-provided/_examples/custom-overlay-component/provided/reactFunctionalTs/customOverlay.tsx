import React from 'react';

import type { CustomOverlayProps } from 'ag-grid-react';

type CustomOverlayParams = {
    loading: { overlayText: string };
    noRows: { overlayText: string };
};

export default (props: CustomOverlayProps & CustomOverlayParams) => {
    let message = 'Default Message';
    if (props.overlayType === 'loading') {
        message = props.loading.overlayText;
    } else if (props.overlayType === 'noRows') {
        message = props.noRows.overlayText;
    }

    return <div className="overlay-center">{message}</div>;
};
