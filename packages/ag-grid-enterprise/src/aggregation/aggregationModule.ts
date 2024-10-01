import { defineEnterpriseModule } from '../moduleUtils';
import { AggColumnNameService } from './aggColumnNameService';

export const AggregationModule = defineEnterpriseModule('AggregationModule', {
    beans: [AggColumnNameService],
});
