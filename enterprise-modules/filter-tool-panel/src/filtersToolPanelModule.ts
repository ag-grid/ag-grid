import { ModuleNames, _ColumnFilterModule, _defineModule } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

import { FilterPanelTranslationService } from './new/filterPanelTranslationService';
import { WrapperToolPanel } from './new/wrapperToolPanel';
import { VERSION } from './version';

export const FilterPanelModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-enterprise/filter-panel',
    beans: [FilterPanelTranslationService],
});

export const FiltersToolPanelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    userComponents: [{ name: 'agFiltersToolPanel', classImp: WrapperToolPanel }],
    dependantModules: [SideBarModule, EnterpriseCoreModule, _ColumnFilterModule, FilterPanelModule],
});
