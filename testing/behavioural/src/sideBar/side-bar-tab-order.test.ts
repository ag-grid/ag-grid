import { TestGridsManager } from 'ag-test-utils';

import type { GridOptions, ToolPanelDef } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('side bar Tab order', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    const columnsPanel: ToolPanelDef = {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
    };
    const filtersPanel: ToolPanelDef = {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
    };

    async function createGrid(options: GridOptions = {}) {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete', filter: true }],
            rowData: [{ athlete: 'Michael Phelps' }],
            sideBar: { toolPanels: [columnsPanel, filtersPanel], defaultToolPanel: 'columns' },
            ...options,
        });
        const gridEl = getGridElement(api)! as HTMLElement;
        const sideButtons = gridEl.querySelector<HTMLElement>('.ag-side-buttons')!;
        const [columnsButton, filtersButton] = Array.from(
            sideButtons.querySelectorAll<HTMLButtonElement>('.ag-side-button-button')
        );
        const columnsPanelEl = gridEl.querySelector<HTMLElement>('.ag-tool-panel-wrapper')!;
        return { api, sideButtons, columnsButton, filtersButton, columnsPanelEl };
    }

    const isAfter = (el: HTMLElement, other: HTMLElement) =>
        !!(other.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    const pressTab = (el: HTMLElement, shiftKey = false) =>
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true }));

    describe('the buttons sit where they are drawn', () => {
        test('after the tool panels with the side bar on the right', async () => {
            const { sideButtons, columnsPanelEl } = await createGrid();

            expect(isAfter(sideButtons, columnsPanelEl)).toBe(true);
        });

        test('before the tool panels with the side bar on the left', async () => {
            const { sideButtons, columnsPanelEl } = await createGrid({
                sideBar: { toolPanels: [columnsPanel, filtersPanel], defaultToolPanel: 'columns', position: 'left' },
            });

            expect(isAfter(columnsPanelEl, sideButtons)).toBe(true);
        });

        test('before the tool panels with enableRtl, which draws the side bar on the left', async () => {
            const { sideButtons, columnsPanelEl } = await createGrid({ enableRtl: true });

            expect(isAfter(columnsPanelEl, sideButtons)).toBe(true);
        });

        test('and move to the other side when the side bar moves', async () => {
            const { api, sideButtons, columnsPanelEl } = await createGrid();

            api.setSideBarPosition('left');
            expect(isAfter(columnsPanelEl, sideButtons)).toBe(true);

            api.setSideBarPosition('right');
            expect(isAfter(sideButtons, columnsPanelEl)).toBe(true);
        });

        test('and stay put, keeping focus, when the position is set to the one it has', async () => {
            const { api, columnsButton } = await createGrid();
            columnsButton.focus();

            api.setSideBarPosition('right');

            expect(columnsButton.ownerDocument.activeElement).toBe(columnsButton);
        });

        test('after a tool panel that comes back from an external parent', async () => {
            const { api, sideButtons, columnsPanelEl } = await createGrid();
            const externalParent = document.createElement('div');
            document.body.appendChild(externalParent);

            api.openToolPanel('columns', externalParent);
            api.openToolPanel('columns');

            expect(isAfter(sideButtons, columnsPanelEl)).toBe(true);
            externalParent.remove();
        });
    });

    describe('the buttons are one Tab stop', () => {
        test('the open panel button, as arrow keys move between them', async () => {
            const { api, columnsButton, filtersButton } = await createGrid();
            expect(columnsButton.getAttribute('tabindex')).toBe('0');
            expect(filtersButton.getAttribute('tabindex')).toBe('-1');

            api.openToolPanel('filters');

            expect(columnsButton.getAttribute('tabindex')).toBe('-1');
            expect(filtersButton.getAttribute('tabindex')).toBe('0');
        });

        test('the first button while no panel is open', async () => {
            const { api, columnsButton, filtersButton } = await createGrid();
            api.openToolPanel('filters');

            api.closeToolPanel();

            expect(columnsButton.getAttribute('tabindex')).toBe('0');
            expect(filtersButton.getAttribute('tabindex')).toBe('-1');
        });

        test('with the grid tabIndex', async () => {
            const { columnsButton } = await createGrid({ tabIndex: 3 });

            expect(columnsButton.getAttribute('tabindex')).toBe('3');
        });
    });

    describe('Tab from the open panel button', () => {
        test('with the side bar on the right, Shift+Tab moves into the panel before it', async () => {
            const { columnsButton, columnsPanelEl } = await createGrid();
            columnsButton.focus();

            pressTab(columnsButton, true);

            expect(columnsPanelEl.contains(document.activeElement)).toBe(true);
        });

        test('with the side bar on the left, Tab moves into the panel after it', async () => {
            const { columnsButton, columnsPanelEl } = await createGrid({
                sideBar: { toolPanels: [columnsPanel, filtersPanel], defaultToolPanel: 'columns', position: 'left' },
            });
            columnsButton.focus();

            pressTab(columnsButton);

            expect(columnsPanelEl.contains(document.activeElement)).toBe(true);
        });
    });
});
