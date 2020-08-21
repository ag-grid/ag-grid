import React from 'react';

export default props => {
    const image = props.value === 'Male' ? 'male.png' : 'female.png';
    const imageSource = `../images/${image}`;
    return (
        <span>
                <img src={imageSource}/>{props.value}
            </span>
    )
};

