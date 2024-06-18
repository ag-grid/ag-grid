import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
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

export const PaginationCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/pagination-core',
    beans: [PaginationService, PaginationAutoPageSizeService],
};

export const PaginationApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/pagination-api',
    dependantModules: [PaginationCoreModule],
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

export const PaginationModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/pagination',
    dependantModules: [PaginationCoreModule, PaginationApiModule],
};
