import React from 'react';

export default (props) => (
    <React.Fragment>
        <img alt={props.data.country} src={props.context.base64flags[props.context.countryCodes[props.data.country]]} />
    </React.Fragment>
);
