import React, { useEffect, useRef, useState } from 'react';

import type { CustomHeaderGroupProps } from 'ag-grid-react';

export default (props: CustomHeaderGroupProps) => {
    const [expandState, setExpandState] = useState('collapsed');
    const refLabel = useRef<HTMLDivElement>(null);

    const expandOrCollapse = () => {
        const currentState = props.columnGroup.getProvidedColumnGroup().isExpanded();
        props.setExpanded(!currentState);
    };

    const syncExpandButtons = () => {
        setExpandState(props.columnGroup.getProvidedColumnGroup().isExpanded() ? 'expanded' : 'collapsed');
    };

    useEffect(() => {
        props.columnGroup.getProvidedColumnGroup().addEventListener('expandedChanged', syncExpandButtons);
        syncExpandButtons();

        return () => {
            props.columnGroup.getProvidedColumnGroup().removeEventListener('expandedChanged', syncExpandButtons);
        };
    }, []);

    useEffect(() => {
        if (!refLabel.current) {
            return;
        }
        props.setTooltip(props.displayName, () => refLabel.current!.scrollWidth > refLabel.current!.clientWidth);
    }, [refLabel]);

    return (
        <div className="ag-header-group-cell-label">
            <div ref={refLabel} className="customHeaderLabel">
                {props.displayName}
            </div>
            <div className={`customExpandButton ${expandState}`} onClick={() => expandOrCollapse()}>
                <i className="fa fa-arrow-right"></i>
            </div>
        </div>
    );
};
