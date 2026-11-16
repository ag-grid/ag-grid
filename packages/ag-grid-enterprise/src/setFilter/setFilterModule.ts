import type { FilterWrapperParams, _ModuleWithoutApi } from 'ag-grid-community';
import { _ColumnFilterModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { SetFilter } from './setFilter';
import { SetFilterHandler } from './setFilterHandler';
import { SetFilterService } from './setFilterService';
import { applyExcelModeOptions } from './setFilterUtils';
import { SetFloatingFilterComp } from './setFloatingFilter';

/**
 * @feature Filtering -> Set Filter
 */
export const SetFilterModule: _ModuleWithoutApi = {
    moduleName: 'SetFilter',
    version: VERSION,
    beans: [SetFilterService],
    userComponents: {
        agSetColumnFilter: {
            classImp: SetFilter,
            params: {
                useForm: true,
            } as FilterWrapperParams,
            processParams: (params, beans) => {
                applyExcelModeOptions(params, beans);
                return params;
            },
        },
        agSetColumnFloatingFilter: SetFloatingFilterComp,
    },
    dynamicBeans: {
        agSetColumnFilterHandler: SetFilterHandler,
    },
    dependsOn: [EnterpriseCoreModule, _ColumnFilterModule],
};
