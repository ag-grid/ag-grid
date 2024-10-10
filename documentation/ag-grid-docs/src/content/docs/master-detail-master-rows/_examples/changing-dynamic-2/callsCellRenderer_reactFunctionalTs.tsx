import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    const onAdd = () => {
        const oldData = props.node.data;

        const oldCallRecords = oldData.callRecords;

        const newCallRecords: any[] = oldCallRecords.slice(0); // make a copy
        newCallRecords.push({
            name: ['Bob', 'Paul', 'David', 'John'][Math.floor(Math.random() * 4)],
            callId: Math.floor(Math.random() * 1000),
            duration: Math.floor(Math.random() * 100) + 1,
            switchCode: 'SW5',
            direction: 'Out',
            number: '(02) ' + Math.floor(Math.random() * 1000000),
        }); // add one item

        let minutes = 0;
        newCallRecords.forEach((r) => (minutes += r.duration));

        const newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords,
        };

        props.api.applyTransaction({ update: [newData] });

        props.node.setExpanded(true);
    };

    const onRemove = () => {
        const oldData = props.node.data;

        const oldCallRecords = oldData.callRecords;

        if (oldCallRecords.length == 0) {
            return;
        }

        const newCallRecords: any[] = oldCallRecords.slice(0); // make a copy
        newCallRecords.pop(); // remove one item

        let minutes = 0;
        newCallRecords.forEach((r) => (minutes += r.duration));

        const newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords,
        };

        props.api.applyTransaction({ update: [newData] });
    };

    return (
        <div className="calls-cell-renderer">
            <button onClick={onAdd}>+</button>
            <button onClick={onRemove}>-</button>
            <span>{props.value}</span>
        </div>
    );
};
