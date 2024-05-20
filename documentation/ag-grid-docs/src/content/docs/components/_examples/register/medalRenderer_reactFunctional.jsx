import React from 'react';

export default (props) => {
    const country = props.valueFormatted ? props.valueFormatted : props.value;
    const total = props.data.total;

    return (
        <span className="total-value-renderer">
            <span>{country}</span>
            <button onClick={() => alert(`${total} medals won!`)}>Push For Total</button>
        </span>
    );
};
