import React, { forwardRef, useEffect, useRef } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default forwardRef((props: CustomCellRendererProps) => {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!wrapper || !wrapper.current) {
            return;
        }
        props.setTooltip(
            `Dynamic Tooltip for ${props.value}`,
            () => wrapper.current?.scrollWidth! > wrapper.current?.clientWidth!
        );
    }, [wrapper]);

    return (
        <div ref={wrapper} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {props.value}
        </div>
    );
});
