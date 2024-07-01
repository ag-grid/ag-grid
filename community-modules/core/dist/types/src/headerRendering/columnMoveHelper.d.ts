import type { ColumnModel } from '../columns/columnModel';
import type { ColumnMoveService } from '../columns/columnMoveService';
import type { VisibleColsService } from '../columns/visibleColsService';
import { HorizontalDirection } from '../constants/direction';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import type { ColumnPinnedType } from '../interfaces/iColumn';
export declare function attemptMoveColumns(params: {
    allMovingColumns: AgColumn[];
    isFromHeader: boolean;
    hDirection?: HorizontalDirection;
    xPosition: number;
    fromEnter: boolean;
    fakeEvent: boolean;
    pinned: ColumnPinnedType;
    gos: GridOptionsService;
    columnModel: ColumnModel;
    columnMoveService: ColumnMoveService;
    presentedColsService: VisibleColsService;
}): {
    columns: AgColumn[];
    toIndex: number;
} | null | undefined;
export declare function moveColumns(columns: AgColumn[], toIndex: number, source: ColumnEventType, finished: boolean, columnMoveService: ColumnMoveService): {
    columns: AgColumn[];
    toIndex: number;
} | null;
export declare function normaliseX(x: number, pinned: ColumnPinnedType, fromKeyboard: boolean, gos: GridOptionsService, ctrlsService: CtrlsService): number;
