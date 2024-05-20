import React, { forwardRef, useEffect, useRef } from 'react';

export default forwardRef((props, ref) => {
    const wrapper = useRef(null);

    useEffect(() => {
        if (!wrapper.current) {
            return;
        }
        props.setTooltip(
            `Dynamic Tooltip for ${props.value}`,
            () => wrapper.current.scrollWidth > wrapper.current.clientWidth
        );
    }, [wrapper]);

    return (
        <div ref={wrapper} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {props.value}
        </div>
    );
});
