import type { _ModuleWithoutApi } from 'ag-grid-community';
import { CellStyleModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { RowHeaderColService } from './rowHeaderColService';
import { rowHeaderColumnCSS } from './rowHeaderColumn.css-GENERATED';

/**
 * @feature Accessories -> Row Header Column
 * @gridOption enableRowHeaderColumn
 */
export const RowHeaderColumnModule: _ModuleWithoutApi = {
    moduleName: 'RowHeaderColumn',
    version: VERSION,
    beans: [RowHeaderColService],
    dependsOn: [EnterpriseCoreModule, CellStyleModule],
    css: [rowHeaderColumnCSS],
};
