import {ColDef, ColGroupDef} from "../entities/colDef";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {ColumnController} from "./columnController";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import {ColumnGroup} from "../entities/columnGroup";
import {Column} from "../entities/column";
import {Autowired, Bean} from "../context/context";
import {ColumnEventType} from "../events";

@Bean('columnApi')
export class ColumnApi {

    @Autowired('columnController') private columnController: ColumnController;

    public sizeColumnsToFit(gridWidth: any): void { this.columnController.sizeColumnsToFit(gridWidth); }
    public setColumnGroupOpened(group: OriginalColumnGroup|string, newValue: boolean): void { this.columnController.setColumnGroupOpened(group, newValue); }
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup { return this.columnController.getColumnGroup(name, instanceId); }
    public getOriginalColumnGroup(name: string): OriginalColumnGroup { return this.columnController.getOriginalColumnGroup(name); }

    public getDisplayNameForColumn(column: Column, location: string): string { return this.columnController.getDisplayNameForColumn(column, location); }
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: string): string { return this.columnController.getDisplayNameForColumnGroup(columnGroup, location); }

    public getColumn(key: any): Column { return this.columnController.getPrimaryColumn(key); }
    public setColumnState(columnState: any): boolean { return this.columnController.setColumnState(columnState); }
    public getColumnState(): any[] { return this.columnController.getColumnState(); }
    public resetColumnState(): void { this.columnController.resetColumnState(); }
    public getColumnGroupState(): {groupId: string, open: boolean}[] {return this.columnController.getColumnGroupState()}
    public setColumnGroupState(stateItems: ({groupId: string, open: boolean})[]): void {this.columnController.setColumnGroupState(stateItems)}
    public resetColumnGroupState(): void { this.columnController.resetColumnGroupState(); }

    public isPinning(): boolean { return this.columnController.isPinningLeft() || this.columnController.isPinningRight(); }
    public isPinningLeft(): boolean { return this.columnController.isPinningLeft(); }
    public isPinningRight(): boolean { return this.columnController.isPinningRight(); }
    public getDisplayedColAfter(col: Column): Column { return this.columnController.getDisplayedColAfter(col); }
    public getDisplayedColBefore(col: Column): Column { return this.columnController.getDisplayedColBefore(col); }
    public setColumnVisible(key: string|Column, visible: boolean): void { this.columnController.setColumnVisible(key, visible); }
    public setColumnsVisible(keys: (string|Column)[], visible: boolean): void { this.columnController.setColumnsVisible(keys, visible); }
    public setColumnPinned(key: string|Column, pinned: string): void { this.columnController.setColumnPinned(key, pinned); }
    public setColumnsPinned(keys: (string|Column)[], pinned: string): void { this.columnController.setColumnsPinned(keys, pinned); }

    public getAllColumns(): Column[] { return this.columnController.getAllPrimaryColumns(); }
    public getAllGridColumns(): Column[] { return this.columnController.getAllGridColumns(); }
    public getDisplayedLeftColumns(): Column[] { return this.columnController.getDisplayedLeftColumns(); }
    public getDisplayedCenterColumns(): Column[] { return this.columnController.getDisplayedCenterColumns(); }
    public getDisplayedRightColumns(): Column[] { return this.columnController.getDisplayedRightColumns(); }
    public getAllDisplayedColumns(): Column[] { return this.columnController.getAllDisplayedColumns(); }
    public getAllDisplayedVirtualColumns(): Column[] { return this.columnController.getAllDisplayedVirtualColumns(); }

    public moveColumn(key: string|Column, toIndex: number): void {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.log('ag-Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this.columnController.moveColumnByIndex(<number>key, toIndex);
        } else {
            this.columnController.moveColumn(key, toIndex);
        }
    }
    public moveColumnByIndex(fromIndex: number, toIndex: number): void { this.columnController.moveColumnByIndex(fromIndex, toIndex); }
    public moveColumns(columnsToMoveKeys: (string|Column)[], toIndex: number) { this.columnController.moveColumns(columnsToMoveKeys, toIndex); }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this.columnController.moveRowGroupColumn(fromIndex, toIndex); }
    public setColumnAggFunc(column: Column, aggFunc: string): void { this.columnController.setColumnAggFunc(column, aggFunc); }
    public setColumnWidth(key: string|Column, newWidth: number, finished: boolean = true): void { this.columnController.setColumnWidth(key, newWidth, finished); }
    public setPivotMode(pivotMode: boolean, source:ColumnEventType = "api"): void { this.columnController.setPivotMode(pivotMode); }
    public isPivotMode(): boolean { return this.columnController.isPivotMode(); }
    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: string|Column): Column { return this.columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); }

    public setValueColumns(colKeys: (string|Column)[]): void { this.columnController.setValueColumns(colKeys); }
    public getValueColumns(): Column[] { return this.columnController.getValueColumns(); }
    public removeValueColumn(colKey: (string|Column)): void { this.columnController.removeValueColumn(colKey); }
    public removeValueColumns(colKeys: (string|Column)[]): void { this.columnController.removeValueColumns(colKeys); }
    public addValueColumn(colKey: (string|Column)): void { this.columnController.addValueColumn(colKey); }
    public addValueColumns(colKeys: (string|Column)[]): void { this.columnController.addValueColumns(colKeys); }

    public setRowGroupColumns(colKeys: (string|Column)[]): void { this.columnController.setRowGroupColumns(colKeys); }
    public removeRowGroupColumn(colKey: string|Column): void { this.columnController.removeRowGroupColumn(colKey); }
    public removeRowGroupColumns(colKeys: (string|Column)[]): void { this.columnController.removeRowGroupColumns(colKeys); }
    public addRowGroupColumn(colKey: string|Column): void { this.columnController.addRowGroupColumn(colKey); }
    public addRowGroupColumns(colKeys: (string|Column)[]): void { this.columnController.addRowGroupColumns(colKeys); }
    public getRowGroupColumns(): Column[] { return this.columnController.getRowGroupColumns(); }

    public setPivotColumns(colKeys: (string|Column)[]): void { this.columnController.setPivotColumns(colKeys); }
    public removePivotColumn(colKey: string|Column): void { this.columnController.removePivotColumn(colKey); }
    public removePivotColumns(colKeys: (string|Column)[]): void { this.columnController.removePivotColumns(colKeys); }
    public addPivotColumn(colKey: string|Column): void { this.columnController.addPivotColumn(colKey); }
    public addPivotColumns(colKeys: (string|Column)[]): void { this.columnController.addPivotColumns(colKeys); }
    public getPivotColumns(): Column[] { return this.columnController.getPivotColumns(); }

    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getLeftDisplayedColumnGroups(); }
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getCenterDisplayedColumnGroups(); }
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getRightDisplayedColumnGroups(); }
    public getAllDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getAllDisplayedColumnGroups(); }
    public autoSizeColumn(key: string|Column): void {return this.columnController.autoSizeColumn(key); }
    public autoSizeColumns(keys: (string|Column)[]): void {return this.columnController.autoSizeColumns(keys); }
    public autoSizeAllColumns(): void { this.columnController.autoSizeAllColumns(); }

    public setSecondaryColumns(colDefs: (ColDef|ColGroupDef)[]): void { this.columnController.setSecondaryColumns(colDefs); }

    // below goes through deprecated items, prints message to user, then calls the new version of the same method

    public columnGroupOpened(group: OriginalColumnGroup|string, newValue: boolean): void {
        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    }
    public hideColumns(colIds: any, hide: any): void {
        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
        this.columnController.setColumnsVisible(colIds, !hide);
    }
    public hideColumn(colId: any, hide: any): void {
        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnController.setColumnVisible(colId, !hide);
    }

    public setState(columnState: any): boolean {
        console.error('ag-Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    }
    public getState(): any[] {
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

    public removeAggregationColumn(colKey: (string|Column)): void {
        console.error('ag-Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnController.removeValueColumn(colKey);
    }

    public removeAggregationColumns(colKeys: (string|Column)[]): void {
        console.error('ag-Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnController.removeValueColumns(colKeys);
    }

    public addAggregationColumn(colKey: (string|Column)): void {
        console.error('ag-Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnController.addValueColumn(colKey);
    }

    public addAggregationColumns(colKeys: (string|Column)[]): void {
        console.error('ag-Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnController.addValueColumns(colKeys);
    }

    public setColumnAggFunction(column: Column, aggFunc: string): void {
        console.error('ag-Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnController.setColumnAggFunc(column, aggFunc);
    }

    public getDisplayNameForCol(column: any): string {
        console.error('ag-Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    }
}