import React from 'react';

import type { IToolbarItemParams } from 'ag-grid-community';

export default (props: IToolbarItemParams) => {
    const onClick = () => {
        const selectedRows = props.api.getSelectedRows();
        console.log('Selected Rows:', selectedRows.length);
    };

    return (
        <div className="ag-toolbar-item">
            <button className="ag-button ag-standard-button" onClick={onClick}>
                Log Selected Rows
            </button>
        </div>
    );
};
