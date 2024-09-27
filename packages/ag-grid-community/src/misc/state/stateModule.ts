import type { _StateGridApi } from '../../api/gridApi';
import { defineCommunityModule } from '../../interfaces/iModule';
import { getState } from './stateApi';
import { StateService } from './stateService';

export const StateCoreModule = defineCommunityModule('@ag-grid-community/state-core', {
    beans: [StateService],
});

export const StateApiModule = defineCommunityModule<_StateGridApi>('@ag-grid-community/state-api', {
    apiFunctions: {
        getState,
    },
    dependsOn: [StateCoreModule],
});

export const StateModule = defineCommunityModule('@ag-grid-community/state', {
    dependsOn: [StateCoreModule, StateApiModule],
});
