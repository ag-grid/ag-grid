import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

export default ({ column, api, active, onActiveChange }) => {
    const filterWrapperRef = useRef(null);
    const optionRef = useRef(null);
    useEffect(() => {
        if (filterWrapperRef.current) {
            api.getColumnFilterInstance(column).then((filter) => {
                filterWrapperRef.current.appendChild(filter.getGui());
            });
        }
    }, [filterWrapperRef.current]);

    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (active) {
            optionRef.current.focus();
        }
    }, [active]);

    const onOptionKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((oldExpanded) => !oldExpanded);
        }
    }, []);

    const onFilterWrapperKeyDown = useCallback((e) => {
        // stop the menu from handling keyboard navigation inside the filter
        e.stopPropagation();
    }, []);

    return (
        <div>
            <div
                ref={optionRef}
                tabIndex={-1}
                className={'ag-menu-option ' + (active ? 'ag-menu-option-active' : '')}
                onClick={() => setExpanded((oldExpanded) => !oldExpanded)}
                onMouseEnter={() => onActiveChange(true)}
                onMouseLeave={() => onActiveChange(false)}
                onKeyDownCapture={onOptionKeyDown}
            >
                <span className="ag-menu-option-part ag-menu-option-icon" role="presentation">
                    <span className="ag-icon ag-icon-filter" unselectable="on" role="presentation"></span>
                </span>
                <span className="ag-menu-option-part ag-menu-option-text">Filter</span>
                <span className="ag-menu-option-part ag-menu-option-popup-pointer">
                    <span
                        className={'ag-icon ' + (expanded ? 'ag-icon-tree-open' : 'ag-icon-tree-closed')}
                        unselectable="on"
                        role="presentation"
                    ></span>
                </span>
            </div>
            <div
                ref={filterWrapperRef}
                style={{ display: expanded ? 'block' : 'none' }}
                onKeyDownCapture={onFilterWrapperKeyDown}
            ></div>
        </div>
    );
};
