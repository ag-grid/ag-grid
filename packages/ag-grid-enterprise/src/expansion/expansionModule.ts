import { defineEnterpriseModule } from '../moduleUtils';
import { ClientSideExpansionService } from './clientSideExpansionService';

export const ClientSideRowModelExpansionModule = defineEnterpriseModule('ClientSideRowModelExpansionModule', {
    rowModels: ['clientSide'],
    beans: [ClientSideExpansionService],
});
