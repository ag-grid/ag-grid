import { defineEnterpriseModule } from '../moduleUtils';
import { ClientSideExpansionService } from './clientSideExpansionService';

export const ClientSideRowModelExpansionModule = defineEnterpriseModule(
    '@ag-grid-enterprise/client-side-row-model-expansion',
    {
        rowModel: 'clientSide',
        beans: [ClientSideExpansionService],
    }
);
