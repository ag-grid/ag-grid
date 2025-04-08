import type { FilterWrapperParams, _ModuleWithoutApi } from 'ag-grid-community';
import { _ColumnFilterModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { MenuItemModule } from '../widgets/menuItemModule';
import { MultiFilter } from './multiFilter';
import { MultiFilterEvaluator } from './multiFilterEvaluator';
import { MultiFilterUi } from './multiFilterUi';
import { MultiFloatingFilterComp } from './multiFloatingFilter';

/**
 * @feature Filtering -> Multi Filter
 */
export const MultiFilterModule: _ModuleWithoutApi = {
    moduleName: 'MultiFilter',
    version: VERSION,
    userComponents: {
        agMultiColumnFilter: {
            getComp: (beans) =>
                beans.gos.getAsBool('enableFilterEvaluators')
                    ? {
                          classImp: MultiFilterUi,
                          params: {
                              useForm: true,
                          } as FilterWrapperParams,
                      }
                    : MultiFilter,
        },
        agMultiColumnFloatingFilter: MultiFloatingFilterComp,
    },
    dynamicBeans: {
        agMultiColumnFilterEvaluator: MultiFilterEvaluator,
    },
    dependsOn: [EnterpriseCoreModule, _ColumnFilterModule, MenuItemModule],
};
