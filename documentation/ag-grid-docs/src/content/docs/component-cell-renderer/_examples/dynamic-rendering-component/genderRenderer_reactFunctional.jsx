import React from 'react';

export default (props) => {
    const icon = props.value === 'Male' ? 'fa-male' : 'fa-female';
    return (
        <span>
            <i className={`fa ${icon}`}></i> {props.value}
        </span>
    );
};
