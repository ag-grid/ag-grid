import { waitFor } from '@testing-library/dom';

import type { IColumnSelectionLabelRendererComp, IColumnSelectionLabelRendererParams } from 'ag-grid-community';
import { AgPromise, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

describe('column selection label renderer', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    function renderVirtualList(root: ParentNode): void {
        const viewport = root.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement;
        Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
    }

    test('renders columns and column groups without replacing grid-managed controls', async () => {
        const receivedParams: IColumnSelectionLabelRendererParams[] = [];

        class LabelRenderer implements IColumnSelectionLabelRendererComp {
            private readonly eGui = document.createElement('span');

            public init(params: IColumnSelectionLabelRendererParams & { prefix: string }): void {
                receivedParams.push(params);
                this.eGui.className = 'custom-column-label';
                this.eGui.textContent = `${params.prefix}${params.displayName}`;
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const api = await gridMgr.createGridAndWait('column-label-renderer', {
            components: { customColumnLabel: LabelRenderer },
            columnDefs: [
                {
                    headerName: 'Results',
                    groupId: 'results',
                    children: [{ field: 'gold' }, { field: 'silver' }],
                },
            ],
            rowData: [{ gold: 1, silver: 2 }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: {
                            columnLabelRenderer: 'customColumnLabel',
                            columnLabelRendererParams: { prefix: 'Label: ' },
                        },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        const gridElement = getGridElement(api)!;
        await waitFor(() => {
            renderVirtualList(gridElement);
            expect(gridElement.querySelectorAll('.custom-column-label')).toHaveLength(3);
        });

        expect(
            Array.from(gridElement.querySelectorAll('.custom-column-label'), (element) => element.textContent)
        ).toEqual(['Label: Results', 'Label: Gold', 'Label: Silver']);
        const groupParams = receivedParams.find((params) => params.columnGroup?.getGroupId() === 'results');
        const goldParams = receivedParams.find((params) => params.column?.getColId() === 'gold');
        expect(groupParams).toEqual(
            expect.objectContaining({
                displayName: 'Results',
                column: null,
                source: 'columnsToolPanel',
            })
        );
        expect(goldParams).toEqual(
            expect.objectContaining({
                displayName: 'Gold',
                columnGroup: null,
                source: 'columnsToolPanel',
            })
        );

        const groupRow = gridElement.querySelector('.ag-column-select-column-group')!;
        expect(groupRow.querySelector('.ag-column-group-icons')).not.toBeNull();
        expect(groupRow.querySelector('.ag-column-select-checkbox')).not.toBeNull();
        expect(groupRow.querySelector('.ag-column-select-column-label .ag-column-select-checkbox')).toBeNull();

        const columnRow = gridElement.querySelector('.ag-column-select-column')!;
        expect(columnRow.querySelector('.ag-column-select-checkbox')).not.toBeNull();
        expect(columnRow.querySelector('.ag-column-select-column-drag-handle')).not.toBeNull();
        expect(columnRow.querySelector('.ag-column-select-column-label .ag-column-select-checkbox')).toBeNull();
        expect(columnRow.closest('.ag-column-select-virtual-list-item')?.getAttribute('aria-label')).toBe(
            'Gold Column'
        );
    });

    test('configures the Column Chooser independently and reports its source', async () => {
        const receivedParams: IColumnSelectionLabelRendererParams[] = [];
        const api = await gridMgr.createGridAndWait('column-chooser-label-renderer', {
            columnDefs: [{ field: 'athlete' }, { field: 'sport' }],
            rowData: [{ athlete: 'A', sport: 'Swimming' }],
        });

        api.showColumnChooser({
            columnLabelRenderer: (params: IColumnSelectionLabelRendererParams) => {
                receivedParams.push(params);
                const label = document.createElement('span');
                label.className = 'custom-chooser-label';
                label.textContent = `Chooser: ${params.displayName}`;
                return label;
            },
        });

        const dialog = await waitFor(() => {
            const element = document.querySelector('[role="dialog"]');
            expect(element).not.toBeNull();
            return element!;
        });

        await waitFor(() => {
            renderVirtualList(dialog);
            expect(dialog.querySelectorAll('.custom-chooser-label')).toHaveLength(2);
        });

        expect(Array.from(dialog.querySelectorAll('.custom-chooser-label'), (element) => element.textContent)).toEqual([
            'Chooser: Athlete',
            'Chooser: Sport',
        ]);
        expect(receivedParams.length).toBeGreaterThanOrEqual(2);
        expect(receivedParams.every((params) => params.source === 'columnChooser')).toBe(true);
        expect(new Set(receivedParams.map((params) => params.column?.getColId()))).toEqual(
            new Set(['athlete', 'sport'])
        );

        api.hideColumnChooser();
    });

    test('keeps the display name visible while an asynchronous renderer initialises', async () => {
        let resolveRenderer: (() => void) | undefined;

        class AsyncLabelRenderer implements IColumnSelectionLabelRendererComp {
            private readonly eGui = document.createElement('span');

            public init(params: IColumnSelectionLabelRendererParams): AgPromise<void> {
                this.eGui.className = 'async-column-label';
                this.eGui.textContent = `Rendered: ${params.displayName}`;
                return new AgPromise<void>((resolve) => {
                    resolveRenderer = () => resolve();
                });
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const api = await gridMgr.createGridAndWait('async-column-label-renderer', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'A' }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { columnLabelRenderer: AsyncLabelRenderer },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        const gridElement = getGridElement(api)!;
        await waitFor(() => {
            renderVirtualList(gridElement);
            const label = gridElement.querySelector('.ag-column-select-column-label');
            expect(label?.textContent).toBe('Athlete');
            expect(resolveRenderer).toBeDefined();
        });

        resolveRenderer!();

        await waitFor(() => {
            expect(gridElement.querySelector('.async-column-label')?.textContent).toBe('Rendered: Athlete');
        });
    });

    test('keeps the current renderer until an asynchronous replacement is ready', async () => {
        let resolveReplacement: (() => void) | undefined;
        let destroyCount = 0;

        class RefreshingLabelRenderer implements IColumnSelectionLabelRendererComp {
            private readonly eGui = document.createElement('span');

            public init(params: IColumnSelectionLabelRendererParams): AgPromise<void> | void {
                this.eGui.className = 'refreshing-column-label';
                this.eGui.textContent = `Rendered: ${params.displayName}`;
                if (params.displayName === 'Competitor') {
                    return new AgPromise<void>((resolve) => {
                        resolveReplacement = () => resolve();
                    });
                }
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }

            public refresh(): boolean {
                return false;
            }

            public destroy(): void {
                destroyCount++;
            }
        }

        const api = await gridMgr.createGridAndWait('refreshing-column-label-renderer', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'A' }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { columnLabelRenderer: RefreshingLabelRenderer },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        const gridElement = getGridElement(api)!;
        const initialRenderer = await waitFor(() => {
            renderVirtualList(gridElement);
            const renderer = gridElement.querySelector('.refreshing-column-label');
            expect(renderer?.textContent).toBe('Rendered: Athlete');
            return renderer!;
        });
        const destroyCountBeforeReplacement = destroyCount;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Competitor' }] });

        expect(resolveReplacement).toBeDefined();
        expect(gridElement.querySelector('.refreshing-column-label')).toBe(initialRenderer);
        expect(destroyCount).toBe(destroyCountBeforeReplacement);

        resolveReplacement!();

        await waitFor(() => {
            const renderer = gridElement.querySelector('.refreshing-column-label');
            expect(renderer).not.toBe(initialRenderer);
            expect(renderer?.textContent).toBe('Rendered: Competitor');
        });
        expect(destroyCount).toBe(destroyCountBeforeReplacement + 1);
    });

    test('destroys renderer instances with the panel', async () => {
        let destroyCount = 0;

        class LabelRenderer implements IColumnSelectionLabelRendererComp {
            private readonly eGui = document.createElement('span');

            public init(params: IColumnSelectionLabelRendererParams): void {
                this.eGui.className = 'destroyable-column-label';
                this.eGui.textContent = params.displayName;
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }

            public destroy(): void {
                destroyCount++;
            }
        }

        const api = await gridMgr.createGridAndWait('destroy-column-label-renderer', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'A' }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { columnLabelRenderer: LabelRenderer },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        const gridElement = getGridElement(api)!;
        await waitFor(() => {
            renderVirtualList(gridElement);
            expect(gridElement.querySelector('.destroyable-column-label')).not.toBeNull();
        });

        const destroyCountBeforeGridDestroy = destroyCount;
        api.destroy();
        expect(destroyCount).toBe(destroyCountBeforeGridDestroy + 1);
    });
});
