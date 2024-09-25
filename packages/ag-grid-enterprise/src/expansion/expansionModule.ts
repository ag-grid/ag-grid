import { _defineModule } from 'ag-grid-community';

import { VERSION } from '../version';
import { ClientSideExpansionService } from './clientSideExpansionService';

export const ClientSideRowModelExpansionModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/client-side-row-model-expansion',
    rowModel: 'clientSide',
    beans: [ClientSideExpansionService],
});
