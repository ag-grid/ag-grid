import type { _ColumnMoveApi } from '../api/gridApi';
import { DragAndDropModule } from '../dragAndDrop/dragModule';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { moveColumnByIndex, moveColumns } from './columnMoveApi';
import { ColumnMoveService } from './columnMoveService';

export const ColumnMoveCoreModule: Module = {
    ...baseCommunityModule('ColumnMoveCoreModule'),
    beans: [ColumnMoveService],
    dependsOn: [DragAndDropModule],
};

export const ColumnMoveApiModule: ModuleWithApi<_ColumnMoveApi> = {
    ...baseCommunityModule('ColumnMoveApiModule'),
    apiFunctions: {
        moveColumnByIndex,
        moveColumns,
    },
    dependsOn: [ColumnMoveCoreModule],
};

export const ColumnMoveModule: Module = {
    ...baseCommunityModule('ColumnMoveModule'),
    dependsOn: [ColumnMoveApiModule],
};
