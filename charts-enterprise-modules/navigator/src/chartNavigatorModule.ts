import { _ModuleSupport } from 'ag-charts-community';
import { Navigator } from './navigator';

export const CHART_NAVIGATOR_MODULE: _ModuleSupport.Module = {
    optionsKey: 'navigator',
    initialiseModule(ctx) {
        return {
            instance: new Navigator(ctx),
        };
    },
};
