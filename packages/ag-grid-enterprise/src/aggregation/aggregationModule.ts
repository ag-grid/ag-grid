import type { _ModuleWithoutApi } from 'ag-grid-community';

import { baseEnterpriseModule } from '../moduleUtils';
import { AggColumnNameService } from './aggColumnNameService';

export const AggregationModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('AggregationModule'),
    beans: [AggColumnNameService],
};
