import type { Module } from 'ag-grid-community';

import { baseEnterpriseModule } from '../moduleUtils';
import { ClientSideExpansionService } from './clientSideExpansionService';

export const ClientSideRowModelExpansionModule: Module = {
    ...baseEnterpriseModule('ClientSideRowModelExpansionModule'),
    rowModels: ['clientSide'],
    beans: [ClientSideExpansionService],
};
