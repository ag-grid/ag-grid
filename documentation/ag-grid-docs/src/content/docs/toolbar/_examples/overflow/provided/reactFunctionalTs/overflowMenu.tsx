import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IToolbarItemParams } from 'ag-grid-community';

export default (props: IToolbarItemParams) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const actions = useMemo(
        () => [
            { label: 'Column Chooser', action: () => props.api.showColumnChooser() },
            { label: 'Auto Size Columns', action: () => props.api.autoSizeAllColumns() },
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
            { label: 'Export CSV', action: () => props.api.exportDataAsCsv() },
            { label: 'Export Excel', action: () => props.api.exportDataAsExcel() },
            { label: 'Reset Columns', action: () => props.api.resetColumnState() },
        ],
        [props.api]
    );

    const getVisibleItems = useCallback((): HTMLElement[] => {
        if (!menuRef.current) return [];
        return Array.from(menuRef.current.querySelectorAll<HTMLElement>('.overflow-menu-item')).filter(
            (el) => getComputedStyle(el).display !== 'none'
        );
    }, []);

    const closeMenu = useCallback(() => setIsOpen(false), []);

    const openMenu = useCallback(() => {
        setIsOpen(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        // Focus first visible item after render
        const items = getVisibleItems();
        items[0]?.focus();

        const listener = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                closeMenu();
            }
        };
        document.addEventListener('click', listener);
        return () => document.removeEventListener('click', listener);
    }, [isOpen, closeMenu, getVisibleItems]);

    const handleButtonKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openMenu();
            }
        },
        [openMenu]
    );

    const handleMenuKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const items = getVisibleItems();
            const currentIndex = items.indexOf(e.target as HTMLElement);

            switch (e.key) {
                case 'ArrowDown': {
                    e.preventDefault();
                    const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    items[next].focus();
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    items[prev].focus();
                    break;
                }
                case 'Home': {
                    e.preventDefault();
                    items[0]?.focus();
                    break;
                }
                case 'End': {
                    e.preventDefault();
                    items[items.length - 1]?.focus();
                    break;
                }
                case 'Escape': {
                    e.preventDefault();
                    closeMenu();
                    buttonRef.current?.focus();
                    break;
                }
                case 'Enter':
                case ' ': {
                    e.preventDefault();
                    (e.target as HTMLElement).click();
                    break;
                }
            }
        },
        [closeMenu, getVisibleItems]
    );

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
        <div ref={wrapperRef} className="ag-toolbar-item overflow-menu-wrapper" style={{ position: 'relative' }}>
            <button
                ref={buttonRef}
                className="ag-toolbar-button"
                title="More actions"
                aria-label="More actions"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => (isOpen ? closeMenu() : openMenu())}
                onKeyDown={handleButtonKeyDown}
            >
                ☰
            </button>
            <div ref={menuRef} className="overflow-menu" role="menu" style={menuStyle} onKeyDown={handleMenuKeyDown}>
                {actions.map((item) => (
                    <div
                        key={item.label}
                        className="overflow-menu-item"
                        role="menuitem"
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
