import React from 'react';

export default (props) => {
    const image = props.value === 'Male' ? 'male.png' : 'female.png';
    const imageSource = `https://www.ag-grid.com/example-assets/genders/${image}`;
    const backgroundColor = props.value === 'Male' ? '#2244CC88' : '#CC229988';
    return (
        <span style={{backgroundColor, padding: '5px'}}>
            <img src={imageSource} />{props.value}
        </span>
    );
};

