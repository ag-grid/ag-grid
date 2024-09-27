import type { _ColumnMoveApi } from '../api/gridApi';
import { DragAndDropModule } from '../dragAndDrop/dragModule';
import { defineCommunityModule } from '../interfaces/iModule';
import { moveColumnByIndex, moveColumns } from './columnMoveApi';
import { ColumnMoveService } from './columnMoveService';

export const ColumnMoveCoreModule = defineCommunityModule('@ag-grid-community/column-move-core', {
    beans: [ColumnMoveService],
    dependsOn: [DragAndDropModule],
});

export const ColumnMoveApiModule = defineCommunityModule<_ColumnMoveApi>('@ag-grid-community/column-move-api', {
    apiFunctions: {
        moveColumnByIndex,
        moveColumns,
    },
    dependsOn: [ColumnMoveCoreModule],
});

export const ColumnMoveModule = defineCommunityModule('@ag-grid-community/column-move', {
    dependsOn: [ColumnMoveApiModule],
});
