import React, { useEffect } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import type { IOlympicData } from './interfaces';

export default (props: CustomCellRendererProps<IOlympicData>) => {
    useEffect(() => {
        props.setTooltip('Won more than one gold medal at these Games', () => props.data!.gold > 1);
    }, []);

    return <div>{props.value}</div>;
};
