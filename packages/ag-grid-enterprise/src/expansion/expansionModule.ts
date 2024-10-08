import type { _ModuleWithoutApi } from 'ag-grid-community';

import { baseEnterpriseModule } from '../moduleUtils';
import { ClientSideExpansionService } from './clientSideExpansionService';

export const ClientSideRowModelExpansionModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ClientSideRowModelExpansionModule'),
    rowModels: ['clientSide'],
    beans: [ClientSideExpansionService],
};
