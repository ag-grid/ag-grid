import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    PaginationModule,
} from 'ag-grid-community';
import type { ProcessFileInputParams } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid overlay accessibility', () => {
    const clientSideGridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule, AutoGenerateColumnsModule],
    });
    const infiniteGridsManager = new TestGridsManager({
        modules: [InfiniteRowModelModule],
    });
    const serverSideGridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }];

    beforeEach(() => {
        vitest.useFakeTimers();
        clientSideGridsManager.reset();
        infiniteGridsManager.reset();
        serverSideGridsManager.reset();
    });

    afterEach(() => {
        clientSideGridsManager.reset();
        infiniteGridsManager.reset();
        serverSideGridsManager.reset();
        vitest.clearAllTimers();
        vitest.useRealTimers();
    });

    async function flushOverlayAnnouncement(delay = 550): Promise<void> {
        await Promise.resolve();
        await vitest.advanceTimersByTimeAsync(delay);
        await Promise.resolve();
    }

    function getLiveRegion(): HTMLElement {
        const eLiveRegion = document.querySelector<HTMLElement>('.ag-overlay-live-region');
        expect(eLiveRegion).toBeTruthy();
        return eLiveRegion!;
    }

    function getOverlayWrapper(): HTMLElement {
        const eOverlayWrapper = document.querySelector<HTMLElement>('.ag-overlay-wrapper');
        expect(eOverlayWrapper).toBeTruthy();
        return eOverlayWrapper!;
    }

    function getGridViewport(): HTMLElement {
        const eGridViewport = document.querySelector<HTMLElement>('.ag-grid-viewport');
        expect(eGridViewport).toBeTruthy();
        return eGridViewport!;
    }

    function createFileDropEvent(fileName: string): DragEvent {
        const event = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent;
        Object.defineProperty(event, 'dataTransfer', {
            value: {
                types: ['Files'],
                files: [new File(['file contents'], fileName)],
            },
        });
        return event;
    }

    test('loading overlay is visually immediate but live-region announcement is debounced', async () => {
        clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            rowData: [{ athlete: 'Michael Phelps' }],
        });

        expect(isAgHtmlElementVisible('.ag-overlay-loading-wrapper')).toBe(true);
        expect(getGridViewport().getAttribute('aria-busy')).toBe('true');
        expect(getLiveRegion().textContent).toBe('');

        await flushOverlayAnnouncement(499);
        expect(getLiveRegion().textContent).toBe('');

        await flushOverlayAnnouncement(51);
        expect(getLiveRegion().textContent).toBe('Loading...');
    });

    test('transient loading overlay does not announce loading or completion', async () => {
        const api = clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            rowData: [{ athlete: 'Michael Phelps' }],
        });

        api.setGridOption('loading', false);

        await flushOverlayAnnouncement();

        expect(getGridViewport().hasAttribute('aria-busy')).toBe(false);
        expect(getLiveRegion().textContent).toBe('');
    });

    test('stable loading overlay announces one completion message when data loads', async () => {
        const api = clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            rowData: [],
        });

        await flushOverlayAnnouncement();
        expect(getLiveRegion().textContent).toBe('Loading...');

        api.setGridOption('rowData', [{ athlete: 'Michael Phelps' }, { athlete: 'Usain Bolt' }]);
        api.setGridOption('loading', false);

        await flushOverlayAnnouncement(50);

        expect(getGridViewport().hasAttribute('aria-busy')).toBe(false);
        expect(getLiveRegion().textContent).toBe('Data loaded. 2 rows');
    });

    test('pagination completion message includes row and page status', async () => {
        const api = clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            pagination: true,
            paginationPageSize: 2,
            paginationPageSizeSelector: false,
            rowData: [{ athlete: 'Michael Phelps' }, { athlete: 'Usain Bolt' }, { athlete: 'Ariarne Titmus' }],
        });

        await flushOverlayAnnouncement();

        api.setGridOption('loading', false);

        await flushOverlayAnnouncement(50);

        expect(getLiveRegion().textContent).toBe('Data loaded. 1 to 2 of 3. Page 1 of 2');
    });

    test('unknown row count completion message uses more rows fallback', async () => {
        const api = infiniteGridsManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'infinite',
            loading: true,
            datasource: {
                getRows: (params) => params.successCallback([{ athlete: 'Michael Phelps' }]),
            },
        });

        await flushOverlayAnnouncement();
        expect(getLiveRegion().textContent).toBe('Loading...');

        api.setGridOption('loading', false);

        await flushOverlayAnnouncement(50);

        expect(getLiveRegion().textContent).toBe('Data loaded. more rows');
    });

    test('no-rows overlay announces once from the live region', async () => {
        clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
        });

        expect(getOverlayWrapper().getAttribute('role')).toBe('presentation');
        expect(getOverlayWrapper().hasAttribute('aria-live')).toBe(false);
        expect(getLiveRegion().getAttribute('role')).toBe('status');
        expect(getLiveRegion().getAttribute('aria-live')).toBe('polite');
        expect(getLiveRegion().getAttribute('aria-atomic')).toBe('true');

        await flushOverlayAnnouncement();

        expect(getLiveRegion().textContent).toBe('No Rows To Show');
    });

    test('suppressed no-rows overlay does not announce', async () => {
        clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
            suppressNoRowsOverlay: true,
        });

        await flushOverlayAnnouncement();

        expect(isAgHtmlElementVisible('.ag-overlay-no-rows-wrapper')).toBe(false);
        expect(getOverlayWrapper().getAttribute('role')).toBe('presentation');
        expect(getLiveRegion().textContent).toBe('');
    });

    test('custom no-rows overlay text from params is announced after refresh debounce', async () => {
        const api = clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
            noRowsOverlayComponent: CustomNoRowsOverlay,
            noRowsOverlayComponentParams: { message: 'Initial empty state' },
        });

        await flushOverlayAnnouncement();
        expect(getLiveRegion().textContent).toBe('Initial empty state');

        api.setGridOption('noRowsOverlayComponentParams', { message: 'Updated empty state' });

        expect(getLiveRegion().textContent).toBe('');
        await flushOverlayAnnouncement();
        expect(getLiveRegion().textContent).toBe('Updated empty state');
    });

    test('exporting overlay announces through the live region', async () => {
        clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ athlete: 'Michael Phelps' }],
            activeOverlay: 'agExportingOverlay',
            overlayComponentParams: { exporting: { overlayText: 'Preparing export' } },
        });

        expect(isAgHtmlElementVisible('.ag-overlay-exporting-wrapper')).toBe(true);
        expect(getLiveRegion().textContent).toBe('');

        await flushOverlayAnnouncement();

        expect(getLiveRegion().textContent).toBe('Preparing export');
    });

    test('file-input overlay announces ready and processing states through the live region', async () => {
        clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: null as any,
            processFileInput: () => {},
            overlayComponentParams: { fileInput: { overlayText: 'Drop CSV here' } },
        });

        expect(isAgHtmlElementVisible('.ag-overlay-file-input-wrapper')).toBe(true);
        expect(document.querySelector('.ag-overlay-file-input-center')!.hasAttribute('aria-label')).toBe(false);
        await flushOverlayAnnouncement();
        expect(getLiveRegion().textContent).toBe('Drop CSV here');

        getOverlayWrapper()
            .querySelector<HTMLElement>('.ag-overlay-file-input-center')!
            .dispatchEvent(createFileDropEvent('athletes.csv'));

        await Promise.resolve();
        expect(getLiveRegion().textContent).toBe('');
        await flushOverlayAnnouncement();
        expect(getLiveRegion().textContent).toBe('Processing athletes.csv');
    });

    test('file-input overlay announces only the error text after processing fails', async () => {
        let capturedParams: ProcessFileInputParams | undefined;
        clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: null as any,
            processFileInput: (params) => {
                capturedParams = params;
            },
            overlayComponentParams: { fileInput: { overlayText: 'Drop CSV here' } },
        });

        await flushOverlayAnnouncement();
        expect(getLiveRegion().textContent).toBe('Drop CSV here');

        getOverlayWrapper()
            .querySelector<HTMLElement>('.ag-overlay-file-input-center')!
            .dispatchEvent(createFileDropEvent('athletes.csv'));
        capturedParams!.fail('Custom error message');

        await Promise.resolve();
        expect(getLiveRegion().textContent).toBe('');
        await flushOverlayAnnouncement();
        expect(getLiveRegion().textContent).toBe('Custom error message');
    });

    test('overlay remains outside the grid role element', () => {
        clientSideGridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
        });

        const eGrid = document.querySelector<HTMLElement>('[role="grid"]');
        expect(eGrid).toBeTruthy();
        expect(eGrid!.querySelector('.ag-overlay')).toBeNull();
        expect(document.querySelector('.ag-root')!.querySelector('.ag-overlay')).toBeTruthy();
    });

    test('infinite row model no-rows overlay announces through the live region', async () => {
        infiniteGridsManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'infinite',
            datasource: {
                getRows: (params) => params.successCallback([], 0),
            },
        });

        await flushOverlayAnnouncement();

        expect(getLiveRegion().textContent).toBe('No Rows To Show');
    });

    test('server-side row model no-rows overlay announces through the live region', async () => {
        vitest.useRealTimers();
        let finishLoadData!: () => void;
        const loadPromise = new Promise<void>((resolve) => {
            finishLoadData = resolve;
        });

        serverSideGridsManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [], rowCount: 0 });
                    finishLoadData();
                },
            },
        });

        await loadPromise;
        await new Promise((resolve) => setTimeout(resolve, 600));

        expect(getLiveRegion().textContent).toBe('No Rows To Show');
    });
});

class CustomNoRowsOverlay {
    private readonly eGui = document.createElement('div');

    public init(params: { message: string }): void {
        this.refresh(params);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: { message: string }): void {
        this.eGui.textContent = params.message;
    }
}
