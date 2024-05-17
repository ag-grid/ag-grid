import React from 'react';

export default (props) => {
    const onAdd = () => {
        var oldData = props.node.data;

        var oldCallRecords = oldData.callRecords;

        var newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.push({
            name: ['Bob', 'Paul', 'David', 'John'][Math.floor(Math.random() * 4)],
            callId: Math.floor(Math.random() * 1000),
            duration: Math.floor(Math.random() * 100) + 1,
            switchCode: 'SW5',
            direction: 'Out',
            number: '(02) ' + Math.floor(Math.random() * 1000000),
        }); // add one item

        var minutes = 0;
        newCallRecords.forEach((r) => (minutes += r.duration));

        var newData = {
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
        var oldData = props.node.data;

        var oldCallRecords = oldData.callRecords;

        if (oldCallRecords.length == 0) {
            return;
        }

        var newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.pop(); // remove one item

        var minutes = 0;
        newCallRecords.forEach((r) => (minutes += r.duration));

        var newData = {
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
