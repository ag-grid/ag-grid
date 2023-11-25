import React, { useCallback } from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

export default (props: ICellRendererParams<IOlympicData>) => {
    const onClick = useCallback(() => {
        const { gold, silver, bronze } = props.node.data!;
        props.node.updateData({
            ...props.node.data!,
            gold: gold + 1,
            silver: silver + 1,
            bronze: bronze + 1
        });
    }, []);

    return (<div><button onClick={onClick}>Update Data</button></div>);
};
