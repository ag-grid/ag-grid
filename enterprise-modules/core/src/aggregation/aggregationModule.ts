import { _defineModule } from '@ag-grid-community/core';

import { VERSION } from '../version';
import { AggColumnNameService } from './aggColumnNameService';

export const AggregationModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/aggregation',
    beans: [AggColumnNameService],
});
