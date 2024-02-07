import { Autowired, Bean } from "../context/context";
import { ColDef, ColGroupDef, HeaderLocation, IAggFunc } from "../entities/colDef";
import { Column, ColumnPinnedType } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { ColumnEventType } from "../events";
import { GridApi } from "../gridApi";
import { IHeaderColumn } from "../interfaces/iHeaderColumn";
import { warnOnce } from "../utils/function";
import { ApplyColumnStateParams, ColumnState } from "./columnModel";

/** @deprecated Use methods via the grid api instead. */
@Bean('columnApi')
export class ColumnApi {

    @Autowired('gridApi') private api: GridApi;

    constructor(gridAp: GridApi) {
        this.api = gridAp;
     }

    private viaApi = <K extends keyof ColumnApi & keyof GridApi>(funcName: keyof ColumnApi & keyof GridApi, ...args: Parameters<ColumnApi[K]>) => {
        warnOnce(`Since v31, 'columnApi.${funcName}' is deprecated and moved to 'api.${funcName}'.`);
        return (this.api[funcName] as any)(...args);
    }

    /** @deprecated v31 use `api.sizeColumnsToFit()` instead.   */
    public sizeColumnsToFit(gridWidth: number): void { this.viaApi('sizeColumnsToFit', gridWidth); }
    /** @deprecated v31 use `api.setColumnGroupOpened() instead. */
    public setColumnGroupOpened(group: ProvidedColumnGroup | string, newValue: boolean): void { this.viaApi('setColumnGroupOpened', group, newValue) }

    /** @deprecated v31 use `api.getColumnGroup() instead. */
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup | null { return this.viaApi('getColumnGroup', name, instanceId); }
    /** @deprecated v31 use `api.getProvidedColumnGroup() instead. */
    public getProvidedColumnGroup(name: string): ProvidedColumnGroup | null {return this.viaApi('getProvidedColumnGroup', name);}

    /** @deprecated v31 use `api.getDisplayNameForColumn() instead. */
    public getDisplayNameForColumn(column: Column, location: HeaderLocation): string { return this.viaApi('getDisplayNameForColumn',column, location); }
    /** @deprecated v31 use `api.getDisplayNameForColumnGroup() instead. */
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: HeaderLocation): string { return this.viaApi('getDisplayNameForColumnGroup',columnGroup, location); }

    /** @deprecated v31 use `api.getColumn() instead. */
    public getColumn(key: string | ColDef | Column): Column | null { return this.viaApi('getColumn', key); }
    /** @deprecated v31 use `api.getColumns() instead. */
    public getColumns(): Column[] | null { return this.viaApi('getColumns'); }
    /** @deprecated v31 use `api.applyColumnState() instead. */
    public applyColumnState(params: ApplyColumnStateParams): boolean { return this.viaApi('applyColumnState', params); }
    /** @deprecated v31 use `api.getColumnState() instead. */
    public getColumnState(): ColumnState[] { return this.viaApi('getColumnState'); }
    /** @deprecated v31 use `api.resetColumnState() instead. */
    public resetColumnState(): void { this.viaApi('resetColumnState') }
    /** @deprecated v31 use `api.getColumnGroupState() instead. */
    public getColumnGroupState(): { groupId: string, open: boolean }[] { return this.viaApi('getColumnGroupState'); }
    /** @deprecated v31 use `api.setColumnGroupState() instead. */
    public setColumnGroupState(stateItems: ({ groupId: string, open: boolean })[]): void { this.viaApi('setColumnGroupState', stateItems); }
    /** @deprecated v31 use `api.resetColumnGroupState() instead. */
    public resetColumnGroupState(): void { this.viaApi('resetColumnGroupState') }

    /** @deprecated v31 use `api.isPinning() instead. */
    public isPinning(): boolean { return this.viaApi('isPinning'); }
    /** @deprecated v31 use `api.isPinningLeft() instead. */
    public isPinningLeft(): boolean { return this.viaApi('isPinningLeft'); }
    /** @deprecated v31 use `api.isPinningRight() instead. */
    public isPinningRight(): boolean { return this.viaApi('isPinningRight'); }
    /** @deprecated v31 use `api.getDisplayedColAfter() instead. */
    public getDisplayedColAfter(col: Column): Column | null { return this.viaApi('getDisplayedColAfter', col); }
    /** @deprecated v31 use `api.getDisplayedColBefore() instead. */
    public getDisplayedColBefore(col: Column): Column | null { return this.viaApi('getDisplayedColBefore', col); }
    /** @deprecated v31 use `api.setColumnVisible() instead. */
    public setColumnVisible(key: string | Column, visible: boolean): void { this.viaApi('setColumnVisible', key, visible); }
    /** @deprecated v31 use `api.setColumnsVisible() instead. */
    public setColumnsVisible(keys: (string | Column)[], visible: boolean): void { this.viaApi('setColumnsVisible', keys, visible); }
    /** @deprecated v31 use `api.setColumnPinned() instead. */
    public setColumnPinned(key: string | ColDef | Column, pinned: ColumnPinnedType): void { this.viaApi('setColumnPinned', key, pinned); }
    /** @deprecated v31 use `api.setColumnsPinned() instead. */
    public setColumnsPinned(keys: (string | ColDef | Column)[], pinned: ColumnPinnedType): void { this.viaApi('setColumnsPinned', keys, pinned); }

    /** @deprecated v31 use `api.getAllGridColumns() instead. */
    public getAllGridColumns(): Column[] { return this.viaApi('getAllGridColumns'); }
    /** @deprecated v31 use `api.getDisplayedLeftColumns() instead. */
    public getDisplayedLeftColumns(): Column[] { return this.viaApi('getDisplayedLeftColumns'); }
    /** @deprecated v31 use `api.getDisplayedCenterColumns() instead. */
    public getDisplayedCenterColumns(): Column[] { return this.viaApi('getDisplayedCenterColumns'); }
    /** @deprecated v31 use `api.getDisplayedRightColumns() instead. */
    public getDisplayedRightColumns(): Column[] { return this.viaApi('getDisplayedRightColumns'); }
    /** @deprecated v31 use `api.getAllDisplayedColumns() instead. */
    public getAllDisplayedColumns(): Column[] { return this.viaApi('getAllDisplayedColumns'); }
    /** @deprecated v31 use `api.getAllDisplayedVirtualColumns() instead. */
    public getAllDisplayedVirtualColumns(): Column[] { return this.viaApi('getAllDisplayedVirtualColumns'); }

    /** @deprecated v31 use `api.moveColumn() instead. */
    public moveColumn(key: string | ColDef | Column, toIndex: number): void {this.viaApi('moveColumn', key, toIndex);}
    /** @deprecated v31 use `api.moveColumnByIndex() instead. */
    public moveColumnByIndex(fromIndex: number, toIndex: number): void { this.viaApi('moveColumnByIndex', fromIndex, toIndex) }
    /** @deprecated v31 use `api.moveColumns() instead. */
    public moveColumns(columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number) { this.viaApi('moveColumns', columnsToMoveKeys, toIndex) }
    /** @deprecated v31 use `api.moveRowGroupColumn() instead. */
    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this.viaApi('moveRowGroupColumn', fromIndex, toIndex) }
    /** @deprecated v31 use `api.setColumnAggFunc() instead. */
    public setColumnAggFunc(key: string | ColDef | Column, aggFunc: string | IAggFunc | null | undefined): void { this.viaApi('setColumnAggFunc', key, aggFunc) }
    /** @deprecated v31 use `api.setColumnWidth() instead. */
    public setColumnWidth(key: string | ColDef | Column, newWidth: number, finished: boolean = true, source?: ColumnEventType): void {
        this.viaApi('setColumnWidth', key, newWidth, finished, source);
    }
    /** @deprecated v31 use `api.setColumnWidths() instead. */
    public setColumnWidths(columnWidths: { key: string | ColDef | Column, newWidth: number }[], finished: boolean = true, source?: ColumnEventType): void {
        this.viaApi('setColumnWidths', columnWidths, finished, source);
    }
    /** @deprecated v31 use `api.setPivotMode() instead. */
    public setPivotMode(pivotMode: boolean): void { this.viaApi('setPivotMode', pivotMode); }
    /** @deprecated v31 use `api.isPivotMode() instead. */
    public isPivotMode(): boolean { return this.viaApi('isPivotMode'); }

    /** @deprecated v31 use `api.getPivotResultColumn() instead. */
    public getPivotResultColumn(pivotKeys: string[], valueColKey: string | ColDef | Column): Column | null { return this.viaApi('getPivotResultColumn', pivotKeys, valueColKey) }

    /** @deprecated v31 use `api.setValueColumns() instead. */
    public setValueColumns(colKeys: (string | ColDef | Column)[]): void { this.viaApi('setValueColumns', colKeys) }
    /** @deprecated v31 use `api.getValueColumns() instead. */
    public getValueColumns(): Column[] { return this.viaApi('getValueColumns'); }
    /** @deprecated v31 use `api.removeValueColumn() instead. */
    public removeValueColumn(colKey: (string | ColDef | Column)): void { this.viaApi('removeValueColumn', colKey) }
    /** @deprecated v31 use `api.removeValueColumns() instead. */
    public removeValueColumns(colKeys: (string | ColDef | Column)[]): void { this.viaApi('removeValueColumns', colKeys) }
    /** @deprecated v31 use `api.addValueColumn() instead. */
    public addValueColumn(colKey: (string | ColDef | Column)): void { this.viaApi('addValueColumn', colKey) }
    /** @deprecated v31 use `api.addValueColumns() instead. */
    public addValueColumns(colKeys: (string | ColDef | Column)[]): void { this.viaApi('addValueColumns', colKeys) }

    /** @deprecated v31 use `api.setRowGroupColumns() instead. */
    public setRowGroupColumns(colKeys: (string | ColDef | Column)[]): void { this.viaApi('setRowGroupColumns', colKeys) }
    /** @deprecated v31 use `api.removeRowGroupColumn() instead. */
    public removeRowGroupColumn(colKey: string | ColDef | Column): void { this.viaApi('removeRowGroupColumn', colKey) }
    /** @deprecated v31 use `api.removeRowGroupColumns() instead. */
    public removeRowGroupColumns(colKeys: (string | ColDef | Column)[]): void { this.viaApi('removeRowGroupColumns', colKeys) }
    /** @deprecated v31 use `api.addRowGroupColumn() instead. */
    public addRowGroupColumn(colKey: string | ColDef | Column): void { this.viaApi('addRowGroupColumn', colKey) }
    /** @deprecated v31 use `api.addRowGroupColumns() instead. */
    public addRowGroupColumns(colKeys: (string | ColDef | Column)[]): void { this.viaApi('addRowGroupColumns', colKeys) }
    /** @deprecated v31 use `api.getRowGroupColumns() instead. */
    public getRowGroupColumns(): Column[] { return  this.viaApi('getRowGroupColumns'); }

    /** @deprecated v31 use `api.setPivotColumns() instead. */
    public setPivotColumns(colKeys: (string | ColDef | Column)[]): void {this.viaApi('setPivotColumns', colKeys); }
    /** @deprecated v31 use `api.removePivotColumn() instead. */
    public removePivotColumn(colKey: string | ColDef | Column): void { this.viaApi('removePivotColumn', colKey) }
    /** @deprecated v31 use `api.removePivotColumns() instead. */
    public removePivotColumns(colKeys: (string | ColDef | Column)[]): void { this.viaApi('removePivotColumns', colKeys) }
    /** @deprecated v31 use `api.addPivotColumn() instead. */
    public addPivotColumn(colKey: string | ColDef | Column): void { this.viaApi('addPivotColumn', colKey) }
    /** @deprecated v31 use `api.addPivotColumns() instead. */
    public addPivotColumns(colKeys: (string | ColDef | Column)[]): void { this.viaApi('addPivotColumns', colKeys) }
    /** @deprecated v31 use `api.getPivotColumns() instead. */
    public getPivotColumns(): Column[] { return this.viaApi('getPivotColumns'); }

    /** @deprecated v31 use `api.getLeftDisplayedColumnGroups() instead. */
    public getLeftDisplayedColumnGroups(): IHeaderColumn[] { return this.viaApi('getLeftDisplayedColumnGroups'); }
    /** @deprecated v31 use `api.getCenterDisplayedColumnGroups() instead. */
    public getCenterDisplayedColumnGroups(): IHeaderColumn[] { return this.viaApi('getCenterDisplayedColumnGroups'); }
    /** @deprecated v31 use `api.getRightDisplayedColumnGroups() instead. */
    public getRightDisplayedColumnGroups(): IHeaderColumn[] { return this.viaApi('getRightDisplayedColumnGroups'); }
    /** @deprecated v31 use `api.getAllDisplayedColumnGroups() instead. */
    public getAllDisplayedColumnGroups(): IHeaderColumn[] | null { return this.viaApi('getAllDisplayedColumnGroups'); }
    /** @deprecated v31 use `api.autoSizeColumn() instead. */
    public autoSizeColumn(key: string | ColDef | Column, skipHeader?: boolean): void { return this.viaApi('autoSizeColumn', key, skipHeader); }

    /** @deprecated v31 use `api.autoSizeColumns() instead. */
    public autoSizeColumns(keys: (string | ColDef | Column)[], skipHeader?: boolean): void {
        this.viaApi('autoSizeColumns', keys, skipHeader);
    }

    /** @deprecated v31 use `api.autoSizeAllColumns() instead. */
    public autoSizeAllColumns(skipHeader?: boolean): void { this.viaApi('autoSizeAllColumns', skipHeader); }

    /** @deprecated v31 use `api.setPivotResultColumns() instead. */
    public setPivotResultColumns(colDefs: (ColDef | ColGroupDef)[]): void { this.viaApi('setPivotResultColumns', colDefs); }

    /** @deprecated v31 use `api.getPivotResultColumns() instead. */
    public getPivotResultColumns(): Column[] | null { return this.viaApi('getPivotResultColumns'); }
}


