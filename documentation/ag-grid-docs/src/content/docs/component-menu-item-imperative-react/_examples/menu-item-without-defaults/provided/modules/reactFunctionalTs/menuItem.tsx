import { Column, IFilterComp, IMenuItemParams } from '@ag-grid-community/core';
import React, { KeyboardEvent, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface ButtonCustomMenuItemProps extends IMenuItemParams {
    column: Column;
}

export default forwardRef((props: ButtonCustomMenuItemProps, ref) => {
    const filterWrapperRef = useRef<HTMLDivElement>(null);
    const optionRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (filterWrapperRef.current) {
            props.api.getColumnFilterInstance<IFilterComp>(props.column).then((filter) => {
                filterWrapperRef.current!.appendChild(filter!.getGui());
            });
        }
    }, [filterWrapperRef.current]);

    useImperativeHandle(ref, () => {
        return {
            setActive(newActive: boolean) {
                setActive(newActive);
            },
        };
    });

    useEffect(() => {
        if (active) {
            optionRef.current?.focus();
        }
    }, [active]);

    const onOptionKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((oldExpanded) => !oldExpanded);
        }
    }, []);

    const onFilterWrapperKeyDown = useCallback((e: KeyboardEvent) => {
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
                onMouseEnter={() => {
                    setActive(true);
                    props.onItemActivated();
                }}
                onMouseLeave={() => setActive(false)}
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
});
