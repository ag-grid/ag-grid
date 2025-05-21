import { useEffect, useState } from 'react';

import type { CustomHeaderProps } from 'ag-grid-react';

export const ExampleCountComponent = (props: CustomHeaderProps) => {
    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(0);

    useEffect(() => {
        let numExamples = 0;
        props.api.forEachNode((rowNode) => {
            const exampleName = rowNode.data?.exampleName;
            if (exampleName) {
                numExamples++;
            }
        });
        setMaxCount(numExamples);
    }, []);

    useEffect(() => {
        const onFilterCountChanged = () => {
            let numExamples = 0;
            props.api.forEachNodeAfterFilter((rowNode) => {
                const exampleName = rowNode.data?.exampleName;
                if (exampleName) {
                    numExamples++;
                }
            });
            setCount(numExamples);
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
