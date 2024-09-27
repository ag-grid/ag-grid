import type { _SortGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { RowNodeSorter } from './rowNodeSorter';
import { onSortChanged } from './sortApi';
import { SortController } from './sortController';
import { SortIndicatorComp } from './sortIndicatorComp';

export const SortCoreModule = defineCommunityModule('@ag-grid-community/sort-core', {
    beans: [SortController, RowNodeSorter],
});

export const SortIndicatorCompModule = defineCommunityModule('@ag-grid-community/sort-indicator-comp', {
    userComponents: [
        {
            classImp: SortIndicatorComp,
            name: 'agSortIndicator',
        },
    ],
    dependsOn: [SortCoreModule],
});

export const SortApiModule = defineCommunityModule<_SortGridApi>('@ag-grid-community/sort-api', {
    apiFunctions: {
        onSortChanged,
    },
    dependsOn: [SortCoreModule],
});

export const SortModule = defineCommunityModule('@ag-grid-community/sort', {
    dependsOn: [SortApiModule, SortIndicatorCompModule],
});
