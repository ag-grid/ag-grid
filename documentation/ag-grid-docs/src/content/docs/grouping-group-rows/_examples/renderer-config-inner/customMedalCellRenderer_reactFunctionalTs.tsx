import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (params: CustomCellRendererProps) => {
    const priceArr: any[] = new Array(Number(params.value ?? 0)).fill('');

    return (
        <span className="imgSpan">
            {priceArr.map((_, index) => (
                <img key={index} src="https://www.ag-grid.com/example-assets/gold-star.png" className="medalIcon" />
            ))}
        </span>
    );
};
