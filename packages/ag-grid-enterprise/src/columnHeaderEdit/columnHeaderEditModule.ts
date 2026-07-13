import type { _ColumnHeaderEditGridApi, _ModuleWithApi } from 'ag-grid-community';
import { _PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import columnHeaderEditCSS from './columnHeaderEdit.css';
import { setColumnHeaderName } from './columnHeaderEditApi';
import { ColumnHeaderEditService } from './columnHeaderEditService';

/**
 * @feature Columns -> Editable Header Name
 * @colDef editableHeaderName
 */
export const ColumnHeaderEditModule: _ModuleWithApi<_ColumnHeaderEditGridApi> = {
    moduleName: 'ColumnHeaderEdit',
    version: VERSION,
    beans: [ColumnHeaderEditService],
    apiFunctions: {
        setColumnHeaderName,
    },
    dependsOn: [EnterpriseCoreModule, _PopupModule],
    css: [columnHeaderEditCSS],
};
