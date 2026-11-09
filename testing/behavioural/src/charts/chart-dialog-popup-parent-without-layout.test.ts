import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill, mockGridLayout } from 'ag-test-utils';
import { installMockResizeObserver, triggerResizeObservers } from 'ag-test-utils/polyfills/mockResizeObserver';

import type { ChartCreated, GridApi, PostProcessPopupParams } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

describe('chart dialog when the popup parent has no layout', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    let popupParent: HTMLElement;
    let uninstallResizeObserver: () => void;
    let consoleError: ReturnType<typeof vi.spyOn>;
    const offsetParentDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')!;

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());

    beforeEach(() => {
        mockGridLayout.useRealOffsetDimensions = true;
        uninstallResizeObserver = installMockResizeObserver();
        consoleError = vi.spyOn(console, 'error');
        popupParent = document.createElement('div');
        document.body.appendChild(popupParent);
    });

    afterEach(() => {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParentDescriptor);
        gridsManager.reset();
        popupParent.remove();
        uninstallResizeObserver();
        consoleError.mockRestore();
        mockGridLayout.useRealOffsetDimensions = false;
    });

    function setPopupParentSize(width: number, height: number) {
        popupParent.style.width = `${width}px`;
        popupParent.style.height = `${height}px`;
        Object.defineProperty(popupParent, 'clientWidth', { configurable: true, value: width });
        Object.defineProperty(popupParent, 'clientHeight', { configurable: true, value: height });
        const popupWrapper = popupParent.querySelector<HTMLElement>('.ag-popup');
        if (popupWrapper) {
            popupWrapper.style.width = `${width}px`;
            popupWrapper.style.height = `${height}px`;
        }
    }

    function hideDocument() {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', { configurable: true, get: () => null });
    }

    function showDocument() {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParentDescriptor);
    }

    async function createChart(
        onChartCreated?: (event: ChartCreated) => void,
        postProcessPopup?: (params: PostProcessPopupParams) => void
    ): Promise<GridApi> {
        const api = await gridsManager.createGridAndWait('chartDialogGrid', {
            popupParent,
            cellSelection: true,
            columnDefs: [
                { field: 'month', chartDataType: 'category' },
                { field: 'sunshine', chartDataType: 'series' },
            ],
            rowData: [
                { month: 'Jan', sunshine: 1 },
                { month: 'Feb', sunshine: 2 },
            ],
            onChartCreated,
            postProcessPopup,
        });
        api.createRangeChart({
            cellRange: { rowStartIndex: 0, rowEndIndex: 1, columns: ['month', 'sunshine'] },
            chartType: 'groupedColumn',
        });
        return api;
    }

    function dialogSize() {
        const dialog = popupParent.querySelector<HTMLElement>('.ag-dialog')!;
        return { width: dialog.style.width, height: dialog.style.height };
    }

    function deliverResize() {
        triggerResizeObservers(popupParent);
    }

    test('a chart created in a hidden document initialises, and is sized once the document is shown', async () => {
        setPopupParentSize(0, 0);
        hideDocument();
        const chartCreated = vi.fn();

        await createChart(chartCreated);

        expect(consoleError).not.toHaveBeenCalled();
        await waitFor(() => expect(chartCreated).toHaveBeenCalledTimes(1));
        expect(popupParent.querySelector('.ag-chart-menu')).toBeTruthy();

        showDocument();
        setPopupParentSize(1200, 800);
        deliverResize();

        await waitFor(() => expect(dialogSize()).toEqual({ width: '850px', height: '470px' }));

        const titleBar = popupParent.querySelector<HTMLElement>('.ag-panel-title-bar')!;
        titleBar.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }));
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 140, clientY: 130 }));
        await waitFor(() => expect(popupParent.querySelector('.ag-moving')).toBeTruthy());
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 140, clientY: 130 }));

        expect(dialogSize()).toEqual({ width: '850px', height: '470px' });
    });

    test('postProcessPopup runs for the chart dialog once a dialog created in a hidden document is centred', async () => {
        setPopupParentSize(0, 0);
        hideDocument();
        const postProcessPopup = vi.fn();

        await createChart(undefined, postProcessPopup);

        showDocument();
        setPopupParentSize(1200, 800);
        deliverResize();

        await waitFor(() => expect(dialogSize()).toEqual({ width: '850px', height: '470px' }));
        const dialog = popupParent.querySelector<HTMLElement>('.ag-dialog');
        expect(postProcessPopup).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'chart', ePopup: dialog }));
    });

    test('a padded popup parent with an empty content box sizes the dialog once its content box has room', async () => {
        popupParent.style.padding = '16px';
        setPopupParentSize(32, 32);

        await createChart();

        deliverResize();
        const collapsed = dialogSize();

        setPopupParentSize(1200, 800);
        deliverResize();

        expect(collapsed).not.toEqual({ width: '850px', height: '470px' });
        await waitFor(() => expect(dialogSize()).toEqual({ width: '850px', height: '470px' }));
    });

    test('a smaller popup parent caps the deferred dialog size at 75% of the parent', async () => {
        popupParent.style.padding = '16px';
        setPopupParentSize(32, 32);

        await createChart();

        setPopupParentSize(800, 600);
        deliverResize();

        await waitFor(() => expect(dialogSize()).toEqual({ width: '600px', height: '332px' }));
    });

    test('a popup parent with layout at creation gives the dialog its final size without observing it', async () => {
        setPopupParentSize(1200, 800);
        const observed = vi.spyOn(window.ResizeObserver.prototype, 'observe');

        await createChart();

        expect(dialogSize()).toEqual({ width: '850px', height: '470px' });
        expect(observed.mock.calls.some(([element]) => element === popupParent)).toBe(false);
    });
});
