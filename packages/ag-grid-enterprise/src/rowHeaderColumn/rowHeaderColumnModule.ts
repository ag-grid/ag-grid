import type { _ModuleWithoutApi } from 'ag-grid-community';
import { _DragModule, _KeyboardNavigationModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { RowHeaderColService } from './rowHeaderColService';
import { rowHeaderColumnCSS } from './rowHeaderColumn.css-GENERATED';

/**
 * @feature Selection -> Cell Selection
 * @gridOption cellSelection
 */
export const RowHeaderColumnModule: _ModuleWithoutApi = {
    moduleName: 'RowHeaderColumn',
    version: VERSION,
    beans: [RowHeaderColService],
    dependsOn: [EnterpriseCoreModule, _KeyboardNavigationModule, _DragModule],
    css: [rowHeaderColumnCSS],
};
