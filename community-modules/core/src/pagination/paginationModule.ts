import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
import { PaginationAutoPageSizeService } from './paginationAutoPageSizeService';
import { PaginationService } from './paginationService';

export const PaginationModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/pagination',
    beans: [PaginationService, PaginationAutoPageSizeService],
};
