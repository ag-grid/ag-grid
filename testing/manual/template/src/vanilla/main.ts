import { AllCommunityModule, ModuleRegistry, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { gridOptions } from '../gridOptions';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const gridDiv = document.querySelector<HTMLElement>('#grid')!;
createGrid(gridDiv, gridOptions);
