import type { _StateGridApi } from '../../api/gridApi';
import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../../interfaces/iModule';
import { getState } from './stateApi';
import { StateService } from './stateService';

export const StateCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('StateCoreModule'),
    beans: [StateService],
};

export const StateApiModule: _ModuleWithApi<_StateGridApi> = {
    ...baseCommunityModule('StateApiModule'),
    apiFunctions: {
        getState,
    },
    dependsOn: [StateCoreModule],
};

export const StateModule: _ModuleWithoutApi = {
    ...baseCommunityModule('StateModule'),
    dependsOn: [StateCoreModule, StateApiModule],
};
