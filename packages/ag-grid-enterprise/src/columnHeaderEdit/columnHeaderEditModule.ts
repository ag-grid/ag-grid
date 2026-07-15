import type { _Module } from 'ag-grid-community';
import { _PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import columnHeaderEditCSS from './columnHeaderEdit.css';
import { ColumnHeaderEditService } from './columnHeaderEditService';

/**
 * @feature Columns -> Editable Header Name
 * @colDef editableHeaderName
 */
export const ColumnHeaderEditModule: _Module = {
    moduleName: 'ColumnHeaderEdit',
    version: VERSION,
    beans: [ColumnHeaderEditService],
    dependsOn: [EnterpriseCoreModule, _PopupModule],
    icons: {
        columnHeaderEdit: 'edit',
    },
    css: [columnHeaderEditCSS],
};
