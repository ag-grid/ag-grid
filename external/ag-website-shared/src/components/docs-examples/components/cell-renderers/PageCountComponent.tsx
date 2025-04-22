import { useEffect, useState } from 'react';

import type { CustomHeaderProps } from 'ag-grid-react';

export const PageCountComponent = (props: CustomHeaderProps) => {
    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(0);

    useEffect(() => {
        const pages = new Set();
        props.api.forEachNodeAfterFilter((rowNode) => {
            const pageName = rowNode.data?.pageName;
            if (pageName) {
                pages.add(pageName);
            }
        });
        setMaxCount(pages.size);
    }, []);

    useEffect(() => {
        const onFilterCountChanged = () => {
            const pages = new Set();
            props.api.forEachNodeAfterFilter((rowNode) => {
                const pageName = rowNode.data?.pageName;
                if (pageName) {
                    pages.add(pageName);
                }
            });
            setCount(pages.size);
        };
        props.api.addEventListener('filterChanged', onFilterCountChanged);

        onFilterCountChanged();

        return () => {
            props.api.removeEventListener('filterChanged', onFilterCountChanged);
        };
    }, []);

    return (
        <div className="ag-status-name-value">
            <span className="component">Pages:</span>{' '}
            <span className="ag-status-name-value-value">
                {count} of {maxCount}
            </span>
        </div>
    );
};
