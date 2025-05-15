import type { _StateGridApi } from '../../api/gridApi';
import type { _ModuleWithApi } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { getState, setState } from './stateApi';
import { StateService } from './stateService';

/**
 * @feature API -> Grid State
 * @gridOption initialState
 */
export const GridStateModule: _ModuleWithApi<_StateGridApi> = {
    moduleName: 'GridState',
    version: VERSION,
    beans: [StateService],
    apiFunctions: {
        getState,
        setState,
    },
};
