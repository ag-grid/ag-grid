import React from 'react';

export default (params) => {
    let priceMultiplier = 1;
    if (params.value > 5000000000) {
        priceMultiplier = 2;
    }
    if (params.value > 10000000000) {
        priceMultiplier = 3;
    }
    if (params.value > 20000000000) {
        priceMultiplier = 4;
    }
    if (params.value > 300000000000) {
        priceMultiplier = 5;
    }

    const priceArr = new Array(priceMultiplier).fill('');

    return (
        <span className="imgSpan">
            {priceArr.map((_, index) => (
                <img
                    key={index}
                    src="https://www.ag-grid.com/example-assets/icons/pound-coin-color-icon.svg"
                    className="priceIcon"
                />
            ))}
        </span>
    );
};
