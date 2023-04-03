import { _ModuleSupport } from 'ag-charts-community';
import { ContextMenu, ContextMenuActionParams } from './contextMenu';

export { ContextMenuActionParams } from './contextMenu';

export const ContextMenuModule: _ModuleSupport.Module = {
    type: 'root',
    packageType: 'enterprise',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],
    optionsKey: 'contextMenu',
    initialiseModule(ctx: _ModuleSupport.ModuleContext) {
        const instance = new ContextMenu(ctx);
        return { instance };
    },
};

export function _registerDefaultAction(
    id: string,
    label: string,
    action: (params: ContextMenuActionParams) => void
): void {
    ContextMenu.registerDefaultAction({ id, label, action });
}

export function _registerNodeAction(
    id: string,
    label: string,
    action: (params: ContextMenuActionParams) => void
): void {
    ContextMenu.registerNodeAction({ id, label, action });
}

export function _disableAction(actionId: string) {
    ContextMenu.disableAction(actionId);
}

export function _enableAction(actionId: string) {
    ContextMenu.enableAction(actionId);
}

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
}

export interface AgContextMenuOptions {
    enabled?: boolean;
    extraActions?: Array<AgContextMenuAction>;
}

export type AgContextMenuAction = {
    label: string;
    action: (params: AgContextMenuActionParams) => void;
};

export type AgContextMenuActionParams = {
    datum?: any;
    event: MouseEvent;
};
