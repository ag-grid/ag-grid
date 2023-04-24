import React, {useMemo} from 'react';

export default props => {
    const data = useMemo( ()=> props.api.getDisplayedRowAtIndex(props.rowIndex).data, []);

    return (
        <div className="custom-tooltip" style={{backgroundColor: props.color || 'white'}}>
            <p><span>{data.athlete}</span></p>
            <p><span>Country: </span> {data.country}</p>
            <p><span>Total: </span> {data.total}</p>
        </div>
    );
};

