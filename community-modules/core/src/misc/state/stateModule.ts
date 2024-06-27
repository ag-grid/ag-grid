import type { Module } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { getState } from './stateApi';
import { StateService } from './stateService';

export const StateCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/state-core',
    beans: [StateService],
};

export const StateApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/state-api',
    apiFunctions: {
        getState,
    },
    dependantModules: [StateCoreModule],
};

export const StateModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/state',
    dependantModules: [StateCoreModule, StateApiModule],
};
