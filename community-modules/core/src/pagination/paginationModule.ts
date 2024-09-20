import type { _PaginationGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import {
    paginationGetCurrentPage,
    paginationGetPageCount,
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

export const PaginationCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/pagination-core',
    beans: [PaginationService, PaginationAutoPageSizeService],
});

export const PaginationApiModule = _defineModule<_PaginationGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/pagination-api',
    dependantModules: [PaginationCoreModule],
    apiFunctions: {
        paginationIsLastPageFound,
        paginationGetPageSize,
        paginationGetCurrentPage,
        paginationGetTotalPages,
        paginationGetRowCount,
        paginationGetPageCount,
        paginationGoToNextPage,
        paginationGoToPreviousPage,
        paginationGoToFirstPage,
        paginationGoToLastPage,
        paginationGoToPage,
    },
});

export const PaginationModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/pagination',
    dependantModules: [PaginationCoreModule, PaginationApiModule],
});
