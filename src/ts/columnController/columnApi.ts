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

    public sizeColumnsToFit(gridWidth: any, source: ColumnEventType): void { this.columnController.sizeColumnsToFit(gridWidth, source); }
    public setColumnGroupOpened(group: OriginalColumnGroup|string, newValue: boolean, source: ColumnEventType): void { this.columnController.setColumnGroupOpened(group, newValue, source); }
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup { return this.columnController.getColumnGroup(name, instanceId); }
    public getOriginalColumnGroup(name: string): OriginalColumnGroup { return this.columnController.getOriginalColumnGroup(name); }

    public getDisplayNameForColumn(column: Column, location: string): string { return this.columnController.getDisplayNameForColumn(column, location); }
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: string): string { return this.columnController.getDisplayNameForColumnGroup(columnGroup, location); }

    public getColumn(key: any): Column { return this.columnController.getPrimaryColumn(key); }
    public setColumnState(columnState: any, source: ColumnEventType): boolean { return this.columnController.setColumnState(columnState, source); }
    public getColumnState(): any[] { return this.columnController.getColumnState(); }
    public resetColumnState(source: ColumnEventType): void { this.columnController.resetColumnState(source); }
    public getColumnGroupState(): {groupId: string, open: boolean}[] {return this.columnController.getColumnGroupState();}
    public setColumnGroupState(stateItems: ({groupId: string, open: boolean})[], source: ColumnEventType): void {this.columnController.setColumnGroupState(stateItems, source);}
    public resetColumnGroupState(source: ColumnEventType): void { this.columnController.resetColumnGroupState(source); }

    public isPinning(): boolean { return this.columnController.isPinningLeft() || this.columnController.isPinningRight(); }
    public isPinningLeft(): boolean { return this.columnController.isPinningLeft(); }
    public isPinningRight(): boolean { return this.columnController.isPinningRight(); }
    public getDisplayedColAfter(col: Column): Column { return this.columnController.getDisplayedColAfter(col); }
    public getDisplayedColBefore(col: Column): Column { return this.columnController.getDisplayedColBefore(col); }
    public setColumnVisible(key: string|Column, visible: boolean, source: ColumnEventType): void { this.columnController.setColumnVisible(key, visible, source); }
    public setColumnsVisible(keys: (string|Column)[], visible: boolean, source: ColumnEventType): void { this.columnController.setColumnsVisible(keys, visible, source); }
    public setColumnPinned(key: string|Column, pinned: string, source: ColumnEventType): void { this.columnController.setColumnPinned(key, pinned, source); }
    public setColumnsPinned(keys: (string|Column)[], pinned: string, source: ColumnEventType): void { this.columnController.setColumnsPinned(keys, pinned, source); }

    public getAllColumns(): Column[] { return this.columnController.getAllPrimaryColumns(); }
    public getAllGridColumns(): Column[] { return this.columnController.getAllGridColumns(); }
    public getDisplayedLeftColumns(): Column[] { return this.columnController.getDisplayedLeftColumns(); }
    public getDisplayedCenterColumns(): Column[] { return this.columnController.getDisplayedCenterColumns(); }
    public getDisplayedRightColumns(): Column[] { return this.columnController.getDisplayedRightColumns(); }
    public getAllDisplayedColumns(): Column[] { return this.columnController.getAllDisplayedColumns(); }
    public getAllDisplayedVirtualColumns(): Column[] { return this.columnController.getAllDisplayedVirtualColumns(); }

    public moveColumn(key: string|Column, toIndex: number, source: ColumnEventType): void {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.log('ag-Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this.columnController.moveColumnByIndex(<number>key, toIndex, source);
        } else {
            this.columnController.moveColumn(key, toIndex, source);
        }
    }
    public moveColumnByIndex(fromIndex: number, toIndex: number, source: ColumnEventType): void { this.columnController.moveColumnByIndex(fromIndex, toIndex, source); }
    public moveColumns(columnsToMoveKeys: (string|Column)[], toIndex: number, source: ColumnEventType) { this.columnController.moveColumns(columnsToMoveKeys, toIndex, source); }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this.columnController.moveRowGroupColumn(fromIndex, toIndex); }
    public setColumnAggFunc(column: Column, aggFunc: string): void { this.columnController.setColumnAggFunc(column, aggFunc); }
    public setColumnWidth(key: string|Column, newWidth: number, finished: boolean = true): void { this.columnController.setColumnWidth(key, newWidth, finished); }
    public setPivotMode(pivotMode: boolean, source: ColumnEventType = "api"): void { this.columnController.setPivotMode(pivotMode); }
    public isPivotMode(): boolean { return this.columnController.isPivotMode(); }
    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: string|Column): Column { return this.columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); }

    public setValueColumns(colKeys: (string|Column)[], source: ColumnEventType): void { this.columnController.setValueColumns(colKeys, source); }
    public getValueColumns(): Column[] { return this.columnController.getValueColumns(); }
    public removeValueColumn(colKey: (string|Column), source: ColumnEventType): void { this.columnController.removeValueColumn(colKey, source); }
    public removeValueColumns(colKeys: (string|Column)[], source: ColumnEventType): void { this.columnController.removeValueColumns(colKeys, source); }
    public addValueColumn(colKey: (string|Column), source: ColumnEventType): void { this.columnController.addValueColumn(colKey, source); }
    public addValueColumns(colKeys: (string|Column)[], source: ColumnEventType): void { this.columnController.addValueColumns(colKeys, source); }

    public setRowGroupColumns(colKeys: (string|Column)[], source: ColumnEventType): void { this.columnController.setRowGroupColumns(colKeys, source); }
    public removeRowGroupColumn(colKey: string|Column, source: ColumnEventType): void { this.columnController.removeRowGroupColumn(colKey, source); }
    public removeRowGroupColumns(colKeys: (string|Column)[], source: ColumnEventType): void { this.columnController.removeRowGroupColumns(colKeys, source); }
    public addRowGroupColumn(colKey: string|Column, source: ColumnEventType): void { this.columnController.addRowGroupColumn(colKey, source); }
    public addRowGroupColumns(colKeys: (string|Column)[], source: ColumnEventType): void { this.columnController.addRowGroupColumns(colKeys, source); }
    public getRowGroupColumns(): Column[] { return this.columnController.getRowGroupColumns(); }

    public setPivotColumns(colKeys: (string|Column)[], source: ColumnEventType): void { this.columnController.setPivotColumns(colKeys, source); }
    public removePivotColumn(colKey: string|Column, source: ColumnEventType): void { this.columnController.removePivotColumn(colKey, source); }
    public removePivotColumns(colKeys: (string|Column)[], source: ColumnEventType): void { this.columnController.removePivotColumns(colKeys, source); }
    public addPivotColumn(colKey: string|Column, source: ColumnEventType): void { this.columnController.addPivotColumn(colKey, source); }
    public addPivotColumns(colKeys: (string|Column)[], source: ColumnEventType): void { this.columnController.addPivotColumns(colKeys, source); }
    public getPivotColumns(): Column[] { return this.columnController.getPivotColumns(); }

    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getLeftDisplayedColumnGroups(); }
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getCenterDisplayedColumnGroups(); }
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getRightDisplayedColumnGroups(); }
    public getAllDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getAllDisplayedColumnGroups(); }
    public autoSizeColumn(key: string|Column, source: ColumnEventType): void {return this.columnController.autoSizeColumn(key, source); }
    public autoSizeColumns(keys: (string|Column)[], source: ColumnEventType): void {return this.columnController.autoSizeColumns(keys, source); }
    public autoSizeAllColumns(source: ColumnEventType): void { this.columnController.autoSizeAllColumns(source); }

    public setSecondaryColumns(colDefs: (ColDef|ColGroupDef)[], source: ColumnEventType): void { this.columnController.setSecondaryColumns(colDefs, source); }

    // below goes through deprecated items, prints message to user, then calls the new version of the same method

    public columnGroupOpened(group: OriginalColumnGroup|string, newValue: boolean, source: ColumnEventType): void {
        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue, source);
    }
    public hideColumns(colIds: any, hide: any, source: ColumnEventType): void {
        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
        this.columnController.setColumnsVisible(colIds, !hide, source);
    }
    public hideColumn(colId: any, hide: any, source: ColumnEventType): void {
        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnController.setColumnVisible(colId, !hide, source);
    }

    public setState(columnState: any, source: ColumnEventType): boolean {
        console.error('ag-Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState, source);
    }
    public getState(): any[] {
        console.error('ag-Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    }
    public resetState(source: ColumnEventType): void {
        console.error('ag-Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState(source);
    }

    public getAggregationColumns(): Column[] {
        console.error('ag-Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this.columnController.getValueColumns();
    }

    public removeAggregationColumn(colKey: (string|Column), source: ColumnEventType): void {
        console.error('ag-Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnController.removeValueColumn(colKey, source);
    }

    public removeAggregationColumns(colKeys: (string|Column)[], source: ColumnEventType): void {
        console.error('ag-Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnController.removeValueColumns(colKeys, source);
    }

    public addAggregationColumn(colKey: (string|Column), source: ColumnEventType): void {
        console.error('ag-Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnController.addValueColumn(colKey, source);
    }

    public addAggregationColumns(colKeys: (string|Column)[], source: ColumnEventType): void {
        console.error('ag-Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnController.addValueColumns(colKeys, source);
    }

    public setColumnAggFunction(column: Column, aggFunc: string, source: ColumnEventType): void {
        console.error('ag-Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnController.setColumnAggFunc(column, aggFunc, source);
    }

    public getDisplayNameForCol(column: any): string {
        console.error('ag-Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    }
}