import { ColumnModel } from "../columns/columnModel";
import { HorizontalDirection } from "../constants/direction";
import { CtrlsService } from "../ctrlsService";
import { Column, ColumnPinnedType } from "../entities/column";
import { ColumnEventType } from "../events";
import { GridOptionsService } from "../gridOptionsService";
export declare class ColumnMoveHelper {
    static attemptMoveColumns(params: {
        allMovingColumns: Column[];
        isFromHeader: boolean;
        hDirection?: HorizontalDirection;
        xPosition: number;
        fromEnter: boolean;
        fakeEvent: boolean;
        pinned: ColumnPinnedType;
        gos: GridOptionsService;
        columnModel: ColumnModel;
    }): {
        columns: Column[];
        toIndex: number;
    } | null | undefined;
    static moveColumns(columns: Column[], toIndex: number, source: ColumnEventType, finished: boolean, columnModel: ColumnModel): {
        columns: Column[];
        toIndex: number;
    } | null;
    private static calculateOldIndex;
    private static groupFragCount;
    private static getDisplayedColumns;
    private static calculateValidMoves;
    static normaliseX(x: number, pinned: ColumnPinnedType, fromKeyboard: boolean, gos: GridOptionsService, ctrlsService: CtrlsService): number;
}
