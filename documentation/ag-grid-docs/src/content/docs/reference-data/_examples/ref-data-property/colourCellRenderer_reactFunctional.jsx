import React from 'react';

function removeSpaces(str) {
    return str ? str.replace(/\s/g, '') : str;
}

export default (props) => (
    <React.Fragment>
        {props.value === '(Select All)' ? (
            <div>{props.value}</div>
        ) : (
            <span style={{ color: removeSpaces(props.valueFormatted) }}>{props.valueFormatted}</span>
        )}
    </React.Fragment>
);
