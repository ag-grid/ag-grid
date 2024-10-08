import type { _PaginationGridApi } from '../api/gridApi';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { baseCommunityModule } from '../interfaces/iModule';
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

export const PaginationCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('PaginationCoreModule'),
    beans: [PaginationService, PaginationAutoPageSizeService],
};

export const PaginationApiModule: _ModuleWithApi<_PaginationGridApi> = {
    ...baseCommunityModule('PaginationApiModule'),
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
};

export const PaginationModule: _ModuleWithoutApi = {
    ...baseCommunityModule('PaginationModule'),
    dependsOn: [PaginationCoreModule, PaginationApiModule],
};
