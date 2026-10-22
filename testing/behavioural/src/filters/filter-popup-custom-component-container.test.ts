import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, fireGridPointerDown, polyfillOffsetParent } from 'ag-test-utils';

import type { GridApi, GridOptions, IDoesFilterPassParams, IFilterComp } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    TextEditorModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

const CUSTOM_POPUP_CLASS = 'ag-custom-component-popup';

const gridsManager = new TestGridsManager({
    modules: [
        ClientSideRowModelModule,
        TextFilterModule,
        CustomFilterModule,
        TextEditorModule,
        ColumnMenuModule,
        ContextMenuModule,
    ],
});

const createdElements: HTMLElement[] = [];
let restoreOffsetParent: (() => void) | undefined;

beforeEach(() => {
    restoreOffsetParent = polyfillOffsetParent();
});

afterEach(() => {
    gridsManager.reset();
    createdElements.forEach((el) => el.remove());
    createdElements.length = 0;
    restoreOffsetParent?.();
    restoreOffsetParent = undefined;
});

function appendDiv(parent: HTMLElement, className?: string): HTMLDivElement {
    const div = document.createElement('div');
    if (className) {
        div.classList.add(className);
    }
    parent.appendChild(div);
    if (parent === document.body) {
        createdElements.push(div);
    }
    return div;
}

function createContainer(withCustomPopupClass: boolean): HTMLDivElement {
    return appendDiv(document.body, withCustomPopupClass ? CUSTOM_POPUP_CLASS : undefined);
}

async function createGridIn(parent: HTMLElement, options: GridOptions): Promise<GridApi> {
    return gridsManager.createGridAndWait(appendDiv(parent), {
        columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
        rowData: [{ name: 'Alice' }, { name: 'Bob' }],
        ...options,
    });
}

function firstCell(api: GridApi): HTMLElement {
    const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell');
    expect(cell).not.toBeNull();
    return cell!;
}

function mouseDown(el: HTMLElement): void {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
}

async function waitForPopupListeners(): Promise<void> {
    await waitFor(() => expect(document.querySelector('.ag-popup')).not.toBeNull());
    // the popup's outside-click listeners are registered on the next tick
    await asyncSetTimeout(0);
}

async function openFilterInContainer(withCustomPopupClass: boolean) {
    const container = createContainer(withCustomPopupClass);
    const api = await createGridIn(container, {});
    api.showColumnFilter('name');
    await waitForPopupListeners();
    return { container, api };
}

describe('Filter popup of a grid inside an ag-custom-component-popup container', () => {
    test('closes on mousedown on a row cell of the same grid when the container has the class', async () => {
        const { api } = await openFilterInContainer(true);
        mouseDown(firstCell(api));
        expect(document.querySelector('.ag-popup')).toBeNull();
    });

    test('closes on mousedown on a row cell of the same grid when the container has no class (control)', async () => {
        const { api } = await openFilterInContainer(false);
        mouseDown(firstCell(api));
        expect(document.querySelector('.ag-popup')).toBeNull();
    });

    test('closes on mousedown on an empty area of the container', async () => {
        const { container } = await openFilterInContainer(true);
        mouseDown(container);
        expect(document.querySelector('.ag-popup')).toBeNull();
    });

    test('stays open on mousedown inside the filter popup', async () => {
        await openFilterInContainer(true);
        mouseDown(document.querySelector<HTMLElement>('.ag-popup .ag-filter')!);
        expect(document.querySelector('.ag-popup')).not.toBeNull();
    });

    test('closes on right-click on an empty area of the container', async () => {
        const { container } = await openFilterInContainer(true);
        container.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
        expect(document.querySelector('.ag-popup')).toBeNull();
    });
});

describe('Other popups and editing of a grid inside an ag-custom-component-popup container', () => {
    test('column menu closes on mousedown on a row cell of the same grid', async () => {
        const container = createContainer(true);
        const api = await createGridIn(container, {});
        api.showColumnMenu('name');
        await waitForPopupListeners();

        mouseDown(firstCell(api));

        expect(document.querySelector('.ag-popup')).toBeNull();
    });

    test('context menu closes on mousedown on an empty area of the container', async () => {
        const container = createContainer(true);
        const api = await createGridIn(container, { getContextMenuItems: () => [{ name: 'Item' }] });
        const cell = firstCell(api);
        fireGridPointerDown(cell, { button: 2, buttons: 2 });
        cell.dispatchEvent(
            new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
        );
        await waitForPopupListeners();

        mouseDown(container);

        expect(document.querySelector('.ag-popup')).toBeNull();
    });

    describe('stopEditingWhenCellsLoseFocus', () => {
        function moveFocusFromEditorTo(api: GridApi, target: HTMLElement): void {
            const input = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell-editor input, .ag-popup input');
            expect(input).not.toBeNull();
            input!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: target }));
        }

        function appendButton(parent: HTMLElement): HTMLButtonElement {
            const button = document.createElement('button');
            parent.appendChild(button);
            return button;
        }

        test('a grid inside the container stops editing when focus moves to a button elsewhere in the container', async () => {
            const container = createContainer(true);
            const button = appendButton(container);
            const api = await createGridIn(container, {
                columnDefs: [{ field: 'name', editable: true }],
                stopEditingWhenCellsLoseFocus: true,
            });
            api.startEditingCell({ rowIndex: 0, colKey: 'name' });
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));

            moveFocusFromEditorTo(api, button);

            expect(api.getEditingCells()).toHaveLength(0);
        });

        test('a grid outside the container keeps its popup editor open and keeps editing on clicks in the container', async () => {
            const gridA = await createGridIn(document.body, {
                columnDefs: [{ field: 'name', editable: true, cellEditorPopup: true }],
                stopEditingWhenCellsLoseFocus: true,
            });
            gridA.startEditingCell({ rowIndex: 0, colKey: 'name' });
            await waitForPopupListeners();
            expect(gridA.getEditingCells()).toHaveLength(1);

            const container = createContainer(true);
            const button = appendButton(container);
            const gridB = await createGridIn(container, {});

            mouseDown(container);
            mouseDown(firstCell(gridB));
            expect(getGridElement(gridA)!.querySelector('.ag-popup')).not.toBeNull();
            expect(gridA.getEditingCells()).toHaveLength(1);

            firstCell(gridA).dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: button }));
            expect(gridA.getEditingCells()).toHaveLength(1);
        });
    });

    describe("a custom filter's own floating element with the class", () => {
        let floatingParent: HTMLElement;
        let floating: HTMLElement | undefined;

        class FilterWithFloatingElement implements IFilterComp {
            private readonly eGui = document.createElement('div');

            getGui(): HTMLElement {
                return this.eGui;
            }

            afterGuiAttached(): void {
                floating = document.createElement('div');
                floating.classList.add(CUSTOM_POPUP_CLASS);
                floatingParent.appendChild(floating);
            }

            destroy(): void {
                floating?.remove();
                floating = undefined;
            }

            isFilterActive(): boolean {
                return false;
            }

            doesFilterPass(_params: IDoesFilterPassParams): boolean {
                return true;
            }

            getModel(): null {
                return null;
            }

            setModel(): void {}
        }

        async function openCustomFilter(gridParent: HTMLElement, parentOfFloating: HTMLElement): Promise<HTMLElement> {
            floatingParent = parentOfFloating;
            const api = await createGridIn(gridParent, {
                columnDefs: [{ field: 'name', filter: FilterWithFloatingElement }],
            });
            api.showColumnFilter('name');
            await waitForPopupListeners();
            await waitFor(() => expect(floating).toBeDefined());
            return floating!;
        }

        test('keeps the filter open on mousedown on a floating element appended to the body', async () => {
            const floating = await openCustomFilter(createContainer(false), document.body);

            mouseDown(floating);

            expect(document.querySelector('.ag-popup')).not.toBeNull();
        });

        test('keeps the filter open on mousedown on a floating element inside the same container as the grid', async () => {
            const container = createContainer(true);
            const floating = await openCustomFilter(container, container);

            mouseDown(floating);

            expect(document.querySelector('.ag-popup')).not.toBeNull();
        });
    });
});
