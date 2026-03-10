import type { _ColumnMoveApi } from '../api/gridApi';
import { SharedDragAndDropModule } from '../dragAndDrop/dragModule';
import type { _ModuleWithApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import columnMovingCSS from './column-moving.css';
import { ColumnAnimationService } from './columnAnimationService';
import { moveColumnByIndex, moveColumns } from './columnMoveApi';
import { ColumnMoveService } from './columnMoveService';

/**
 * @feature Columns -> Column Moving
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const ColumnMoveModule: _ModuleWithApi<_ColumnMoveApi> = {
    moduleName: 'ColumnMove',
    version: VERSION,
    beans: [ColumnMoveService, ColumnAnimationService],
    apiFunctions: {
        moveColumnByIndex,
        moveColumns,
    },
    dependsOn: [SharedDragAndDropModule],
    css: [columnMovingCSS],
};
