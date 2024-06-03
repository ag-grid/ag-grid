import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
import { StateService } from './stateService';

export const StateModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/state',
    beans: [StateService],
};
