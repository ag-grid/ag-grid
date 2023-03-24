import { _ModuleSupport } from 'ag-charts-community';
import { ContextMenu } from './contextMenu';

export const ContextMenuModule: _ModuleSupport.Module = {
    type: 'root',
    optionsKey: 'contextMenu',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],
    initialiseModule(ctx: _ModuleSupport.ModuleContext) {
        const instance = new ContextMenu(ctx);
        return { instance };
    },
};

declare module 'ag-charts-community' {
    export interface AgCartesianChartOptions {
        contextMenu?: AgContextMenuOptions;
    }

    export interface AgPolarChartOptions {
        contextMenu?: AgContextMenuOptions;
    }

    export interface AgHierarchyChartOptions {
        contextMenu?: AgContextMenuOptions;
    }

    export interface AgContextMenuOptions {
        enabled?: boolean;
    }
}
