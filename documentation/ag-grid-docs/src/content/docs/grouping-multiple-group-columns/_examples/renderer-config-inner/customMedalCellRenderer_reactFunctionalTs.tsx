import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (params: CustomCellRendererProps) => {
    const priceArr: any[] = new Array(params.value ?? 0).fill('');

    return (
        <span className="imgSpan">
            {priceArr.map((_, index) => (
                <img key={index} src="https://www.ag-grid.com/example-assets/gold-star.png" className="medalIcon" />
            ))}
        </span>
    );
};
