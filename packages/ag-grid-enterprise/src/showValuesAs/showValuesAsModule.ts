import type { _ModuleWithoutApi } from 'ag-grid-community';

import { AggregationStageModule } from '../aggregation/aggregationModule';
import { VERSION } from '../version';
import { ShowValuesAsService } from './showValuesAsService';

/**
 * @feature Show Values As
 */
export const ShowValuesAsModule: _ModuleWithoutApi = {
    moduleName: 'ShowValuesAs',
    version: VERSION,
    // Client-Side Row Model only: the transform reads post-aggregate aggData materialised by the CSRM pipeline.
    rowModels: ['clientSide'],
    beans: [ShowValuesAsService],
    icons: { showValuesAs: 'values-as' },
    // The transform reads aggData, which only AggregationStage writes: without it every cell is blank.
    dependsOn: [AggregationStageModule],
};
