import React, { useEffect, useState } from 'react';

import type { CustomStatusPanelProps } from 'ag-grid-react';

export default (props: CustomStatusPanelProps) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(props.api.getDisplayedRowCount());
    }, []);

    return (
        <div className="ag-status-name-value">
            <span className="component">Row Count Component&nbsp;</span>
            <span className="ag-status-name-value-value">{count}</span>
        </div>
    );
};
