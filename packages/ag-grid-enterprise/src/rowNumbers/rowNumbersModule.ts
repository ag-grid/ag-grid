import type { _ModuleWithoutApi } from 'ag-grid-community';
import { CellStyleModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { rowNumbersCSS } from './rowNumbers.css-GENERATED';
import { RowNumbersService } from './rowNumbersService';

/**
 * @feature Rows -> Row Numbers
 * @gridOption rowNumbers
 */
export const RowNumbersModule: _ModuleWithoutApi = {
    moduleName: 'RowNumbers',
    version: VERSION,
    beans: [RowNumbersService],
    dependsOn: [EnterpriseCoreModule, CellStyleModule],
    css: [rowNumbersCSS],
};
