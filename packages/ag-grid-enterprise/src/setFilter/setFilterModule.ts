import { ColumnFilterModule, FloatingFilterModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { SetFilter } from './setFilter';
import { SetFloatingFilterComp } from './setFloatingFilter';

export const SetFilterCoreModule = defineEnterpriseModule(`${ModuleNames.SetFilterModule}-core`, {
    userComponents: [{ name: 'agSetColumnFilter', classImp: SetFilter }],
    dependsOn: [EnterpriseCoreModule, ColumnFilterModule],
});

const SetFloatingFilterModule = defineEnterpriseModule('@ag-grid-enterprise/set-floating-filter', {
    userComponents: [{ name: 'agSetColumnFloatingFilter', classImp: SetFloatingFilterComp }],
    dependsOn: [SetFilterCoreModule, FloatingFilterModule],
});

export const SetFilterModule = defineEnterpriseModule(ModuleNames.SetFilterModule, {
    dependsOn: [SetFilterCoreModule, SetFloatingFilterModule],
});
