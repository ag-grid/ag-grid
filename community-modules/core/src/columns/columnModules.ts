import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
import { DataTypeService } from './dataTypeService';

export const DataTypeModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/data-type',
    beans: [DataTypeService],
};
