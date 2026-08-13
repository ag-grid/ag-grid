import React from 'react';

import type { CustomColumnSelectionLabelProps } from 'ag-grid-react';

interface CustomColumnLabelProps extends CustomColumnSelectionLabelProps {
    columnIcon: string;
    columnGroupIcon: string;
}

export default (props: CustomColumnLabelProps) => {
    const isGroup = props.columnGroup != null;

    return (
        <span className="custom-column-label">
            <span className="custom-column-label-icon">{isGroup ? props.columnGroupIcon : props.columnIcon}</span>
            <span className="custom-column-label-text">{props.displayName}</span>
        </span>
    );
};
