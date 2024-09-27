import type { _PaginationGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import {
    paginationGetCurrentPage,
    paginationGetPageSize,
    paginationGetRowCount,
    paginationGetTotalPages,
    paginationGoToFirstPage,
    paginationGoToLastPage,
    paginationGoToNextPage,
    paginationGoToPage,
    paginationGoToPreviousPage,
    paginationIsLastPageFound,
} from './paginationApi';
import { PaginationAutoPageSizeService } from './paginationAutoPageSizeService';
import { PaginationService } from './paginationService';

export const PaginationCoreModule = defineCommunityModule('PaginationCoreModule', {
    beans: [PaginationService, PaginationAutoPageSizeService],
});

export const PaginationApiModule = defineCommunityModule<_PaginationGridApi>('PaginationApiModule', {
    dependsOn: [PaginationCoreModule],
    apiFunctions: {
        paginationIsLastPageFound,
        paginationGetPageSize,
        paginationGetCurrentPage,
        paginationGetTotalPages,
        paginationGetRowCount,
        paginationGoToNextPage,
        paginationGoToPreviousPage,
        paginationGoToFirstPage,
        paginationGoToLastPage,
        paginationGoToPage,
    },
});

export const PaginationModule = defineCommunityModule('PaginationModule', {
    dependsOn: [PaginationCoreModule, PaginationApiModule],
});
