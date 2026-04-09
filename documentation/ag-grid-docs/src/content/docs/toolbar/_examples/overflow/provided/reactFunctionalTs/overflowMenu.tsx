import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { IToolbarItemParams } from 'ag-grid-community';

interface OverflowAction {
    label: string;
    action: () => void;
}

export default (props: IToolbarItemParams) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const actions: OverflowAction[] = [
        { label: 'Export CSV', action: () => props.api.exportDataAsCsv() },
        { label: 'Export Excel', action: () => props.api.exportDataAsExcel() },
        { label: 'Auto Size Columns', action: () => props.api.autoSizeAllColumns() },
        { label: 'Reset Columns', action: () => props.api.resetColumnState() },
        { label: 'Column Chooser', action: () => props.api.showColumnChooser() },
        {
            label: 'Toggle Columns Panel',
            action: () => {
                if (props.api.getOpenedToolPanel() === 'columns') {
                    props.api.closeToolPanel();
                } else {
                    props.api.openToolPanel('columns');
                }
            },
        },
        {
            label: 'Toggle Filters Panel',
            action: () => {
                if (props.api.getOpenedToolPanel() === 'filters-new') {
                    props.api.closeToolPanel();
                } else {
                    props.api.openToolPanel('filters-new');
                }
            },
        },
    ];

    const closeMenu = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        if (!isOpen) return;
        const listener = (e: MouseEvent) => {
            if (!buttonRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
                closeMenu();
            }
        };
        document.addEventListener('click', listener);
        return () => document.removeEventListener('click', listener);
    }, [isOpen, closeMenu]);

    const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

    const menuStyle: React.CSSProperties = {
        display: isOpen ? 'block' : 'none',
        position: 'absolute',
        top: '100%',
        right: 0,
        zIndex: 10,
        minWidth: 180,
        padding: '4px 0',
        background: 'var(--ag-background-color, #fff)',
        border: '1px solid var(--ag-border-color, #ccc)',
        borderRadius: 'var(--ag-border-radius, 4px)',
        boxShadow: '0 2px 8px rgba(0,0,0,.15)',
    };

    return (
        <div className="ag-toolbar-item overflow-menu-wrapper" style={{ position: 'relative' }}>
            <button
                ref={buttonRef}
                className="ag-toolbar-button"
                title="More actions"
                aria-label="More actions"
                onClick={toggleMenu}
            >
                ☰
            </button>
            <div ref={menuRef} className="overflow-menu" style={menuStyle}>
                {actions.map((item) => (
                    <div
                        key={item.label}
                        className="overflow-menu-item"
                        style={{
                            padding: '6px 12px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontSize: 'var(--ag-font-size, 13px)',
                            color: 'var(--ag-text-color, #333)',
                        }}
                        onMouseEnter={(e) =>
                            ((e.target as HTMLElement).style.backgroundColor = 'var(--ag-row-hover-color, #f0f0f0)')
                        }
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = '')}
                        onClick={() => {
                            item.action();
                            closeMenu();
                        }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
};
