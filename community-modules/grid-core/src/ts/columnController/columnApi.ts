import { ColDef, ColGroupDef } from "../entities/colDef";
import { ColumnGroupChild } from "../entities/columnGroupChild";
import { ColumnController, ColumnState } from "./columnController";
import { OriginalColumnGroup } from "../entities/originalColumnGroup";
import { ColumnGroup } from "../entities/columnGroup";
import { Column } from "../entities/column";
import { Autowired, Bean } from "../context/context";

@Bean('columnApi')
export class ColumnApi {

    @Autowired('columnController') private columnController: ColumnController;

    public sizeColumnsToFit(gridWidth: any): void { this.columnController.sizeColumnsToFit(gridWidth, 'api'); }
    public setColumnGroupOpened(group: OriginalColumnGroup | string, newValue: boolean): void { this.columnController.setColumnGroupOpened(group, newValue, 'api'); }
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup { return this.columnController.getColumnGroup(name, instanceId); }
    public getOriginalColumnGroup(name: string): OriginalColumnGroup { return this.columnController.getOriginalColumnGroup(name); }

    public getDisplayNameForColumn(column: Column, location: string | null): string { return this.columnController.getDisplayNameForColumn(column, location); }
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: string): string { return this.columnController.getDisplayNameForColumnGroup(columnGroup, location); }

    public getColumn(key: any): Column { return this.columnController.getPrimaryColumn(key); }
    public setColumnState(columnState: ColumnState[]): boolean { return this.columnController.setColumnState(columnState, false, 'api'); }
    public getColumnState(): ColumnState[] { return this.columnController.getColumnState(); }
    public resetColumnState(): void { this.columnController.resetColumnState(false, 'api'); }
    public getColumnGroupState(): {groupId: string, open: boolean}[] {return this.columnController.getColumnGroupState(); }
    public setColumnGroupState(stateItems: ({groupId: string, open: boolean})[]): void {this.columnController.setColumnGroupState(stateItems, 'api'); }
    public resetColumnGroupState(): void { this.columnController.resetColumnGroupState('api'); }

    public isPinning(): boolean { return this.columnController.isPinningLeft() || this.columnController.isPinningRight(); }
    public isPinningLeft(): boolean { return this.columnController.isPinningLeft(); }
    public isPinningRight(): boolean { return this.columnController.isPinningRight(); }
    public getDisplayedColAfter(col: Column): Column { return this.columnController.getDisplayedColAfter(col); }
    public getDisplayedColBefore(col: Column): Column { return this.columnController.getDisplayedColBefore(col); }
    public setColumnVisible(key: string | Column, visible: boolean): void { this.columnController.setColumnVisible(key, visible, 'api'); }
    public setColumnsVisible(keys: (string | Column)[], visible: boolean): void { this.columnController.setColumnsVisible(keys, visible, 'api'); }
    public setColumnPinned(key: string | Column, pinned: string): void { this.columnController.setColumnPinned(key, pinned, 'api'); }
    public setColumnsPinned(keys: (string | Column)[], pinned: string): void { this.columnController.setColumnsPinned(keys, pinned, 'api'); }

    public getAllColumns(): Column[] { return this.columnController.getAllPrimaryColumns(); }
    public getAllGridColumns(): Column[] { return this.columnController.getAllGridColumns(); }
    public getDisplayedLeftColumns(): Column[] { return this.columnController.getDisplayedLeftColumns(); }
    public getDisplayedCenterColumns(): Column[] { return this.columnController.getDisplayedCenterColumns(); }
    public getDisplayedRightColumns(): Column[] { return this.columnController.getDisplayedRightColumns(); }
    public getAllDisplayedColumns(): Column[] { return this.columnController.getAllDisplayedColumns(); }
    public getAllDisplayedVirtualColumns(): Column[] { return this.columnController.getAllDisplayedVirtualColumns(); }

    public moveColumn(key: string | Column, toIndex: number): void {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.warn('ag-Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this.columnController.moveColumnByIndex(key as number, toIndex, 'api');
        } else {
            this.columnController.moveColumn(key, toIndex, 'api');
        }
    }
    public moveColumnByIndex(fromIndex: number, toIndex: number): void { this.columnController.moveColumnByIndex(fromIndex, toIndex, 'api'); }
    public moveColumns(columnsToMoveKeys: (string | Column)[], toIndex: number) { this.columnController.moveColumns(columnsToMoveKeys, toIndex, 'api'); }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this.columnController.moveRowGroupColumn(fromIndex, toIndex); }
    public setColumnAggFunc(column: Column, aggFunc: string): void { this.columnController.setColumnAggFunc(column, aggFunc); }
    public setColumnWidth(key: string | Column, newWidth: number, finished: boolean = true): void { this.columnController.setColumnWidth(key, newWidth, false, finished); }
    public setPivotMode(pivotMode: boolean): void { this.columnController.setPivotMode(pivotMode); }
    public isPivotMode(): boolean { return this.columnController.isPivotMode(); }
    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: string | Column): Column { return this.columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); }

    public setValueColumns(colKeys: (string | Column)[]): void { this.columnController.setValueColumns(colKeys, 'api'); }
    public getValueColumns(): Column[] { return this.columnController.getValueColumns(); }
    public removeValueColumn(colKey: (string | Column)): void { this.columnController.removeValueColumn(colKey, 'api'); }
    public removeValueColumns(colKeys: (string | Column)[]): void { this.columnController.removeValueColumns(colKeys, 'api'); }
    public addValueColumn(colKey: (string | Column)): void { this.columnController.addValueColumn(colKey, 'api'); }
    public addValueColumns(colKeys: (string | Column)[]): void { this.columnController.addValueColumns(colKeys, 'api'); }

    public setRowGroupColumns(colKeys: (string | Column)[]): void { this.columnController.setRowGroupColumns(colKeys, 'api'); }
    public removeRowGroupColumn(colKey: string | Column): void { this.columnController.removeRowGroupColumn(colKey, 'api'); }
    public removeRowGroupColumns(colKeys: (string | Column)[]): void { this.columnController.removeRowGroupColumns(colKeys, 'api'); }
    public addRowGroupColumn(colKey: string | Column): void { this.columnController.addRowGroupColumn(colKey, 'api'); }
    public addRowGroupColumns(colKeys: (string | Column)[]): void { this.columnController.addRowGroupColumns(colKeys, 'api'); }
    public getRowGroupColumns(): Column[] { return this.columnController.getRowGroupColumns(); }

    public setPivotColumns(colKeys: (string | Column)[]): void { this.columnController.setPivotColumns(colKeys, 'api'); }
    public removePivotColumn(colKey: string | Column): void { this.columnController.removePivotColumn(colKey, 'api'); }
    public removePivotColumns(colKeys: (string | Column)[]): void { this.columnController.removePivotColumns(colKeys, 'api'); }
    public addPivotColumn(colKey: string | Column): void { this.columnController.addPivotColumn(colKey, 'api'); }
    public addPivotColumns(colKeys: (string | Column)[]): void { this.columnController.addPivotColumns(colKeys, 'api'); }
    public getPivotColumns(): Column[] { return this.columnController.getPivotColumns(); }

    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getLeftDisplayedColumnGroups(); }
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getCenterDisplayedColumnGroups(); }
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getRightDisplayedColumnGroups(); }
    public getAllDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getAllDisplayedColumnGroups(); }
    public autoSizeColumn(key: string | Column): void {return this.columnController.autoSizeColumn(key, 'api'); }
    public autoSizeColumns(keys: (string | Column)[]): void {return this.columnController.autoSizeColumns(keys, 'api'); }
    public autoSizeAllColumns(): void { this.columnController.autoSizeAllColumns('api'); }

    public setSecondaryColumns(colDefs: (ColDef | ColGroupDef)[]): void { this.columnController.setSecondaryColumns(colDefs, 'api'); }

    public getSecondaryColumns(): Column[] { return this.columnController.getSecondaryColumns(); }
    public getPrimaryColumns(): Column[] { return this.columnController.getAllPrimaryColumns(); }

    // below goes through deprecated items, prints message to user, then calls the new version of the same method

    public columnGroupOpened(group: OriginalColumnGroup | string, newValue: boolean): void {
        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    }
    public hideColumns(colIds: any, hide: any): void {
        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
        this.columnController.setColumnsVisible(colIds, !hide, 'api');
    }
    public hideColumn(colId: any, hide: any): void {
        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnController.setColumnVisible(colId, !hide, 'api');
    }

    public setState(columnState: ColumnState[]): boolean {
        console.error('ag-Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    }
    public getState(): ColumnState[] {
        console.error('ag-Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    }
    public resetState(): void {
        console.error('ag-Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState();
    }

    public getAggregationColumns(): Column[] {
        console.error('ag-Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this.columnController.getValueColumns();
    }

    public removeAggregationColumn(colKey: (string | Column)): void {
        console.error('ag-Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnController.removeValueColumn(colKey, 'api');
    }

    public removeAggregationColumns(colKeys: (string | Column)[]): void {
        console.error('ag-Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnController.removeValueColumns(colKeys, 'api');
    }

    public addAggregationColumn(colKey: (string | Column)): void {
        console.error('ag-Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnController.addValueColumn(colKey, 'api');
    }

    public addAggregationColumns(colKeys: (string | Column)[]): void {
        console.error('ag-Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnController.addValueColumns(colKeys, 'api');
    }

    public setColumnAggFunction(column: Column, aggFunc: string): void {
        console.error('ag-Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnController.setColumnAggFunc(column, aggFunc, 'api');
    }

    public getDisplayNameForCol(column: any): string {
        console.error('ag-Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    }
}