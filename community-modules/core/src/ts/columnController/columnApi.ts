import { ColDef, ColGroupDef } from "../entities/colDef";
import { ColumnGroupChild } from "../entities/columnGroupChild";
import { ColumnController, ColumnState } from "./columnController";
import { OriginalColumnGroup } from "../entities/originalColumnGroup";
import { ColumnGroup } from "../entities/columnGroup";
import { Column } from "../entities/column";
import { Autowired, Bean, PreDestroy } from "../context/context";
import { _ } from "../utils";

@Bean('columnApi')
export class ColumnApi {

    @Autowired('columnController') private columnController: ColumnController;

    public sizeColumnsToFit(gridWidth: any): void {
        // AG-3403 validate that gridWidth is provided because this method has the same name as
        // a method on the grid API that takes no arguments, and it's easy to confuse the two
        if (typeof gridWidth === "undefined") {
            console.error('AG Grid: missing parameter to columnApi.sizeColumnsToFit(gridWidth)');
        }
        this.columnController.sizeColumnsToFit(gridWidth, 'api');
    }
    public setColumnGroupOpened(group: OriginalColumnGroup | string, newValue: boolean): void { this.columnController.setColumnGroupOpened(group, newValue, 'api'); }
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup | null { return this.columnController.getColumnGroup(name, instanceId); }
    public getOriginalColumnGroup(name: string): OriginalColumnGroup | null { return this.columnController.getOriginalColumnGroup(name); }

    public getDisplayNameForColumn(column: Column, location: string | null): string { return this.columnController.getDisplayNameForColumn(column, location) || ''; }
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: string): string { return this.columnController.getDisplayNameForColumnGroup(columnGroup, location) || ''; }

    public getColumn(key: any): Column | null { return this.columnController.getPrimaryColumn(key); }
    public applyColumnState(params: ApplyColumnStateParams): boolean { return this.columnController.applyColumnState(params, 'api'); }
    public getColumnState(): ColumnState[] { return this.columnController.getColumnState(); }
    public resetColumnState(): void { this.columnController.resetColumnState('api'); }
    public getColumnGroupState(): {groupId: string, open: boolean}[] {return this.columnController.getColumnGroupState(); }
    public setColumnGroupState(stateItems: ({groupId: string, open: boolean})[]): void {this.columnController.setColumnGroupState(stateItems, 'api'); }
    public resetColumnGroupState(): void { this.columnController.resetColumnGroupState('api'); }

    public isPinning(): boolean { return this.columnController.isPinningLeft() || this.columnController.isPinningRight(); }
    public isPinningLeft(): boolean { return this.columnController.isPinningLeft(); }
    public isPinningRight(): boolean { return this.columnController.isPinningRight(); }
    public getDisplayedColAfter(col: Column): Column | null { return this.columnController.getDisplayedColAfter(col); }
    public getDisplayedColBefore(col: Column): Column | null { return this.columnController.getDisplayedColBefore(col); }
    public setColumnVisible(key: string | Column, visible: boolean): void { this.columnController.setColumnVisible(key, visible, 'api'); }
    public setColumnsVisible(keys: (string | Column)[], visible: boolean): void { this.columnController.setColumnsVisible(keys, visible, 'api'); }
    public setColumnPinned(key: string | Column, pinned: string): void { this.columnController.setColumnPinned(key, pinned, 'api'); }
    public setColumnsPinned(keys: (string | Column)[], pinned: string): void { this.columnController.setColumnsPinned(keys, pinned, 'api'); }

    public getAllColumns(): Column[] | null { return this.columnController.getAllPrimaryColumns(); }
    public getAllGridColumns(): Column[] { return this.columnController.getAllGridColumns(); }
    public getDisplayedLeftColumns(): Column[] { return this.columnController.getDisplayedLeftColumns(); }
    public getDisplayedCenterColumns(): Column[] { return this.columnController.getDisplayedCenterColumns(); }
    public getDisplayedRightColumns(): Column[] { return this.columnController.getDisplayedRightColumns(); }
    public getAllDisplayedColumns(): Column[] { return this.columnController.getAllDisplayedColumns(); }
    public getAllDisplayedVirtualColumns(): Column[] { return this.columnController.getViewportColumns(); }

    public moveColumn(key: string | Column, toIndex: number): void {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.warn('AG Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this.columnController.moveColumnByIndex(key as number, toIndex, 'api');
        } else {
            this.columnController.moveColumn(key, toIndex, 'api');
        }
    }
    public moveColumnByIndex(fromIndex: number, toIndex: number): void { this.columnController.moveColumnByIndex(fromIndex, toIndex, 'api'); }
    public moveColumns(columnsToMoveKeys: (string | Column)[], toIndex: number) { this.columnController.moveColumns(columnsToMoveKeys, toIndex, 'api'); }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this.columnController.moveRowGroupColumn(fromIndex, toIndex); }
    public setColumnAggFunc(key: string | Column, aggFunc: string): void { this.columnController.setColumnAggFunc(key, aggFunc); }

    public setColumnWidth(key: string | Column, newWidth: number, finished: boolean = true): void {
        this.columnController.setColumnWidths([{key, newWidth}], false, finished);
    }
    public setColumnWidths(columnWidths: {key: string | Column, newWidth: number}[], finished: boolean = true): void {
        this.columnController.setColumnWidths(columnWidths, false, finished);
    }

    public setPivotMode(pivotMode: boolean): void { this.columnController.setPivotMode(pivotMode); }
    public isPivotMode(): boolean { return this.columnController.isPivotMode(); }
    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: string | Column): Column | null { return this.columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); }

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

    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getDisplayedTreeLeft(); }
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getDisplayedTreeCentre(); }
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] { return this.columnController.getDisplayedTreeRight(); }
    public getAllDisplayedColumnGroups(): ColumnGroupChild[] | null { return this.columnController.getAllDisplayedTrees(); }
    public autoSizeColumn(key: string | Column, skipHeader?: boolean): void {return this.columnController.autoSizeColumn(key, skipHeader, 'api'); }
    public autoSizeColumns(keys: (string | Column)[], skipHeader?: boolean): void {return this.columnController.autoSizeColumns(keys, skipHeader, 'api'); }
    public autoSizeAllColumns(skipHeader?: boolean): void { this.columnController.autoSizeAllColumns(skipHeader, 'api'); }

    public setSecondaryColumns(colDefs: (ColDef | ColGroupDef)[]): void { this.columnController.setSecondaryColumns(colDefs, 'api'); }

    public getSecondaryColumns(): Column[] | null { return this.columnController.getSecondaryColumns(); }
    public getPrimaryColumns(): Column[] | null { return this.columnController.getAllPrimaryColumns(); }

    @PreDestroy
    private cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid(): void {
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in teh API so at least the core grid can be garbage collected.
        //
        // wait about 100ms before clearing down the references, in case user has some cleanup to do,
        // and needs to deference the API first
        setTimeout(_.removeAllReferences.bind(window, this, 'Column API'), 100);
    }

    // below goes through deprecated items, prints message to user, then calls the new version of the same method

    // public getColumnDefs(): (ColDef | ColGroupDef)[] {
    //     this.setColumnGroupOpened(group, newValue);
    //     return null;
    // }

    public columnGroupOpened(group: OriginalColumnGroup | string, newValue: boolean): void {
        console.error('AG Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    }
    public hideColumns(colIds: any, hide: any): void {
        console.error('AG Grid: hideColumns is deprecated, use setColumnsVisible');
        this.columnController.setColumnsVisible(colIds, !hide, 'api');
    }
    public hideColumn(colId: any, hide: any): void {
        console.error('AG Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnController.setColumnVisible(colId, !hide, 'api');
    }

    public setState(columnState: ColumnState[]): boolean {
        console.error('AG Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    }

    public getState(): ColumnState[] {
        console.error('AG Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    }
    public resetState(): void {
        console.error('AG Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState();
    }

    public getAggregationColumns(): Column[] {
        console.error('AG Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this.columnController.getValueColumns();
    }

    public removeAggregationColumn(colKey: (string | Column)): void {
        console.error('AG Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnController.removeValueColumn(colKey, 'api');
    }

    public removeAggregationColumns(colKeys: (string | Column)[]): void {
        console.error('AG Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnController.removeValueColumns(colKeys, 'api');
    }

    public addAggregationColumn(colKey: (string | Column)): void {
        console.error('AG Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnController.addValueColumn(colKey, 'api');
    }

    public addAggregationColumns(colKeys: (string | Column)[]): void {
        console.error('AG Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnController.addValueColumns(colKeys, 'api');
    }

    public setColumnAggFunction(column: Column, aggFunc: string): void {
        console.error('AG Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnController.setColumnAggFunc(column, aggFunc, 'api');
    }

    public getDisplayNameForCol(column: any): string {
        console.error('AG Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    }

    public setColumnState(columnState: ColumnState[]): boolean {
        return this.columnController.applyColumnState({state: columnState, applyOrder: true}, 'api');
    }

}

export interface ApplyColumnStateParams {
    state?: ColumnState[];
    applyOrder?: boolean;
    defaultState?: ColumnState;
}
