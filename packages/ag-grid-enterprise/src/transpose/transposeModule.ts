import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import transposeCSS from './transpose.css';
import { TransposeFieldCellRenderer } from './transposeFieldCellRenderer';
import { TransposeFieldHeader } from './transposeFieldHeader';
import { TransposeRecordHeader } from './transposeRecordHeader';
import { TransposeService } from './transposeService';

/**
 * Prototype: shows each record as a column and each field as a row.
 * @gridOption transpose
 */
export const TransposeModule: _ModuleWithoutApi = {
    moduleName: 'Transpose',
    version: VERSION,
    rowModels: ['clientSide'],
    beans: [TransposeService],
    userComponents: {
        agTransposeFieldCellRenderer: TransposeFieldCellRenderer,
        agTransposeRecordHeader: TransposeRecordHeader,
        agTransposeFieldHeader: TransposeFieldHeader,
    },
    icons: {
        groupExpanded: 'tree-open',
        groupContracted: 'tree-closed',
    },
    dependsOn: [EnterpriseCoreModule],
    css: [transposeCSS],
};
