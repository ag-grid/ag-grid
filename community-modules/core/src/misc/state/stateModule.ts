import type { StateGridApi } from '../../api/gridApi';
import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { getState } from './stateApi';
import { StateService } from './stateService';

export const StateCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/state-core',
    beans: [StateService],
});

export const StateApiModule = _defineModule<StateGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/state-api',
    apiFunctions: {
        getState,
    },
    dependantModules: [StateCoreModule],
});

export const StateModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/state',
    dependantModules: [StateCoreModule, StateApiModule],
});
