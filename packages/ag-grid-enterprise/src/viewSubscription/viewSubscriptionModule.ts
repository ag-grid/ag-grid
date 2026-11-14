import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { ViewSubscriptionService } from './viewSubscriptionService';

/**
 * @feature API -> View Subscription
 * @gridOption viewSubscription
 */
export const ViewSubscriptionModule: _ModuleWithoutApi = {
    moduleName: 'ViewSubscription',
    version: VERSION,
    beans: [ViewSubscriptionService],
    dependsOn: [EnterpriseCoreModule],
};
