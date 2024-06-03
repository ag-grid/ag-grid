import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
import { RowNodeBlockLoader } from './rowNodeBlockLoader';

export const RowNodeBlockModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/row-node-block',
    beans: [RowNodeBlockLoader],
};
