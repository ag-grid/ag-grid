import { beforeEach, describe, vi, vitest } from 'vitest';

import { RowNode } from 'ag-grid-community';

import { ServerSideExpansionService } from './serverSideExpansionService';

describe('ServerSideExpansionService', () => {
    let expansionService: ServerSideExpansionService;
    let beans: any;
    let rowNode: RowNode;
    let ssrmExpandAllAffectsAllRows: boolean;
    beforeEach(() => {
        ssrmExpandAllAffectsAllRows = true;
        beans = {
            rowRenderer: { refreshCells: vi.fn(), refreshRowByNode: vi.fn() },
            eventSvc: { dispatchEvent: vitest.fn() },
            gos: {
                get: (key: string) => {
                    return key === 'ssrmExpandAllAffectsAllRows' ? ssrmExpandAllAffectsAllRows : undefined;
                },
                getCallback: () => undefined,
                addCommon: (params: any) => params,
            },
            colModel: { pivotMode: false },
            serverSideRowModel: {
                forEachNode: (cb: (node: RowNode) => void) => cb(rowNode),
            },
            rowModel: {
                forEachNode: (cb: (node: RowNode) => void) => cb(rowNode),
            },
        };
        expansionService = new ServerSideExpansionService();
        expansionService['gos'] = beans.gos as any;
        expansionService['serverSideRowModel'] = beans.serverSideRowModel as any;
        expansionService['eventSvc'] = beans.eventSvc;
        expansionService['beans'] = beans;
        expansionService['createBean'] = (bean: any) => bean;
        // wire the strategy so ExpandStrategy (default) can reach rowModel/gos in tests
        expansionService['createManagedBean'] = (bean: any) => {
            bean['beans'] = beans;
            bean['gos'] = beans.gos;
            return bean;
        };
        expansionService['destroyBean'] = () => undefined;
        expansionService['addManagedEventListeners'] = () => [];
        expansionService['addManagedPropertyListener'] = () => () => null;
        expansionService.postConstruct();
    });

    describe('isRowExpanded()', () => {
        beforeEach(() => {
            rowNode = new RowNode(beans);
            rowNode.id = '1';
            vitest.spyOn(rowNode, 'isExpandable').mockReturnValue(true);
        });

        describe('when collapsed by default', () => {
            beforeEach(() => {
                rowNode.expanded = false;
            });

            it('should stay collapsed', () => {
                expect(rowNode.expanded).toBe(false);
            });
            it('should stay expanded, when toggled by user', () => {
                expansionService.setExpanded(rowNode, true);
                expect(rowNode.expanded).toBe(true);
            });
            it('should stay expanded, when expand all clicked', () => {
                expansionService.expandAll(true);
                expect(rowNode.expanded).toBe(true);
            });
            it('should stay collapsed, when collapse all clicked', () => {
                expansionService.expandAll(false);
                expect(rowNode.expanded).toBe(false);
            });
        });

        describe('when expanded by default', () => {
            beforeEach(() => {
                rowNode.expanded = true;
            });
            it('should stay expanded', () => {
                expect(rowNode.expanded).toBe(true);
            });
            it('should stay collapsed, when toggled by user', () => {
                expansionService.setExpanded(rowNode, false);
                expect(rowNode.expanded).toBe(false);
            });
            it('should stay expanded, when expand all clicked', () => {
                expansionService.expandAll(true);
                expect(rowNode.expanded).toBe(true);
            });
            it('should stay collapsed, when collapse all clicked', () => {
                expansionService.expandAll(false);
                expect(rowNode.expanded).toBe(false);
            });
        });
    });

    // A pivot leaf group is non-expandable by construction: isExpandable() === false forever, so no write path may open it.
    describe('when never expandable (e.g. pivot leaf group)', () => {
        beforeEach(() => {
            beans.colModel.pivotMode = true;
            rowNode = new RowNode(beans);
            rowNode.id = '1';
            rowNode.group = true;
            rowNode.leafGroup = true;
            rowNode.expanded = false;
            vitest.spyOn(rowNode, 'isExpandable').mockReturnValue(false);
        });

        it('should stay collapsed, when toggled by user', () => {
            expansionService.setExpanded(rowNode, true);
            expect(rowNode.expanded).toBe(false);
        });
        it('should stay collapsed, when expand all clicked (ssrmExpandAllAffectsAllRows)', () => {
            expansionService.expandAll(true);
            expect(rowNode.expanded).toBe(false);
        });
        it('should stay collapsed, when expand all clicked (default strategy)', () => {
            ssrmExpandAllAffectsAllRows = false;
            expansionService.expandAll(true);
            expect(rowNode.expanded).toBe(false);
        });
        it('is a no-op that records no intent, so the state stays clean', () => {
            const isExpandable = vitest.spyOn(rowNode, 'isExpandable').mockReturnValue(false);

            expansionService.setExpanded(rowNode, true);
            expect(rowNode.expanded).toBe(false);
            expect(expansionService.isNodeExpanded(rowNode)).toBe(false);
            // nothing was recorded, so the serialized expansion state carries no dead leaf-group id
            expect(expansionService.getExpansionState()).toEqual({
                expandedRowGroupIds: [],
                collapsedRowGroupIds: [],
            });

            // and because no intent was stored, it does not spuriously open if the node later becomes expandable
            isExpandable.mockReturnValue(true);
            expect(expansionService.isNodeExpanded(rowNode)).toBe(false);
        });

        it('does not resolve or cache the default while not expandable, so it resolves once expandable', () => {
            const isExpandable = vitest.spyOn(rowNode, 'isExpandable').mockReturnValue(false);
            const defaultExpanded = vitest.spyOn(expansionService as any, 'defaultExpanded').mockReturnValue(true);
            rowNode._expanded = null; // lazy/unresolved

            expect(expansionService.isExpanded(rowNode)).toBe(false);
            expect(defaultExpanded).not.toHaveBeenCalled();
            expect(rowNode._expanded).toBeNull(); // not cached

            isExpandable.mockReturnValue(true);
            expect(expansionService.isExpanded(rowNode)).toBe(true);
            expect(defaultExpanded).toHaveBeenCalledTimes(1);
            expect(rowNode._expanded).toBe(true); // now resolved and cached
        });
    });

    // Detail rows and (in pivot) master rows are also non-expandable by construction, so setExpanded must
    // no-op and never record a dead id — same contract as a pivot leaf group.
    describe.each([
        ['detail row', false, (node: RowNode) => (node.detail = true)],
        ['pivot master row', true, (node: RowNode) => (node.master = true)],
    ])('when never expandable (%s)', (_label, pivotMode, configure) => {
        beforeEach(() => {
            beans.colModel.pivotMode = pivotMode;
            rowNode = new RowNode(beans);
            rowNode.id = '1';
            rowNode.expanded = false;
            configure(rowNode);
        });

        it('setExpanded(true) is a no-op that records no intent', () => {
            expansionService.setExpanded(rowNode, true);
            expect(rowNode.expanded).toBe(false);
            expect(expansionService.getExpansionState()).toEqual({
                expandedRowGroupIds: [],
                collapsedRowGroupIds: [],
            });
        });
    });

    // An unloaded group stub is only transiently non-expandable (children not yet loaded): its expand intent
    // must be recorded and applied once it loads, unlike a pivot leaf group which never opens.
    describe('when not yet expandable (e.g. an unloaded group stub)', () => {
        beforeEach(() => {
            rowNode = new RowNode(beans);
            rowNode.id = '1';
            rowNode.group = true;
            rowNode.expanded = false;
        });

        it('records the expand intent and applies it once the node becomes expandable', () => {
            const isExpandable = vitest.spyOn(rowNode, 'isExpandable').mockReturnValue(false);

            expansionService.setExpanded(rowNode, true);
            // not physically opened while not yet expandable, but the intent is recorded
            expect(rowNode.expanded).toBe(false);
            expect(expansionService.isNodeExpanded(rowNode)).toBe(false);
            expect(expansionService.getExpansionState()).toEqual({
                expandedRowGroupIds: ['1'],
                collapsedRowGroupIds: [],
            });

            // once children load and the node becomes expandable, the recorded intent applies
            isExpandable.mockReturnValue(true);
            expect(expansionService.isNodeExpanded(rowNode)).toBe(true);
        });

        it('clears recorded expand intent on collapseAll so it does not re-open once expandable', () => {
            ssrmExpandAllAffectsAllRows = false; // stay on the default (per-node) strategy
            const isExpandable = vitest.spyOn(rowNode, 'isExpandable').mockReturnValue(false);

            expansionService.setExpanded(rowNode, true);
            expect(expansionService.getExpansionState()).toEqual({
                expandedRowGroupIds: ['1'],
                collapsedRowGroupIds: [],
            });

            // collapseAll while still not expandable must clear the stale intent without recording a dead id
            expansionService.expandAll(false);
            expect(expansionService.getExpansionState()).toEqual({
                expandedRowGroupIds: [],
                collapsedRowGroupIds: [],
            });

            // so it does not spuriously re-open once the node becomes expandable
            isExpandable.mockReturnValue(true);
            expect(expansionService.isNodeExpanded(rowNode)).toBe(false);
        });
    });
});
