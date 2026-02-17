import { getByTestId } from '@testing-library/dom';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, agTestIdFor, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import {
    TestGridsManager,
    assertSelectedCellRanges,
    asyncSetTimeout,
    mockGridLayout,
    waitForEvent,
} from '../test-utils';
import { initPointerEventPolyfill } from '../test-utils/polyfills/pointerEvent';
import {
    cleanupShadowDomEventRetargeting,
    initShadowDomEventRetargeting,
} from '../test-utils/polyfills/shadowDomEventRetargeting';

/**
 * Tests for verifying AG Grid cell selection works correctly when inside Shadow DOM.
 *
 * When AG Grid is placed inside a Shadow DOM (e.g., via Angular's ViewEncapsulation.ShadowDom),
 * event.target can be retargeted to the shadow host when events cross shadow boundaries.
 * These tests verify that cell selection and interactions work correctly in this scenario.
 */
describe('AG Grid in Shadow DOM', () => {
    let shadowHost: HTMLElement;
    let shadowRoot: ShadowRoot;
    let gridContainer: HTMLElement;
    let api: GridApi | null = null;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule],
        mockGridLayout: false, // We handle grid layout ourselves in beforeAll
    });

    beforeAll(() => {
        mockGridLayout.init();
        initPointerEventPolyfill();
        initShadowDomEventRetargeting();
        setupAgTestIds();
    });

    afterAll(() => {
        cleanupShadowDomEventRetargeting();
    });

    beforeEach(() => {
        gridMgr.reset();

        // Create shadow DOM host
        shadowHost = document.createElement('div');
        shadowHost.id = 'shadow-host';
        document.body.appendChild(shadowHost);

        // Attach shadow root
        shadowRoot = shadowHost.attachShadow({ mode: 'open' });

        // Create grid container inside shadow root
        gridContainer = document.createElement('div');
        gridContainer.id = 'grid-container';
        gridContainer.style.width = '500px';
        gridContainer.style.height = '300px';
        shadowRoot.appendChild(gridContainer);
    });

    afterEach(() => {
        gridMgr.reset();
        if (shadowHost.parentNode) {
            shadowHost.remove();
        }
    });

    const createGridInShadowDom = async (options?: Partial<GridOptions>): Promise<GridApi> => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'id', headerName: 'ID' },
                { field: 'name', headerName: 'Name' },
                { field: 'value', headerName: 'Value' },
            ],
            rowData: [
                { id: 'A', name: 'Row A', value: 100 },
                { id: 'B', name: 'Row B', value: 200 },
                { id: 'C', name: 'Row C', value: 300 },
            ],
            cellSelection: true,
            getRowId: (params) => params.data.id,
            ...options,
        };

        api = gridMgr.createGrid(gridContainer, gridOptions);

        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(1);
        return api;
    };

    test('grid renders correctly inside Shadow DOM', async () => {
        await createGridInShadowDom();

        expect(api!.getDisplayedRowCount()).toBe(3);

        // Verify cells are rendered inside shadow DOM
        const cells = shadowRoot.querySelectorAll('.ag-cell');
        expect(cells.length).toBeGreaterThan(0);
    });

    test('clicking a cell inside Shadow DOM selects it', async () => {
        await createGridInShadowDom();

        // Get cell using test ID within shadow root
        const cell = getByTestId(gridContainer, agTestIdFor.cell('A', 'name'));
        expect(cell).toBeTruthy();

        // Use touchstart like other cell-selection tests do (because jsdom attaches touchstart, not mousedown)
        const cellSelectionChanged = waitForEvent('cellSelectionChanged', api!);
        cell.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));

        await cellSelectionChanged;
        await asyncSetTimeout(1);

        // Verify selection
        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 0, columns: ['name'] }], api!);
    });

    test('clicking different cells inside Shadow DOM updates selection', async () => {
        await createGridInShadowDom();

        // Click first cell
        const cell1 = getByTestId(gridContainer, agTestIdFor.cell('A', 'name'));
        let cellSelectionChanged = waitForEvent('cellSelectionChanged', api!);
        cell1.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));
        await cellSelectionChanged;
        await asyncSetTimeout(1);

        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 0, columns: ['name'] }], api!);

        // Click different cell
        const cell2 = getByTestId(gridContainer, agTestIdFor.cell('B', 'value'));
        cellSelectionChanged = waitForEvent('cellSelectionChanged', api!);
        cell2.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));
        await cellSelectionChanged;
        await asyncSetTimeout(1);

        assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 1, columns: ['value'] }], api!);
    });
});
