import { ClientSideRowModelModule, LocaleModule, PaginationModule, TextFilterModule } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

const WRAPPER_STATUS_SELECTOR = '.ag-overlay-wrapper [role="status"]';
const GLOBAL_STATUS_SELECTOR = '.ag-root-wrapper > .ag-aria-description-container';

describe('ag-grid overlay aria status', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, LocaleModule, PaginationModule, TextFilterModule],
    });
    const columnDefs = [{ field: 'athlete', filter: true }, { field: 'sport' }];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    function getGridViewport(): HTMLElement {
        return document.querySelector<HTMLElement>(
            '.ag-grid-viewport[role="grid"], .ag-grid-viewport[role="treegrid"]'
        )!;
    }

    function getWrapperStatus(): string {
        return document.querySelector<HTMLElement>(WRAPPER_STATUS_SELECTOR)?.textContent ?? '';
    }

    function getGlobalStatus(): string {
        return document.querySelector<HTMLElement>(GLOBAL_STATUS_SELECTOR)?.textContent ?? '';
    }

    async function advanceOverlayStatusTimers(ms: number): Promise<void> {
        await vitest.advanceTimersByTimeAsync(ms);
    }

    test('no rows overlay carries its own role=status outside the grid role', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
            overlayComponentParams: {
                noRows: { overlayText: 'Nothing here' },
            },
        });

        const gridViewport = getGridViewport();
        const overlay = document.querySelector<HTMLElement>('.ag-overlay')!;
        const status = document.querySelector<HTMLElement>('.ag-overlay-no-rows-center')!;

        expect(gridViewport).toHaveAttribute('role', 'grid');
        expect(gridViewport).not.toHaveAttribute('aria-busy');
        expect(gridViewport.querySelector('.ag-overlay')).toBeNull();
        expect(isAgHtmlElementVisible(overlay)).toBe(true);
        expect(status).toHaveAttribute('role', 'status');
        expect(status.textContent).toBe('Nothing here');
        expect(document.querySelector('.ag-overlay .ag-aria-description-container')).toBeNull();
        expect(getGlobalStatus()).toBe('');
    });

    test('no matching rows overlay announces via its own role=status without leaving the grid busy', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [
                { athlete: 'Michael Phelps', sport: 'Swimming' },
                { athlete: 'Emma Thompson', sport: 'Tennis' },
            ],
            overlayComponentParams: {
                noMatchingRows: { overlayText: 'No filter matches' },
            },
        });

        api.setFilterModel({
            athlete: {
                filterType: 'text',
                type: 'startsWith',
                filter: 'Test',
            },
        });

        const status = document.querySelector<HTMLElement>('.ag-overlay-no-matching-rows-center')!;
        expect(status).toHaveAttribute('role', 'status');
        expect(status.textContent).toBe('No filter matches');
        expect(getGridViewport()).not.toHaveAttribute('aria-busy');
        expect(getGlobalStatus()).toBe('');
    });

    test('loading status is debounced on the overlay live region and paired with completion', async () => {
        vitest.useFakeTimers();

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            rowData: [{ athlete: 'One' }, { athlete: 'Two' }],
        });

        expect(getGridViewport()).toHaveAttribute('aria-busy', 'true');
        expect(getWrapperStatus()).toBe('');
        await advanceOverlayStatusTimers(249);
        expect(getWrapperStatus()).toBe('');
        expect(getGlobalStatus()).toBe('');

        await advanceOverlayStatusTimers(1);
        expect(getWrapperStatus()).toBe('Loading...');
        expect(getGlobalStatus()).toBe('');

        api.setGridOption('loading', false);
        expect(getGridViewport()).not.toHaveAttribute('aria-busy');
        expect(getWrapperStatus()).toBe('Data loaded. 2 rows.');
        expect(getGlobalStatus()).toBe('');

        await advanceOverlayStatusTimers(50);
        expect(isAgHtmlElementVisible('.ag-overlay')).toBe(false);
    });

    test('fast loading clears without orphaned start or completion announcements', async () => {
        vitest.useFakeTimers();

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            rowData: [{ athlete: 'One' }, { athlete: 'Two' }],
        });

        expect(getGridViewport()).toHaveAttribute('aria-busy', 'true');

        api.setGridOption('loading', false);
        expect(getGridViewport()).not.toHaveAttribute('aria-busy');

        await advanceOverlayStatusTimers(300);
        expect(getWrapperStatus()).toBe('');
        expect(getGlobalStatus()).toBe('');
        expect(isAgHtmlElementVisible('.ag-overlay')).toBe(false);
    });

    test('loading completion prefers pagination summary when pagination is active', async () => {
        vitest.useFakeTimers();

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: false,
            paginationNumberFormatter: ({ value }) => `#${value}`,
            rowData: Array.from({ length: 25 }, (_value, index) => ({
                athlete: `Athlete ${index}`,
            })),
        });

        await advanceOverlayStatusTimers(250);
        expect(getWrapperStatus()).toBe('Loading...');

        api.setGridOption('loading', false);
        await advanceOverlayStatusTimers(1);

        expect(getWrapperStatus()).toBe('Data loaded. #1 to #10 of #25. Page #1 of #3.');
    });

    test('loading completion uses conservative pagination summary for empty rows', async () => {
        vitest.useFakeTimers();

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: false,
            rowData: [],
        });

        await advanceOverlayStatusTimers(250);
        expect(getWrapperStatus()).toBe('Loading...');

        api.setGridOption('loading', false);
        await advanceOverlayStatusTimers(1);

        expect(getWrapperStatus()).toBe('Data loaded.');
    });

    test('custom provided overlay components announce nothing automatically', async () => {
        vitest.useFakeTimers();

        class CustomNoRowsOverlay {
            private readonly eGui = document.createElement('div');

            constructor() {
                this.eGui.className = 'custom-no-rows-overlay';
                this.eGui.textContent = 'Component DOM text';
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
            overlayComponent: CustomNoRowsOverlay,
            overlayComponentParams: {
                noRows: { overlayText: 'Configured no rows status' },
            },
        });

        await advanceOverlayStatusTimers(250);

        expect(document.querySelector('.custom-no-rows-overlay')).toBeTruthy();
        expect(document.querySelector(WRAPPER_STATUS_SELECTOR)).toBeNull();
        expect(getGlobalStatus()).toBe('');
    });

    test('custom overlay components from a selector announce nothing automatically', async () => {
        vitest.useFakeTimers();

        class CustomNoRowsOverlay {
            private eGui!: HTMLElement;

            public init(params: { noRows: { overlayText: string } }): void {
                this.eGui = document.createElement('div');
                this.eGui.className = 'custom-no-rows-overlay';
                this.eGui.textContent = params.noRows.overlayText;
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
            overlayComponentSelector: (params) => {
                if (params.overlayType === 'noRows') {
                    return {
                        component: CustomNoRowsOverlay,
                        params: {
                            noRows: { overlayText: 'Selector no rows status' },
                        },
                    };
                }
                return undefined;
            },
        });

        await advanceOverlayStatusTimers(250);

        expect(document.querySelector('.custom-no-rows-overlay')?.textContent).toBe('Selector no rows status');
        expect(document.querySelector(WRAPPER_STATUS_SELECTOR)).toBeNull();
        expect(getGlobalStatus()).toBe('');
    });

    test('loading completion is announced when another overlay replaces the loading overlay', async () => {
        vitest.useFakeTimers();

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            rowData: [],
        });

        await advanceOverlayStatusTimers(250);
        expect(getWrapperStatus()).toBe('Loading...');
        expect(getGlobalStatus()).toBe('');

        api.setGridOption('loading', false);

        await advanceOverlayStatusTimers(1);
        expect(getWrapperStatus()).toBe('Data loaded. 0 rows.');

        await advanceOverlayStatusTimers(50);
        expect(document.querySelector('.ag-overlay-no-rows-center')).toBeTruthy();
        expect(getWrapperStatus()).toBe('No Rows To Show');
        expect(getGlobalStatus()).toBe('');
    });

    test('refreshing loading overlay params does not restart the debounce or lose the completion', async () => {
        vitest.useFakeTimers();

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            rowData: [{ athlete: 'One' }, { athlete: 'Two' }],
        });

        await advanceOverlayStatusTimers(100);
        api.setGridOption('overlayComponentParams', {
            noRows: { overlayText: 'irrelevant to loading' },
        });

        await advanceOverlayStatusTimers(150);
        expect(getWrapperStatus()).toBe('Loading...');
        expect(getGlobalStatus()).toBe('');

        api.setGridOption('loading', false);
        await advanceOverlayStatusTimers(1);
        expect(getWrapperStatus()).toBe('Data loaded. 2 rows.');
        expect(getGlobalStatus()).toBe('');
    });

    test('custom overlay templates are shown without any grid-provided status element', async () => {
        vitest.useFakeTimers();

        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
            overlayNoRowsTemplate: '<span class="my-no-rows-template">Keine Daten vorhanden</span>',
        });

        await advanceOverlayStatusTimers(250);

        expect(document.querySelector('.my-no-rows-template')?.textContent).toBe('Keine Daten vorhanden');
        expect(document.querySelector(WRAPPER_STATUS_SELECTOR)).toBeNull();
        expect(getGlobalStatus()).toBe('');
    });

    test('loading announcements are localised', async () => {
        vitest.useFakeTimers();

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            rowData: [{ athlete: 'One' }, { athlete: 'Two' }],
            localeText: {
                loadingComplete: 'Daten geladen.',
                loadingCompleteRows: '${variable} Zeilen.',
            },
        });

        await advanceOverlayStatusTimers(250);
        api.setGridOption('loading', false);
        await advanceOverlayStatusTimers(1);

        expect(getWrapperStatus()).toBe('Daten geladen. 2 Zeilen.');
        expect(getGlobalStatus()).toBe('');
    });
});
