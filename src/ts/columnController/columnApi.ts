import {ColDef, ColGroupDef} from "../entities/colDef";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {ColumnController} from "./columnController";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import {ColumnGroup} from "../entities/columnGroup";
import {Column} from "../entities/column";
import {Autowired, Bean} from "../context/context";

@Bean('columnApi')
export class ColumnApi {

    @Autowired('columnController') private _columnController: ColumnController;

    public sizeColumnsToFit(gridWidth: any): void { this._columnController.sizeColumnsToFit(gridWidth); }
    public setColumnGroupOpened(group: OriginalColumnGroup|string, newValue: boolean): void { this._columnController.setColumnGroupOpened(group, newValue); }
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup { return this._columnController.getColumnGroup(name, instanceId); }
    public getOriginalColumnGroup(name: string): OriginalColumnGroup { return this._columnController.getOriginalColumnGroup(name); }

    public getDisplayNameForColumn(column: Column, location: string): string { return this._columnController.getDisplayNameForColumn(column, location); }
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: string): string { return this._columnController.getDisplayNameForColumnGroup(columnGroup, location); }

    public getColumn(key: any): Column { return this._columnController.getPrimaryColumn(key); }
    public setColumnState(columnState: any): boolean { return this._columnController.setColumnState(columnState); }
    public getColumnState(): any[] { return this._columnController.getColumnState(); }
    public resetColumnState(): void { this._columnController.resetColumnState(); }
    public getColumnGroupState(): {groupId: string, open: boolean}[] {return this._columnController.getColumnGroupState()}
    public setColumnGroupState(stateItems: ({groupId: string, open: boolean})[]): void {this._columnController.setColumnGroupState(stateItems)}
    public resetColumnGroupState(): void { this._columnController.resetColumnGroupState(); }

    public isPinning(): boolean { return this._columnController.isPinningLeft() || this._columnController.isPinningRight(); }
    public isPinningLeft(): boolean { return this._columnController.isPinningLeft(); }
    public isPinningRight(): boolean { return this._columnController.isPinningRight(); }
    public getDisplayedColAfter(col: Column): Column { return this._columnController.getDisplayedColAfter(col); }
    public getDisplayedColBefore(col: Column): Column { return this._columnController.getDisplayedColBefore(col); }
    public setColumnVisible(key: string|Column, visible: boolean): void { this._columnController.setColumnVisible(key, visible); }
    public setColumnsVisible(keys: (string|Column)[], visible: boolean): void { this._columnController.setColumnsVisible(keys, visible); }
    public setColumnPinned(key: string|Column, pinned: string): void { this._columnController.setColumnPinned(key, pinned); }
    public setColumnsPinned(keys: (string|Column)[], pinned: string): void { this._columnController.setColumnsPinned(keys, pinned); }

    public getAllColumns(): Column[] { return this._columnController.getAllPrimaryColumns(); }
    public getAllGridColumns(): Column[] { return this._columnController.getAllGridColumns(); }
    public getDisplayedLeftColumns(): Column[] { return this._columnController.getDisplayedLeftColumns(); }
    public getDisplayedCenterColumns(): Column[] { return this._columnController.getDisplayedCenterColumns(); }
    public getDisplayedRightColumns(): Column[] { return this._columnController.getDisplayedRightColumns(); }
    public getAllDisplayedColumns(): Column[] { return this._columnController.getAllDisplayedColumns(); }
    public getAllDisplayedVirtualColumns(): Column[] { return this._columnController.getAllDisplayedVirtualColumns(); }

    public moveColumn(key: string|Column, toIndex: number): void {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.log('ag-Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this._columnController.moveColumnByIndex(<number>key, toIndex);
        } else {
            this._columnController.moveColumn(key, toIndex);
        }
    }
    public moveColumnByIndex(fromIndex: number, toIndex: number): void { this._columnController.moveColumnByIndex(fromIndex, toIndex); }
    public moveColumns(columnsToMoveKeys: (string|Column)[], toIndex: number) { this._columnController.moveColumns(columnsToMoveKeys, toIndex); }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this._columnController.moveRowGroupColumn(fromIndex, toIndex); }
    public setColumnAggFunc(column: Column, aggFunc: string): void { this._columnController.setColumnAggFunc(column, aggFunc); }
    public setColumnWidth(key: string|Column, newWidth: number, finished: boolean = true): void { this._columnController.setColumnWidth(key, newWidth, finished); }
    public setPivotMode(pivotMode: boolean): void { this._columnController.setPivotMode(pivotMode); }
    public isPivotMode(): boolean { return this._columnController.isPivotMode(); }
    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: string|Column): Column { return this._columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); }

    public setValueColumns(colKeys: (string|Column)[]): void { this._columnController.setValueColumns(colKeys); }
    public getValueColumns(): Column[] { return this._columnController.getValueColumns(); }
    public removeValueColumn(colKey: (string|Column)): void { this._columnController.removeValueColumn(colKey); }
    public removeValueColumns(colKeys: (string|Column)[]): void { this._columnController.removeValueColumns(colKeys); }
    public addValueColumn(colKey: (string|Column)): void { this._columnController.addValueColumn(colKey); }
    public addValueColumns(colKeys: (string|Column)[]): void { this._columnController.addValueColumns(colKeys); }

    public setRowGroupColumns(colKeys: (string|Column)[]): void { this._columnController.setRowGroupColumns(colKeys); }
    public removeRowGroupColumn(colKey: string|Column): void { this._columnController.removeRowGroupColumn(colKey); }
    public removeRowGroupColumns(colKeys: (string|Column)[]): void { this._columnController.removeRowGroupColumns(colKeys); }
    public addRowGroupColumn(colKey: string|Column): void { this._columnController.addRowGroupColumn(colKey); }
    public addRowGroupColumns(colKeys: (string|Column)[]): void { this._columnController.addRowGroupColumns(colKeys); }
    public getRowGroupColumns(): Column[] { return this._columnController.getRowGroupColumns(); }

    public setPivotColumns(colKeys: (string|Column)[]): void { this._columnController.setPivotColumns(colKeys); }
    public removePivotColumn(colKey: string|Column): void { this._columnController.removePivotColumn(colKey); }
    public removePivotColumns(colKeys: (string|Column)[]): void { this._columnController.removePivotColumns(colKeys); }
    public addPivotColumn(colKey: string|Column): void { this._columnController.addPivotColumn(colKey); }
    public addPivotColumns(colKeys: (string|Column)[]): void { this._columnController.addPivotColumns(colKeys); }
    public getPivotColumns(): Column[] { return this._columnController.getPivotColumns(); }

    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getLeftDisplayedColumnGroups(); }
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getCenterDisplayedColumnGroups(); }
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getRightDisplayedColumnGroups(); }
    public getAllDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getAllDisplayedColumnGroups(); }
    public autoSizeColumn(key: string|Column): void {return this._columnController.autoSizeColumn(key); }
    public autoSizeColumns(keys: (string|Column)[]): void {return this._columnController.autoSizeColumns(keys); }
    public autoSizeAllColumns(): void { this._columnController.autoSizeAllColumns(); }

    public setSecondaryColumns(colDefs: (ColDef|ColGroupDef)[]): void { this._columnController.setSecondaryColumns(colDefs); }

    // below goes through deprecated items, prints message to user, then calls the new version of the same method

    public columnGroupOpened(group: OriginalColumnGroup|string, newValue: boolean): void {
        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    }
    public hideColumns(colIds: any, hide: any): void {
        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
        this._columnController.setColumnsVisible(colIds, !hide);
    }
    public hideColumn(colId: any, hide: any): void {
        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
        this._columnController.setColumnVisible(colId, !hide);
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
        return this._columnController.getValueColumns();
    }

    public removeAggregationColumn(colKey: (string|Column)): void {
        console.error('ag-Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this._columnController.removeValueColumn(colKey);
    }

    public removeAggregationColumns(colKeys: (string|Column)[]): void {
        console.error('ag-Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this._columnController.removeValueColumns(colKeys);
    }

    public addAggregationColumn(colKey: (string|Column)): void {
        console.error('ag-Grid: addAggregationColumn is deprecated, use addValueColumn');
        this._columnController.addValueColumn(colKey);
    }

    public addAggregationColumns(colKeys: (string|Column)[]): void {
        console.error('ag-Grid: addAggregationColumns is deprecated, use addValueColumns');
        this._columnController.addValueColumns(colKeys);
    }

    public setColumnAggFunction(column: Column, aggFunc: string): void {
        console.error('ag-Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this._columnController.setColumnAggFunc(column, aggFunc);
    }

    public getDisplayNameForCol(column: any): string {
        console.error('ag-Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    }
}