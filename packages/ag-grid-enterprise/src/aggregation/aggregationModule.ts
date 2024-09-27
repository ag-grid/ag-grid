import { defineEnterpriseModule } from '../moduleUtils';
import { AggColumnNameService } from './aggColumnNameService';

export const AggregationModule = defineEnterpriseModule('@ag-grid-enterprise/aggregation', {
    beans: [AggColumnNameService],
});
