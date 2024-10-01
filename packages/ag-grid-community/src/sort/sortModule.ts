import type { _SortGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { RowNodeSorter } from './rowNodeSorter';
import { onSortChanged } from './sortApi';
import { SortController } from './sortController';
import { SortIndicatorComp } from './sortIndicatorComp';

export const SortCoreModule = defineCommunityModule('SortCoreModule', {
    beans: [SortController, RowNodeSorter],
});

export const SortIndicatorCompModule = defineCommunityModule('SortIndicatorCompModule', {
    userComponents: [
        {
            classImp: SortIndicatorComp,
            name: 'agSortIndicator',
        },
    ],
    dependsOn: [SortCoreModule],
});

export const SortApiModule = defineCommunityModule<_SortGridApi>('SortApiModule', {
    apiFunctions: {
        onSortChanged,
    },
    dependsOn: [SortCoreModule],
});

export const SortModule = defineCommunityModule('SortModule', {
    dependsOn: [SortApiModule, SortIndicatorCompModule],
});
