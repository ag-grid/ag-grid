import React from 'react';

import type { CustomOverlayProps } from 'ag-grid-react';

export default (props: CustomOverlayProps & { loadingMessage: string; noRowsMessage: string }) => {
    let message = 'Default Message';
    if (props.overlayType === 'loading') {
        message = props.loadingMessage;
    } else if (props.overlayType === 'noRows') {
        message = props.noRowsMessage;
    }

    return (
        <div className="overlay-center" role="presentation">
            <div aria-live="polite" aria-atomic="true">
                {message}
            </div>
        </div>
    );
};
