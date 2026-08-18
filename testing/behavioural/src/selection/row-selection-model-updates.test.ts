import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, assertSelectableByIndex, asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';

import { PinnedRowModule, RowSelectionModule } from 'ag-grid-community';

import {
    columnDefs,
    createGrid,
    createGridAndWait,
    gridMgr,
    groupGridOptions,
    rowData,
    setupRowSelectionSuite,
} from './rowSelectionHarness';

describe('Row Selection Grid Options', () => {
    setupRowSelectionSuite();

    describe('deselection when rows leave the model', () => {
        test('a second delivery of equal rowData discards selection unless getRowId identifies the rows', () => {
            const olympics = (): any[] => [
                { id: '1', sport: 'football' },
                { id: '2', sport: 'rugby' },
                { id: '3', sport: 'tennis' },
            ];

            const anonymous = gridMgr.createGrid('anonymousGrid', {
                columnDefs,
                rowSelection: { mode: 'multiRow' },
                rowData: olympics(),
            });
            anonymous.setNodesSelected({ nodes: [anonymous.getDisplayedRowAtIndex(1)!], newValue: true });
            expect(anonymous.getSelectedNodes()).toHaveLength(1);
            anonymous.setGridOption('rowData', olympics());

            const identified = gridMgr.createGrid('identifiedGrid', {
                columnDefs,
                rowSelection: { mode: 'multiRow' },
                getRowId: (p) => p.data.id,
                rowData: olympics(),
            });
            identified.setNodesSelected({ nodes: [identified.getDisplayedRowAtIndex(1)!], newValue: true });
            expect(identified.getSelectedNodes()).toHaveLength(1);
            identified.setGridOption('rowData', olympics());

            expect(anonymous.getSelectedNodes()).toHaveLength(0);
            expect(identified.getSelectedNodes().map((node) => node.id)).toEqual(['2']);
        });

        // Immutable rowData removal destroys the dropped node (deleteUnusedNodes); it must leave the
        // selection, while the surviving selected row stays selected.
        test('selected row dropped from selection on immutable rowData removal', async () => {
            const [api] = createGrid({
                columnDefs,
                rowSelection: { mode: 'multiRow' },
                getRowId: (p) => p.data.id,
                rowData: [
                    { id: '1', sport: 'football' },
                    { id: '2', sport: 'rugby' },
                    { id: '3', sport: 'tennis' },
                ],
            });

            const removed = api.getRowNode('2')!;
            api.setNodesSelected({ nodes: [removed, api.getRowNode('3')!], newValue: true });
            expect(
                api
                    .getSelectedNodes()
                    .map((n) => n.id)
                    .sort()
            ).toEqual(['2', '3']);

            api.setGridOption('rowData', [
                { id: '1', sport: 'football' },
                { id: '3', sport: 'tennis' },
            ]);

            expect(removed.destroyed).toBe(true);
            expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['3']);
            await new GridRows(api, 'after immutable removal of selected row 2').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 sport:"football"
                └── LEAF selected id:3 sport:"tennis"
            `);
        });

        // A data update normally reapplies isRowSelectable in refreshModel's grouping pass. When that
        // refresh is suppressed, selectable must still be reapplied so a now-unselectable row is dropped.
        test('suppressModelUpdateAfterUpdateTransaction still recomputes selectable on an update transaction', () => {
            const [api] = createGrid({
                columnDefs,
                getRowId: (p) => p.data.id,
                suppressModelUpdateAfterUpdateTransaction: true,
                rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data?.sport === 'football' },
                rowData: [
                    { id: '1', sport: 'football' },
                    { id: '2', sport: 'rugby' },
                ],
            });

            api.setNodesSelected({ nodes: [api.getRowNode('1')!], newValue: true });
            expect(api.getRowNode('1')!.isSelected()).toBe(true);
            expect(api.getRowNode('1')!.selectable).toBe(true);

            api.applyTransaction({ update: [{ id: '1', sport: 'rugby' }] });

            expect(api.getRowNode('1')!.selectable).toBe(false);
            expect(api.getRowNode('1')!.isSelected()).toBe(false);
            expect(api.getSelectedNodes()).toEqual([]);
        });

        // A removal recorded while a refresh is deferred (here, column change events dispatching) must flush
        // its selectionChanged this turn, so an unrelated later change can't emit it with a stale source.
        test('removal during a deferred refresh flushes selectionChanged with its own source', async () => {
            const sources: string[] = [];
            const [api] = createGrid({
                columnDefs,
                getRowId: (p) => p.data.id,
                rowSelection: { mode: 'multiRow' },
                rowData: [
                    { id: '1', sport: 'football' },
                    { id: '2', sport: 'rugby' },
                    { id: '3', sport: 'tennis' },
                ],
            });
            api.addEventListener('selectionChanged', (e) => sources.push(e.source));

            api.setNodesSelected({ nodes: [api.getRowNode('1')!, api.getRowNode('3')!], newValue: true });
            await asyncSetTimeout(0);
            sources.length = 0;

            // Set here rather than driven, because nothing public runs inside the window `setColDefs` opens:
            // only ALWAYS_SYNC_GLOBAL_EVENTS reach a listener synchronously, and no column event is one.
            const colModel = (api.getRowNode('1') as any).beans.colModel;
            colModel.changeEventsDispatching = true;
            try {
                api.applyTransaction({ remove: [{ id: '1' }] });
            } finally {
                colModel.changeEventsDispatching = false;
            }
            expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['3']);

            api.setGridOption('rowSelection', {
                mode: 'multiRow',
                isRowSelectable: (node) => node.data?.sport !== 'tennis',
            });
            expect(api.getRowNode('3')!.isSelected()).toBe(false);
            await asyncSetTimeout(0);

            expect(sources).toEqual(['rowDataChanged', 'selectableChanged']);
        });
    });

    describe('isRowSelectable invocation count', () => {
        test('flat grid invokes isRowSelectable once per node on load and on update', () => {
            const counts: Record<string, number> = {};
            const [api] = createGrid({
                columnDefs,
                rowData,
                getRowId: (p) => p.data.sport,
                rowSelection: {
                    mode: 'multiRow',
                    isRowSelectable: (node) => {
                        const id = node.id!;
                        counts[id] = (counts[id] ?? 0) + 1;
                        return true;
                    },
                },
            });
            // The whole map, not a per-key loop: a loop over the recorded keys passes just as well when a
            // node was skipped entirely, which is the half of "once per node" worth protecting.
            expect(counts).toEqual(Object.fromEntries(rowData.map(({ sport }) => [sport, 1])));

            for (const id of Object.keys(counts)) {
                delete counts[id];
            }
            api.applyTransaction({ update: [{ sport: 'football' }] });
            expect(counts).toEqual({ football: 1 }); // updated once, never double, and nothing else recomputed
        });

        test('row grouping invokes isRowSelectable once per node, on fully-formed nodes (groupSelects: "self")', () => {
            const counts: Record<string, number> = {};
            const groupAtCall: Record<string, boolean> = {};
            const [api] = createGrid({
                ...groupGridOptions,
                rowSelection: {
                    mode: 'multiRow',
                    groupSelects: 'self',
                    isRowSelectable: (node) => {
                        const id = node.id!;
                        counts[id] = (counts[id] ?? 0) + 1;
                        groupAtCall[id] = !!node.group;
                        return true;
                    },
                },
            });
            // Every node in the model, compared against the callback's own record: checking only the keys it
            // recorded would pass just as well when a node was never offered to the callback at all.
            const modelIds: string[] = [];
            api.forEachNode((node) => modelIds.push(node.id!));
            expect(Object.keys(counts).sort()).toEqual([...modelIds].sort());
            expect(Object.values(counts).every((n) => n === 1)).toBe(true);

            // filler group nodes were fully formed (group===true) when the callback ran
            const groupIds = modelIds.filter((id) => id.startsWith('row-group-'));
            expect(groupIds.length).toBeGreaterThan(0);
            for (const id of groupIds) {
                expect(groupAtCall[id]).toBe(true);
            }
        });
    });

    describe('Cell Renderer', () => {
        class CustomCellRenderer {
            eGui: HTMLElement;
            eButton: HTMLElement;
            eventListener: () => void;

            init(params: any) {
                this.eGui = document.createElement('div');
                const eButton = (this.eButton = document.createElement('button'));
                eButton.className = `btn-${params.data.sport}`;
                eButton.textContent = String(params.value);
                this.eventListener = () => {
                    params.setValue('foo');
                };
                eButton.addEventListener('click', this.eventListener);
                this.eGui.appendChild(eButton);
            }

            getGui() {
                return this.eGui;
            }

            refresh(params: any) {
                // Returning `true` tells the grid we've handled the value change in-place;
                // the DOM must therefore actually reflect the new value, otherwise the cell's
                // text stays stale even though `api.getCellValue` returns the new value.
                this.eButton.textContent = String(params.value);
                return true;
            }

            destroy() {
                this.eButton?.removeEventListener('click', this.eventListener);
            }
        }

        test('selectable refreshed when changing cell value', async () => {
            const [api] = await createGridAndWait({
                columnDefs: [
                    { field: 'sport', cellRenderer: CustomCellRenderer },
                    { field: 'unrelated', editable: true },
                ],
                rowData: structuredClone(rowData),
                rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data?.sport !== 'foo' },
            });
            await new GridColumns(api, `selectable refreshed when changing cell value setup`).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── sport "Sport" width:200
                └── unrelated "Unrelated" width:200 editable
            `);
            await new GridRows(api, `selectable refreshed when changing cell value setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF id:1 sport:"rugby"
                ├── LEAF id:2 sport:"tennis"
                ├── LEAF id:3 sport:"cricket"
                ├── LEAF id:4 sport:"golf"
                ├── LEAF id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);

            assertSelectableByIndex([0, 1, 2, 3, 4, 5, 6], api);

            document.querySelector<HTMLButtonElement>('.btn-rugby')?.click();

            assertSelectableByIndex([0, 2, 3, 4, 5, 6], api);
            await new GridRows(api, `selectable refreshed when changing cell value final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF 🚫 id:1 sport:"foo"
                ├── LEAF id:2 sport:"tennis"
                ├── LEAF id:3 sport:"cricket"
                ├── LEAF id:4 sport:"golf"
                ├── LEAF id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);
        });

        test('pinned rows mirror selectable status of their siblings reactively', async () => {
            const [api] = await createGridAndWait(
                {
                    columnDefs: [
                        { field: 'sport', cellRenderer: CustomCellRenderer },
                        { field: 'unrelated', editable: true },
                    ],
                    rowData: structuredClone(rowData),
                    rowSelection: {
                        mode: 'multiRow',
                        isRowSelectable: (node) => (node.rowPinned ? true : node.data?.sport !== 'foo'),
                    },
                    enableRowPinning: true,
                },
                { modules: [RowSelectionModule, PinnedRowModule] }
            );

            assertSelectableByIndex([0, 1, 2, 3, 4, 5, 6], api);

            const btn = document.querySelector<HTMLButtonElement>('.btn-rugby');

            api.setGridOption('isRowPinned', (node) => (node.data?.sport === 'rugby' ? 'top' : null));
            await nextAnimationFrame();
            await nextAnimationFrame();
            await new GridColumns(
                api,
                `pinned rows mirror selectable status of their siblings reactively after setGridOption isRowPinned`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── sport "Sport" width:200
                └── unrelated "Unrelated" width:200 editable
            `);
            await new GridRows(
                api,
                `pinned rows mirror selectable status of their siblings reactively after setGridOption isRowPinned`
            ).check(`
                PINNED_TOP id:t-top-1 sport:"rugby"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football"
                ├── LEAF id:1 sport:"rugby"
                ├── LEAF id:2 sport:"tennis"
                ├── LEAF id:3 sport:"cricket"
                ├── LEAF id:4 sport:"golf"
                ├── LEAF id:5 sport:"swimming"
                └── LEAF id:6 sport:"rowing"
            `);

            btn?.click();

            // Poll the selectable transition (index 1 drops out), then assert the pinned mirror synchronously.
            await waitFor(() => assertSelectableByIndex([0, 2, 3, 4, 5, 6], api));

            api.forEachPinnedRow('top', (node) => expect(node.selectable).toBe(false));
        });
    });
});
