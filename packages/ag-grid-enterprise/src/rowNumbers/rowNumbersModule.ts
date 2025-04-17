import type { _ModuleWithoutApi } from 'ag-grid-community';
import { CellStyleModule, _SharedDragAndDropModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { rowNumbersCSS } from './rowNumbers.css-GENERATED';
import { AgRowNumbersRowResizer } from './rowNumbersRowResizer';
import { RowNumbersService } from './rowNumbersService';

/**
 * @feature Rows -> Row Numbers
 * @gridOption rowNumbers
 */
export const RowNumbersModule: _ModuleWithoutApi = {
    moduleName: 'RowNumbers',
    version: VERSION,
    beans: [RowNumbersService],
    dynamicBeans: { rowNumberRowResizer: AgRowNumbersRowResizer as any },
    dependsOn: [EnterpriseCoreModule, CellStyleModule, _SharedDragAndDropModule],
    css: [rowNumbersCSS],
};
