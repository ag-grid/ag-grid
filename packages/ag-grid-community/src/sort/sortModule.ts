import type { _SortGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { RowNodeSorter } from './rowNodeSorter';
import { onSortChanged } from './sortApi';
import { SortController } from './sortController';
import { SortIndicatorComp } from './sortIndicatorComp';

export const SortCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/sort-core',
    beans: [SortController, RowNodeSorter],
});

export const SortIndicatorCompModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/sort-indicator-comp',
    userComponents: [
        {
            classImp: SortIndicatorComp,
            name: 'agSortIndicator',
        },
    ],
    dependantModules: [SortCoreModule],
});

export const SortApiModule = _defineModule<_SortGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/sort-api',
    apiFunctions: {
        onSortChanged,
    },
    dependantModules: [SortCoreModule],
});

export const SortModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/sort',
    dependantModules: [SortApiModule, SortIndicatorCompModule],
});
