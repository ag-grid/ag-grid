import { CustomStatusPanelProps } from '@ag-grid-community/react';
import React from 'react';

export default (props: CustomStatusPanelProps) => {
    const onClick = () => {
        alert('Selected Row Count: ' + props.api.getSelectedRows().length);
    };

    return (
        <div className="ag-status-name-value">
            <span>
                Status Bar Component&nbsp;
                <input type="button" className="status-bar-input" onClick={() => onClick()} value="Click Me" />
            </span>
        </div>
    );
};
