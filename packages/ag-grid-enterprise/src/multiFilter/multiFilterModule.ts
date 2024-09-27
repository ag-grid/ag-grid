import { ColumnFilterModule, ModuleNames, ReadOnlyFloatingFilterModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { MultiFilter } from './multiFilter';
import { MultiFloatingFilterComp } from './multiFloatingFilter';

export const MultiFilterCoreModule = defineEnterpriseModule(`${ModuleNames.MultiFilterModule}-core`, {
    userComponents: [
        { name: 'agMultiColumnFilter', classImp: MultiFilter },
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependsOn: [EnterpriseCoreModule, ColumnFilterModule],
});

const MultiFloatingFilterModule = defineEnterpriseModule('@ag-grid-enterprise/multi-floating-filter', {
    userComponents: [{ name: 'agMultiColumnFloatingFilter', classImp: MultiFloatingFilterComp }],
    dependsOn: [MultiFilterCoreModule, ReadOnlyFloatingFilterModule],
});

export const MultiFilterModule = defineEnterpriseModule(ModuleNames.MultiFilterModule, {
    dependsOn: [MultiFilterCoreModule, MultiFloatingFilterModule],
});
