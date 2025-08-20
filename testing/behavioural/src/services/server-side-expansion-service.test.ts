import { beforeEach, describe, vi, vitest } from 'vitest';

import { RowNode } from 'ag-grid-community';

import { ServerSideExpansionService } from '../../../../packages/ag-grid-enterprise/src/serverSideRowModel/services/serverSideExpansionService';

describe('ServerSideExpansionService', () => {
    let expansionService: ServerSideExpansionService;
    let beans: any;
    let rowNode: RowNode;
    beforeEach(() => {
        beans = {
            rowRenderer: { refreshCells: vi.fn() },
            eventSvc: { dispatchEvent: vitest.fn() },
            gos: {
                get: (key: string) => {
                    switch (key) {
                        case 'ssrmExpandAllAffectsAllRows':
                            return true;
                    }
                },
                addCommon: (params) => params,
            },
            serverSideRowModel: {
                forEachNodeTransactional: (cb) => cb(rowNode),
            },
        };
        expansionService = new ServerSideExpansionService();
        expansionService['gos'] = beans.gos as any;
        expansionService['serverSideRowModel'] = beans.serverSideRowModel as any;
        expansionService['eventSvc'] = beans.eventSvc;
        expansionService['beans'] = beans;
    });

    describe('isRowExpanded()', () => {
        beforeEach(() => {
            rowNode = new RowNode(beans);
            rowNode.id = '1';
            vitest.spyOn(rowNode, 'isExpandable').mockReturnValue(true);
        });

        it('should return false for non-expandable nodes', () => {
            vitest.spyOn(rowNode, 'isExpandable').mockReturnValue(false);
            expect(expansionService.isRowExpanded(rowNode)).toBe(false);
        });

        describe('when collapsed by default', () => {
            beforeEach(() => {
                expansionService['gos'].getCallback = () => () => false;
                expect(expansionService.isRowExpanded(rowNode)).toBe(false);
            });

            it('should stay collapsed', () => {
                expect(expansionService.isRowExpanded(rowNode)).toBe(false);
            });
            it('should stay expanded, when toggled by user', () => {
                expansionService.setExpanded(rowNode, true);
                expect(expansionService.isRowExpanded(rowNode)).toBe(true);
            });
            it('should stay expanded, when expand all clicked', () => {
                expansionService.expandAll(true);
                expect(expansionService.isRowExpanded(rowNode)).toBe(true);
            });
            it('should stay collapsed, when collapse all clicked', () => {
                expect(expansionService.isRowExpanded(rowNode)).toBe(false);
            });
        });

        describe('when expanded by default', () => {
            beforeEach(() => {
                expansionService['gos'].getCallback = () => () => true;
                expect(expansionService.isRowExpanded(rowNode)).toBe(true);
            });
            it('should stay expanded', () => {
                expect(expansionService.isRowExpanded(rowNode)).toBe(true);
            });
            it('should stay collapsed, when toggled by user', () => {
                expansionService.setExpanded(rowNode, false);
                expect(expansionService.isRowExpanded(rowNode)).toBe(false);
            });
            it('should stay expanded, when expand all clicked', () => {
                expansionService.expandAll(true);
                expect(expansionService.isRowExpanded(rowNode)).toBe(true);
            });
            it('should stay collapsed, when collapse all clicked', () => {
                expansionService.expandAll(false);
                expect(expansionService.isRowExpanded(rowNode)).toBe(false);
            });
        });
    });
});
