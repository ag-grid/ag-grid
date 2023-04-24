import { _ModuleSupport } from 'ag-charts-community';

export const MY_MODULE: _ModuleSupport.Module = {
    chartTypes: ['cartesian'],
    optionsKey: 'my-module',
    initialiseModule(ctx) {
        return {
            instance: {
                update() {},
                destroy() {},
            },
        };
    },
};
