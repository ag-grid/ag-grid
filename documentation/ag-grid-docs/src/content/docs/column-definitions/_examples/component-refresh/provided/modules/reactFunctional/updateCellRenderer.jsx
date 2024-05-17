import React, { useCallback } from 'react';

export default (props) => {
    const onClick = useCallback(() => {
        const { gold, silver, bronze } = props.node.data;
        props.node.updateData({
            ...props.node.data,
            gold: gold + 1,
            silver: silver + 1,
            bronze: bronze + 1,
        });
    }, []);

    return (
        <div>
            <button onClick={onClick}>Update Data</button>
        </div>
    );
};
