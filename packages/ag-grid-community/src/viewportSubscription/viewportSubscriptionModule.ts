import type { _ViewportSubscriptionGridApi } from '../api/gridApi';
import type { _ModuleWithApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { subscribeToViewport, unsubscribeFromViewport } from './viewportSubscriptionApi';
import { ViewportSubscriptionService } from './viewportSubscriptionService';

/**
 * @feature API -> Viewport Subscription
 * @gridOption viewportSubscription
 */
export const ViewportSubscriptionModule: _ModuleWithApi<_ViewportSubscriptionGridApi> = {
    moduleName: 'ViewportSubscription',
    version: VERSION,
    beans: [ViewportSubscriptionService],
    apiFunctions: {
        subscribeToViewport,
        unsubscribeFromViewport,
    },
};
