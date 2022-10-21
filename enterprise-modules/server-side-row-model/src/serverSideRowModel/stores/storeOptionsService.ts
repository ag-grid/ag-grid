import { GridOptionsService, GridOptionsWrapper, _ } from "@ag-grid-community/core";

export function isServerSideSortOnServer(gridOptionsService: GridOptionsService, gridOptionsWrapper: GridOptionsWrapper) {
    const isEnabled = gridOptionsService.is('serverSideSortOnServer');

    if (!gridOptionsWrapper.isRowModelServerSide() && isEnabled) {
        _.doOnce(() => console.warn('AG Grid: The `serverSideSortOnServer` property can only be used with the server side row model.'), 'serverSideSortOnServerRowModel');
        return false;
    }

    if (gridOptionsService.is('treeData') && isEnabled) {
        _.doOnce(() => console.warn('AG Grid: The `serverSideSortOnServer` property cannot be used while using tree data.'), 'serverSideSortOnServerTreeData');
        return false;
    }

    return isEnabled;
}

export function isServerSideFilterOnServer(gridOptionsService: GridOptionsService, gridOptionsWrapper: GridOptionsWrapper) {
    const isEnabled = gridOptionsService.is('serverSideSortOnServer');

    if (!gridOptionsWrapper.isRowModelServerSide() && isEnabled) {
        _.doOnce(() => console.warn('AG Grid: The `serverSideFilterOnServer` property can only be used with the server side row model.'), 'serverSideFilterOnServerRowModel');
        return false;
    }

    if (gridOptionsService.is('treeData') && isEnabled) {
        _.doOnce(() => console.warn('AG Grid: The `serverSideFilterOnServer` property cannot be used while using tree data.'), 'serverSideFilterOnServerTreeData');
        return false;
    }

    return isEnabled;
}

export function isServerSideSortAllLevels(gridOptionsService: GridOptionsService, gridOptionsWrapper: GridOptionsWrapper) {
    const isEnabled = gridOptionsService.is('serverSideSortAllLevels');
    if (!gridOptionsWrapper.isRowModelServerSide() && isEnabled) {
        _.doOnce(() => console.warn('AG Grid: The `serverSideSortAllLevels` property can only be used with the server side row model.'), 'serverSideSortAllLevels');
        return false;
    }
    return isEnabled;
}

export function isServerSideFilterAllLevels(gridOptionsService: GridOptionsService, gridOptionsWrapper: GridOptionsWrapper) {
    const isEnabled = gridOptionsService.is('serverSideFilterAllLevels');
    if (!gridOptionsWrapper.isRowModelServerSide() && isEnabled) {
        _.doOnce(() => console.warn('AG Grid: The `serverSideFilterAllLevels` property can only be used with the server side row model.'), 'serverSideFilterAllLevels');
        return false;
    }
    return isEnabled;
}