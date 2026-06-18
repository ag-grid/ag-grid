import type { _ModuleWithoutApi } from 'ag-grid-community';

import { SharedAggregationModule } from '../aggregation/aggregationModule';
import { VERSION } from '../version';
import { ShowValueAsService } from './showValueAsService';

/**
 * @feature Show Values As
 */
export const ShowValueAsModule: _ModuleWithoutApi = {
    moduleName: 'ShowValueAs',
    version: VERSION,
    // Client-Side Row Model only: the transform reads post-aggregate aggData materialised by the CSRM pipeline.
    rowModels: ['clientSide'],
    beans: [ShowValueAsService],
    icons: { showValueAs: 'aggregation' },
    dependsOn: [SharedAggregationModule],
};
