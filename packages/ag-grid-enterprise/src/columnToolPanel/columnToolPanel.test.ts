import { ColumnToolPanel } from './columnToolPanel';

const createDeferredModeParams = () =>
    ({
        deferApply: true,
        buttons: [],
        suppressPivotMode: true,
        suppressRowGroups: true,
        suppressValues: true,
        suppressPivots: true,
    }) as any;

const createPanel = (): ColumnToolPanel & Record<string, any> => {
    const panel = new ColumnToolPanel() as any;
    panel.gos = {
        addCommon: (params: any) => params,
        isModuleRegistered: () => false,
    };
    panel.beans = {
        colModel: {
            getColDefCols: () => [],
            isPivotMode: () => false,
            getColDefCol: () => undefined,
        },
        rowGroupColsSvc: { columns: [] },
        pivotColsSvc: { columns: [] },
        valueColsSvc: { columns: [] },
    };

    panel.createBean = jest.fn(() => ({
        init: jest.fn(),
        addCss: jest.fn(),
    }));
    panel.appendChild = jest.fn();
    panel.destroyBean = jest.fn();

    return panel;
};

describe('ColumnToolPanel', () => {
    it('cleans up all deferred sync listeners on refresh and destroy cycles', () => {
        const panel = createPanel();
        const cleanupCallsPerInit: jest.Mock[][] = [];

        panel.addManagedEventListeners = jest.fn(() => {
            const cleanupFuncs = Array.from({ length: 6 }, () => jest.fn(() => null));
            cleanupCallsPerInit.push(cleanupFuncs);
            return cleanupFuncs;
        });

        panel.init(createDeferredModeParams());
        panel.refresh(createDeferredModeParams());
        panel.destroyChildren();

        expect(cleanupCallsPerInit).toHaveLength(2);
        expect(cleanupCallsPerInit[0]).toHaveLength(6);
        expect(cleanupCallsPerInit[1]).toHaveLength(6);

        for (const cleanup of cleanupCallsPerInit[0]) {
            expect(cleanup).toHaveBeenCalledTimes(1);
        }
        for (const cleanup of cleanupCallsPerInit[1]) {
            expect(cleanup).toHaveBeenCalledTimes(1);
        }
    });
});
