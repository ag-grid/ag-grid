import React from 'react';

import type { CustomLoadingCellRendererProps } from 'ag-grid-react';

export default (props: CustomLoadingCellRendererProps & { loadingMessage: string }) => (
    <div className="ag-custom-loading-cell">
        <i className="fas fa-spinner fa-pulse"></i> <span>{props.loadingMessage}</span>
    </div>
);
