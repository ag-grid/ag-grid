import type { _EventGridApi } from '../../api/gridApi';
import { defineCommunityModule } from '../../interfaces/iModule';
import { ApiEventService } from './apiEventService';
import { addEventListener, addGlobalListener, removeEventListener, removeGlobalListener } from './eventApi';

export const EventApiModule = defineCommunityModule<_EventGridApi<any>>('EventApiModule', {
    apiFunctions: {
        addEventListener,
        addGlobalListener,
        removeEventListener,
        removeGlobalListener,
    },
    beans: [ApiEventService],
});
