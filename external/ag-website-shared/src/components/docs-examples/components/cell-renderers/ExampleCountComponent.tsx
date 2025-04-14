import { useEffect, useState } from 'react';

import type { CustomHeaderProps } from 'ag-grid-react';

export const ExampleCountComponent = (props: CustomHeaderProps) => {
    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(0);

    useEffect(() => {
        const examples = new Set();
        props.api.forEachNode((rowNode) => {
            const exampleName = rowNode.data?.exampleName;
            if (exampleName) {
                examples.add(exampleName);
            }
        });
        setMaxCount(examples.size);
    }, []);

    useEffect(() => {
        const onFilterCountChanged = () => {
            const examples = new Set();
            props.api.forEachNodeAfterFilter((rowNode) => {
                const exampleName = rowNode.data?.exampleName;
                if (exampleName) {
                    examples.add(exampleName);
                }
            });
            setCount(examples.size);
        };
        props.api.addEventListener('filterChanged', onFilterCountChanged);

        onFilterCountChanged();

        return () => {
            props.api.removeEventListener('filterChanged', onFilterCountChanged);
        };
    }, []);

    return (
        <div className="ag-status-name-value">
            <span className="component">Examples:</span>{' '}
            <span className="ag-status-name-value-value">
                {count} of {maxCount}
            </span>
        </div>
    );
};
