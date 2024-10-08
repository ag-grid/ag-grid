import type { _ColumnMoveApi } from '../api/gridApi';
import { DragAndDropModule } from '../dragAndDrop/dragModule';
import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { moveColumnByIndex, moveColumns } from './columnMoveApi';
import { ColumnMoveService } from './columnMoveService';

export const ColumnMoveCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnMoveCoreModule'),
    beans: [ColumnMoveService],
    dependsOn: [DragAndDropModule],
};

export const ColumnMoveApiModule: _ModuleWithApi<_ColumnMoveApi> = {
    ...baseCommunityModule('ColumnMoveApiModule'),
    apiFunctions: {
        moveColumnByIndex,
        moveColumns,
    },
    dependsOn: [ColumnMoveCoreModule],
};

export const ColumnMoveModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnMoveModule'),
    dependsOn: [ColumnMoveApiModule],
};
