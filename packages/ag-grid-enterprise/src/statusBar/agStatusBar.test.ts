import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { StatusPanelDef } from 'ag-grid-community';

import { AgStatusBarSelector } from './agStatusBar';

// Regression for AG-16023: configuring a client-side-only status panel (e.g. agTotalRowCountComponent) while
// running SSRM used to throw. The fix filters unsupported panels out up front (with a warning) instead of
// half-constructing a component that later crashes. getValidPanels() is that filter; we exercise it directly.
describe('AgStatusBar.getValidPanels (row-model support filtering)', () => {
    const AgStatusBar = AgStatusBarSelector.component as any;

    let instance: any;
    let warn: ReturnType<typeof vi.fn>;
    let rowModelType: string;
    let statusPanels: StatusPanelDef[] | undefined;

    beforeEach(() => {
        warn = vi.fn();
        rowModelType = 'serverSide';
        statusPanels = undefined;

        // Bypass the Component constructor (template/CSS wiring is irrelevant here) and inject only what
        // getValidPanels reads: this.gos and this.beans.log.
        instance = Object.create(AgStatusBar.prototype);
        instance.gos = {
            get: (key: string) => {
                if (key === 'rowModelType') {
                    return rowModelType;
                }
                if (key === 'statusBar') {
                    return statusPanels ? { statusPanels } : undefined;
                }
                return undefined;
            },
        };
        instance.beans = { log: { warn } };
    });

    const getValidPanels = (): StatusPanelDef[] | undefined => instance.getValidPanels();

    it('returns undefined when no status bar is configured', () => {
        statusPanels = undefined;
        expect(getValidPanels()).toBeUndefined();
        expect(warn).not.toHaveBeenCalled();
    });

    it('drops client-side-only panels under SSRM and warns for each', () => {
        rowModelType = 'serverSide';
        statusPanels = [{ statusPanel: 'agTotalRowCountComponent' }, { statusPanel: 'agAggregationComponent' }];

        // agAggregationComponent supports serverSide; agTotalRowCountComponent is clientSide-only and filtered out
        expect(getValidPanels()).toEqual([{ statusPanel: 'agAggregationComponent' }]);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalledWith(225);
    });

    it('keeps serverSide-supported panels under SSRM without warning', () => {
        rowModelType = 'serverSide';
        statusPanels = [{ statusPanel: 'agSelectedRowCountComponent' }, { statusPanel: 'agAggregationComponent' }];

        expect(getValidPanels()).toEqual(statusPanels);
        expect(warn).not.toHaveBeenCalled();
    });

    it('warns for agFilteredRowCountComponent under SSRM', () => {
        rowModelType = 'serverSide';
        statusPanels = [{ statusPanel: 'agFilteredRowCountComponent' }];

        expect(getValidPanels()).toEqual([]);
        expect(warn).toHaveBeenCalledWith(222);
    });

    it('keeps every panel under the client-side row model', () => {
        rowModelType = 'clientSide';
        statusPanels = [
            { statusPanel: 'agTotalRowCountComponent' },
            { statusPanel: 'agFilteredRowCountComponent' },
            { statusPanel: 'agTotalAndFilteredRowCountComponent' },
            { statusPanel: 'agAggregationComponent' },
        ];

        expect(getValidPanels()).toEqual(statusPanels);
        expect(warn).not.toHaveBeenCalled();
    });

    it('always keeps custom (unmapped) panels', () => {
        rowModelType = 'serverSide';
        statusPanels = [{ statusPanel: 'myCustomStatusPanel' }];

        expect(getValidPanels()).toEqual(statusPanels);
        expect(warn).not.toHaveBeenCalled();
    });
});
