import type { _EventGridApi } from '../../api/gridApi';
import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { ApiEventService } from './apiEventService';
import { addEventListener, addGlobalListener, removeEventListener, removeGlobalListener } from './eventApi';

export const EventApiModule = _defineModule<_EventGridApi<any>>({
    version: VERSION,
    moduleName: '@ag-grid-community/event-api',
    apiFunctions: {
        addEventListener,
        addGlobalListener,
        removeEventListener,
        removeGlobalListener,
    },
    beans: [ApiEventService],
});
