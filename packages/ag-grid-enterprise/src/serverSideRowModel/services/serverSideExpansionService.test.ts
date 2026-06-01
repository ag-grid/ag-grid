import { beforeEach, describe, vi, vitest } from 'vitest';

import { RowNode } from 'ag-grid-community';

import { ServerSideExpansionService } from './serverSideExpansionService';

describe('ServerSideExpansionService', () => {
    let expansionService: ServerSideExpansionService;
    let beans: any;
    let rowNode: RowNode;
    beforeEach(() => {
        beans = {
            rowRenderer: { refreshCells: vi.fn(), refreshRowByNode: vi.fn() },
            eventSvc: { dispatchEvent: vitest.fn() },
            gos: {
                get: (key: string) => {
                    return key === 'ssrmExpandAllAffectsAllRows' ? true : undefined;
                },
                addCommon: (params) => params,
            },
            serverSideRowModel: {
                forEachNode: (cb) => cb(rowNode),
            },
        };
        expansionService = new ServerSideExpansionService();
        expansionService['gos'] = beans.gos as any;
        expansionService['serverSideRowModel'] = beans.serverSideRowModel as any;
        expansionService['eventSvc'] = beans.eventSvc;
        expansionService['beans'] = beans;
        expansionService['createBean'] = (bean: any) => bean;
        expansionService['createManagedBean'] = (bean: any) => bean;
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
});
