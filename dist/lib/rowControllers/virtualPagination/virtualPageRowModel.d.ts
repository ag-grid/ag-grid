// Type definitions for ag-grid v5.4.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../../entities/rowNode";
import { IRowModel } from "../../interfaces/iRowModel";
import { IDatasource } from "../iDatasource";
export declare class VirtualPageRowModel implements IRowModel {
    private gridOptionsWrapper;
    private filterManager;
    private sortController;
    private selectionController;
    private eventService;
    private context;
    private destroyFunctions;
    private virtualPageCache;
    private datasource;
    init(): void;
    private addEventListeners();
    private onFilterChanged();
    private onSortChanged();
    destroy(): void;
    getType(): string;
    setDatasource(datasource: IDatasource): void;
    private checkForDeprecated();
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    private reset();
    private resetCache();
    getRow(rowIndex: number): RowNode;
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    getRowCombinedHeight(): number;
    getRowIndexAtPixel(pixel: number): number;
    getRowCount(): number;
    insertItemsAtIndex(index: number, items: any[]): void;
    removeItems(rowNodes: RowNode[]): void;
    addItems(items: any[]): void;
    refreshVirtualPageCache(): void;
    purgeVirtualPageCache(): void;
    getVirtualRowCount(): number;
    isMaxRowFound(): boolean;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    getVirtualPageState(): any;
}
