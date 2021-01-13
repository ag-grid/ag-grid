import React, {useEffect, useState} from 'react';

export default props => {
    const [count, setCount] = useState(true);

    useEffect(() => {
        setCount(props.api.getModel().rowsToDisplay.length);
    }, []);

    return (
        <div className="ag-status-name-value">
            <span className="component">Row Count Component&nbsp;</span>
            <span className="ag-status-name-value-value">{count}</span>
        </div>
    );
};

