import type { _ModuleWithoutApi } from 'ag-grid-community';
import { ColumnFilterModule, FloatingFilterModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { SetFilter } from './setFilter';
import { SetFloatingFilterComp } from './setFloatingFilter';

export const SetFilterCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('SetFilterCoreModule'),
    userComponents: [{ name: 'agSetColumnFilter', classImp: SetFilter }],
    dependsOn: [EnterpriseCoreModule, ColumnFilterModule],
};

const SetFloatingFilterModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('SetFloatingFilterModule'),
    userComponents: [{ name: 'agSetColumnFloatingFilter', classImp: SetFloatingFilterComp }],
    dependsOn: [SetFilterCoreModule, FloatingFilterModule],
};

export const SetFilterModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('SetFilterModule'),
    dependsOn: [SetFilterCoreModule, SetFloatingFilterModule],
};
