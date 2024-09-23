import type { _ColumnMoveApi } from '../api/gridApi';
import { DragAndDropModule } from '../dragAndDrop/dragModule';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { moveColumn, moveColumnByIndex, moveColumns } from './columnMoveApi';
import { ColumnMoveService } from './columnMoveService';

export const ColumnMoveCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-move-core',
    beans: [ColumnMoveService],
    dependantModules: [DragAndDropModule],
});

export const ColumnMoveApiModule = _defineModule<_ColumnMoveApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/column-move-api',
    apiFunctions: {
        moveColumn,
        moveColumnByIndex,
        moveColumns,
    },
    dependantModules: [ColumnMoveCoreModule],
});

export const ColumnMoveModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-move',
    dependantModules: [ColumnMoveApiModule],
});
