import React from 'react';

export default (params) => {
    const priceArr = new Array(params.value ?? 0).fill('');

    return (
        <span className="imgSpan">
            {priceArr.map((_, index) => (
                <img key={index} src="https://www.ag-grid.com/example-assets/gold-star.png" className="medalIcon" />
            ))}
        </span>
    );
};
