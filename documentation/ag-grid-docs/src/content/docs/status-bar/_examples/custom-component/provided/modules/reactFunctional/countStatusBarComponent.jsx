import React, { useEffect, useState } from 'react';

export default (props) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const onRowCountChanged = () => {
            setCount(props.api.getDisplayedRowCount());
        };
        props.api.addEventListener('rowDataUpdated', onRowCountChanged);

        // Get the initial count
        onRowCountChanged();

        return () => {
            props.api.removeEventListener('rowDataUpdated', onRowCountChanged);
        };
    }, []);

    return (
        <div className="ag-status-name-value">
            <span className="component">Row Count Component&nbsp;</span>
            <span className="ag-status-name-value-value">{count}</span>
        </div>
    );
};
