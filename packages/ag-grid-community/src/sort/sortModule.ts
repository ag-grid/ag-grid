import type { _SortGridApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { RowNodeSorter } from './rowNodeSorter';
import { onSortChanged } from './sortApi';
import { SortController } from './sortController';
import { SortIndicatorComp } from './sortIndicatorComp';

export const SortCoreModule: Module = {
    ...baseCommunityModule('SortCoreModule'),
    beans: [SortController, RowNodeSorter],
};

export const SortIndicatorCompModule: Module = {
    ...baseCommunityModule('SortIndicatorCompModule'),
    userComponents: [
        {
            classImp: SortIndicatorComp,
            name: 'agSortIndicator',
        },
    ],
    dependsOn: [SortCoreModule],
};

export const SortApiModule: ModuleWithApi<_SortGridApi> = {
    ...baseCommunityModule('SortApiModule'),
    apiFunctions: {
        onSortChanged,
    },
    dependsOn: [SortCoreModule],
};

export const SortModule: Module = {
    ...baseCommunityModule('SortModule'),
    dependsOn: [SortApiModule, SortIndicatorCompModule],
};
