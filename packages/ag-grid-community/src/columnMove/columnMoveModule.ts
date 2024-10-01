import type { _ColumnMoveApi } from '../api/gridApi';
import { DragAndDropModule } from '../dragAndDrop/dragModule';
import { defineCommunityModule } from '../interfaces/iModule';
import { moveColumnByIndex, moveColumns } from './columnMoveApi';
import { ColumnMoveService } from './columnMoveService';

export const ColumnMoveCoreModule = defineCommunityModule('ColumnMoveCoreModule', {
    beans: [ColumnMoveService],
    dependsOn: [DragAndDropModule],
});

export const ColumnMoveApiModule = defineCommunityModule<_ColumnMoveApi>('ColumnMoveApiModule', {
    apiFunctions: {
        moveColumnByIndex,
        moveColumns,
    },
    dependsOn: [ColumnMoveCoreModule],
});

export const ColumnMoveModule = defineCommunityModule('ColumnMoveModule', {
    dependsOn: [ColumnMoveApiModule],
});
