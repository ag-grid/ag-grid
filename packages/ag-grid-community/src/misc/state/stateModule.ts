import type { _StateGridApi } from '../../api/gridApi';
import { defineCommunityModule } from '../../interfaces/iModule';
import { getState } from './stateApi';
import { StateService } from './stateService';

export const StateCoreModule = defineCommunityModule('StateCoreModule', {
    beans: [StateService],
});

export const StateApiModule = defineCommunityModule<_StateGridApi>('StateApiModule', {
    apiFunctions: {
        getState,
    },
    dependsOn: [StateCoreModule],
});

export const StateModule = defineCommunityModule('StateModule', {
    dependsOn: [StateCoreModule, StateApiModule],
});
