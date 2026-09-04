import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

const OPEN_MENU_CLASS = 'ag-has-menu-open';

interface TestPointer {
    target: HTMLElement;
    pointerId: number;
    clientX: number;
    clientY: number;
}

function dispatchPointerEvent(
    target: EventTarget,
    type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel' | 'click',
    pointer: TestPointer,
    pointerType: '' | 'mouse' | 'touch',
    detail = 1,
    button = 0
): PointerEvent {
    const event = new Event(type, { bubbles: true, cancelable: true, composed: true }) as PointerEvent;
    Object.defineProperties(event, {
        pointerId: { value: pointer.pointerId },
        pointerType: { value: pointerType },
        isPrimary: { value: true },
        clientX: { value: pointer.clientX },
        clientY: { value: pointer.clientY },
        detail: { value: detail },
        button: { value: button },
    });
    target.dispatchEvent(event);
    return event;
}

function mousePointerDown(element: HTMLElement, button: number = 0): PointerEvent {
    const pointer = { target: element, pointerId: 1, clientX: 5, clientY: 5 };
    const event = dispatchPointerEvent(element, 'pointerdown', pointer, 'mouse', 1, button);
    if (!event.defaultPrevented) {
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button }));
    }
    return event;
}

function mouseClick(element: HTMLElement, detail: number): void {
    const pointer = { target: element, pointerId: detail === 0 ? -1 : 1, clientX: 5, clientY: 5 };
    dispatchPointerEvent(element, 'click', pointer, detail === 0 ? '' : 'mouse', detail);
}

function touchStart(element: HTMLElement, pointerId = 1): TestPointer {
    const pointer = { target: element, pointerId, clientX: 5, clientY: 5 };
    dispatchPointerEvent(element, 'pointerdown', pointer, 'touch');
    return pointer;
}

function touchEnd(pointer: TestPointer, emitClick = true): void {
    dispatchPointerEvent(document, 'pointerup', pointer, 'touch');
    if (emitClick) {
        dispatchPointerEvent(pointer.target, 'click', pointer, 'touch');
    }
}

function touchCancel(pointer: TestPointer): void {
    dispatchPointerEvent(document, 'pointercancel', pointer, 'touch');
}

describe('column header popup toggle buttons (AG-16350)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, ColumnMenuModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createGrid(gridId: string, gridOptions: GridOptions): Promise<HTMLElement> {
        const api: GridApi = await gridsManager.createGridAndWait(gridId, gridOptions);
        return TestGridsManager.getHTMLElement(api)!;
    }

    const buttonCases: [string, string, GridOptions][] = [
        ['column menu', '.ag-header-cell-menu-button', { columnDefs: [{ field: 'athlete' }] }],
        ['header filter', '.ag-header-cell-filter-button', { columnDefs: [{ field: 'athlete', filter: true }] }],
        [
            'floating filter',
            '.ag-floating-filter-button-button',
            { columnDefs: [{ field: 'athlete', filter: true, floatingFilter: true }] },
        ],
    ];

    test.each(buttonCases)(
        '%s toggles on primary pointerdown and ignores the following mouse click',
        async (_, selector, options) => {
            const visibilityEvents: boolean[] = [];
            const eGridDiv = await createGrid(`mouse-${selector}`, {
                ...options,
                rowData: [{ athlete: 'Michael Phelps' }],
                suppressMenuHide: true,
                onColumnMenuVisibleChanged: (event) => visibilityEvents.push(event.visible),
            });
            const button = eGridDiv.querySelector<HTMLElement>(selector)!;

            const openEvent = mousePointerDown(button);
            expect(openEvent.defaultPrevented).toBe(true);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
            expect(button.classList.contains(OPEN_MENU_CLASS)).toBe(true);
            if (selector === '.ag-header-cell-menu-button') {
                expect(document.querySelector('.ag-popup')?.contains(document.activeElement)).toBe(true);
            }

            mouseClick(button, 1);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
            expect(button.classList.contains(OPEN_MENU_CLASS)).toBe(true);

            const closeEvent = mousePointerDown(button);
            expect(closeEvent.defaultPrevented).toBe(false);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
            expect(button.classList.contains(OPEN_MENU_CLASS)).toBe(false);

            mouseClick(button, 1);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
            await asyncSetTimeout(0);
            expect(visibilityEvents).toEqual([true, false]);
        }
    );

    test.each(buttonCases)(
        '%s supports keyboard clicks and lets middle pointerdown dismiss an open popup',
        async (_, selector, options) => {
            const eGridDiv = await createGrid(`keyboard-${selector}`, {
                ...options,
                rowData: [{ athlete: 'Michael Phelps' }],
                suppressMenuHide: true,
            });
            const button = eGridDiv.querySelector<HTMLElement>(selector)!;

            mousePointerDown(button, 1);
            mousePointerDown(button, 2);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);

            mouseClick(button, 0);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
            expect(button.classList.contains(OPEN_MENU_CLASS)).toBe(true);
            await asyncSetTimeout(0);
            mousePointerDown(button, 1);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
            expect(button.classList.contains(OPEN_MENU_CLASS)).toBe(false);

            mouseClick(button, 0);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
            mouseClick(button, 0);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
        }
    );

    test.each([
        [
            'column menu',
            '.ag-header-cell-menu-button',
            { columnDefs: [{ field: 'athlete' }] },
            { key: 'ArrowDown', altKey: true },
        ],
        [
            'header filter',
            '.ag-header-cell-filter-button',
            { columnDefs: [{ field: 'athlete', filter: true }] },
            { key: 'Enter', ctrlKey: true },
        ],
    ] as [string, string, GridOptions, KeyboardEventInit][])(
        '%s opened through its header shortcut closes on primary pointerdown',
        async (_, selector, options, keyboardEvent) => {
            const eGridDiv = await createGrid(`shortcut-${selector}`, {
                ...options,
                rowData: [{ athlete: 'Michael Phelps' }],
                suppressMenuHide: true,
            });
            const headerCell = eGridDiv.querySelector<HTMLElement>('.ag-header-cell')!;
            const button = eGridDiv.querySelector<HTMLElement>(selector)!;

            headerCell.focus();
            headerCell.dispatchEvent(
                new KeyboardEvent('keydown', { ...keyboardEvent, bubbles: true, cancelable: true })
            );
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
            expect(button.classList.contains(OPEN_MENU_CLASS)).toBe(true);

            mousePointerDown(button);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
            expect(button.classList.contains(OPEN_MENU_CLASS)).toBe(false);
        }
    );

    test.each(buttonCases)(
        '%s closes on a confirmed second touch tap, not on touchstart',
        async (_, selector, options) => {
            const eGridDiv = await createGrid(`touch-${selector}`, {
                ...options,
                rowData: [{ athlete: 'Michael Phelps' }],
                suppressMenuHide: true,
            });
            const button = eGridDiv.querySelector<HTMLElement>(selector)!;
            const touchTarget = (button.firstElementChild as HTMLElement | null) ?? button;

            let touch = touchStart(touchTarget);
            touchEnd(touch);
            await waitFor(() => expect(document.querySelectorAll('.ag-popup')).toHaveLength(1));

            touch = touchStart(touchTarget);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
            touchEnd(touch);
            expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
        }
    );

    test('suppresses header long press when the new menu context menu is disabled', async () => {
        const eGridDiv = await createGrid('suppressed-header-long-press', {
            columnDefs: [
                {
                    field: 'athlete',
                    suppressHeaderContextMenu: true,
                    suppressHeaderMenuButton: true,
                },
            ],
            rowData: [{ athlete: 'Michael Phelps' }],
        });
        const headerText = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-text')!;

        const touch = touchStart(headerText);
        await asyncSetTimeout(0);
        touchEnd(touch);

        expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
    });

    test('keeps long press as the legacy menu access path when its context menu is disabled', async () => {
        const eGridDiv = await createGrid('legacy-header-long-press', {
            columnDefs: [{ field: 'athlete', sortable: true, suppressHeaderContextMenu: true }],
            rowData: [{ athlete: 'Michael Phelps' }],
            columnMenu: 'legacy',
        });
        const headerText = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-text')!;

        const touch = touchStart(headerText);
        await waitFor(() => expect(document.querySelectorAll('.ag-popup')).toHaveLength(1));
        touchEnd(touch);

        expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
        expect(gridsManager.getGrid(eGridDiv)?.getColumn('athlete')?.getSort()).toBeUndefined();
    });

    test('suppressTouch disables the header long press', async () => {
        const eGridDiv = await createGrid('suppress-touch-header', {
            columnDefs: [{ field: 'athlete', suppressHeaderContextMenu: true }],
            rowData: [{ athlete: 'Michael Phelps' }],
            columnMenu: 'legacy',
            suppressTouch: true,
        });
        const headerText = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-text')!;

        const touch = touchStart(headerText);
        await asyncSetTimeout(0);
        touchEnd(touch);

        expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
    });

    test.each(['new', 'legacy'] as const)(
        'Escape restores focus to the floating-filter button with the %s column menu',
        async (columnMenu) => {
            const eGridDiv = await createGrid(`floating-filter-focus-${columnMenu}`, {
                columnDefs: [{ field: 'athlete', filter: true, floatingFilter: true }],
                rowData: [{ athlete: 'Michael Phelps' }],
                suppressMenuHide: true,
                columnMenu,
            });
            const button = eGridDiv.querySelector<HTMLElement>('.ag-floating-filter-button-button')!;

            mousePointerDown(button);
            expect(document.querySelector('.ag-popup')?.contains(document.activeElement)).toBe(true);
            // The popup registers its close-on-Escape document listener in a setTimeout(0), so the
            // Escape must be dispatched after that tick or it is ignored.
            await asyncSetTimeout(0);

            document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await asyncSetTimeout(0);

            expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
            expect(button.classList.contains(OPEN_MENU_CLASS)).toBe(false);
            expect(document.activeElement).toBe(button);
        }
    );

    test('moving or cancelling after touchstart does not toggle the popup', async () => {
        const eGridDiv = await createGrid('touch-move', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            suppressMenuHide: true,
        });
        const button = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-menu-button')!;
        const touchTarget = (button.firstElementChild as HTMLElement | null) ?? button;
        const touch = touchStart(touchTarget);
        const movedTouch = { ...touch, clientX: 50, clientY: 50 };

        dispatchPointerEvent(touchTarget, 'pointermove', movedTouch, 'touch');
        touchEnd(movedTouch, false);

        expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);

        touchCancel(touchStart(touchTarget));
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
    });

    test('switching triggers closes the old popup before opening the new one', async () => {
        const visibilityEvents: boolean[] = [];
        const eGridDiv = await createGrid('switch-trigger', {
            columnDefs: [{ field: 'athlete', filter: true }],
            rowData: [{ athlete: 'Michael Phelps' }],
            suppressMenuHide: true,
            onColumnMenuVisibleChanged: (event) => visibilityEvents.push(event.visible),
        });
        const menuButton = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-menu-button')!;
        const filterButton = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-filter-button')!;

        mousePointerDown(menuButton);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
        expect(menuButton.classList.contains(OPEN_MENU_CLASS)).toBe(true);
        expect(filterButton.classList.contains(OPEN_MENU_CLASS)).toBe(false);
        mousePointerDown(filterButton);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
        expect(menuButton.classList.contains(OPEN_MENU_CLASS)).toBe(false);
        expect(filterButton.classList.contains(OPEN_MENU_CLASS)).toBe(true);
        await asyncSetTimeout(0);
        expect(visibilityEvents).toEqual([true, false, true]);
        mousePointerDown(filterButton);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
        expect(filterButton.classList.contains(OPEN_MENU_CLASS)).toBe(false);
    });

    test('switching between triggers owned by the same menu factory closes the old popup first', async () => {
        const eGridDiv = await createGrid('switch-same-factory', {
            columnDefs: [
                { field: 'athlete', filter: true },
                { field: 'country', filter: true },
            ],
            rowData: [{ athlete: 'Michael Phelps', country: 'United States' }],
            suppressMenuHide: true,
        });
        const buttons = eGridDiv.querySelectorAll<HTMLElement>('.ag-header-cell-filter-button');

        mousePointerDown(buttons[0]);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
        mousePointerDown(buttons[1]);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
        mousePointerDown(buttons[1]);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
    });

    test('right-clicking an open trigger replaces the popup through the show-only context-menu path', async () => {
        const eGridDiv = await createGrid('context-menu-show', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            suppressMenuHide: true,
        });
        const button = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-menu-button')!;

        mousePointerDown(button);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
        // The popup registers its document mousedown listener in a setTimeout(0), so the right-click
        // must land after that tick for the close-then-reopen path to run.
        await asyncSetTimeout(0);

        mousePointerDown(button, 2);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);

        button.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
    });

    test('a declined open does not prevent the same trigger from retrying', async () => {
        let includeMenuItem = false;
        const eGridDiv = await createGrid('declined-open', {
            columnDefs: [
                {
                    field: 'athlete',
                    sortable: true,
                    mainMenuItems: () => (includeMenuItem ? ['sortAscending'] : []),
                },
            ],
            rowData: [{ athlete: 'Michael Phelps' }],
            suppressMenuHide: true,
        });
        const button = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-menu-button')!;

        expect(mousePointerDown(button).defaultPrevented).toBe(false);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);

        includeMenuItem = true;
        expect(mousePointerDown(button).defaultPrevented).toBe(true);
        expect(document.querySelectorAll('.ag-popup')).toHaveLength(1);
    });

    test('destroying the header removes pointer and click toggle listeners', async () => {
        const eGridDiv = await createGrid('listener-cleanup', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            suppressMenuHide: true,
        });
        const button = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-menu-button')!;

        gridsManager.reset();
        mousePointerDown(button);
        const touch = touchStart(button);
        touchEnd(touch);

        expect(document.querySelectorAll('.ag-popup')).toHaveLength(0);
    });
});
