import type { _EventGridApi } from '../../api/gridApi';
import type { ModuleWithApi } from '../../interfaces/iModule';
import { baseCommunityModule } from '../../interfaces/iModule';
import { ApiEventService } from './apiEventService';
import { addEventListener, addGlobalListener, removeEventListener, removeGlobalListener } from './eventApi';

export const EventApiModule: ModuleWithApi<_EventGridApi<any>> = {
    ...baseCommunityModule('EventApiModule'),
    apiFunctions: {
        addEventListener,
        addGlobalListener,
        removeEventListener,
        removeGlobalListener,
    },
    beans: [ApiEventService],
};
