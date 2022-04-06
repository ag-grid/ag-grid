import React, { useEffect, useState } from 'react';

export default props => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(props.api.getModel().getCount());
    }, []);

    return (
        <div className="ag-status-name-value">
            <span className="component">Row Count Component&nbsp;</span>
            <span className="ag-status-name-value-value">{count}</span>
        </div>
    );
};

