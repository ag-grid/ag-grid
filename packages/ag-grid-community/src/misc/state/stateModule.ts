import type { _StateGridApi } from '../../api/gridApi';
import { baseCommunityModule } from '../../interfaces/iModule';
import type { Module, ModuleWithApi } from '../../interfaces/iModule';
import { getState } from './stateApi';
import { StateService } from './stateService';

export const StateCoreModule: Module = {
    ...baseCommunityModule('StateCoreModule'),
    beans: [StateService],
};

export const StateApiModule: ModuleWithApi<_StateGridApi> = {
    ...baseCommunityModule('StateApiModule'),
    apiFunctions: {
        getState,
    },
    dependsOn: [StateCoreModule],
};

export const StateModule: Module = {
    ...baseCommunityModule('StateModule'),
    dependsOn: [StateCoreModule, StateApiModule],
};
