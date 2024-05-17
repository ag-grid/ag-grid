import React, { useEffect, useRef, useState } from 'react';

export default (props) => {
    const [expandState, setExpandState] = useState('collapsed');
    const refLabel = useRef(null);

    const expandOrCollapse = () => {
        let currentState = props.columnGroup.getProvidedColumnGroup().isExpanded();
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
        props.setTooltip(props.displayName, () => refLabel.current.scrollWidth > refLabel.current.clientWidth);
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
