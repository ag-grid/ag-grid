import type { Module } from 'ag-grid-community';

import { baseEnterpriseModule } from '../moduleUtils';
import { AggColumnNameService } from './aggColumnNameService';

export const AggregationModule: Module = {
    ...baseEnterpriseModule('AggregationModule'),
    beans: [AggColumnNameService],
};
