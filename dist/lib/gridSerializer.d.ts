// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "./entities/column";
import { ColumnController } from "./columnController/columnController";
import { RowNode } from "./entities/rowNode";
import { ValueService } from "./valueService";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { CsvExportParams, ProcessCellForExportParams, ProcessHeaderForExportParams } from "./exportParams";
/**
 * This interface works in conjuction with the GridSerializer. When serializing a grid, an instance that implements this interface
 * must be passed in, the serializer will call back to the provided methods and finally call to parse to obtain the final result
 * of the serialization.
 *
 * The lifecycle of a serializer with a GridSerializingSession is as follows.
 *
 * --1 Call to prepare method. An opportunity to do any required work before the call to accumulate data for the rows are about to happen.
 * --2 Call to the row methods as the serializer loops through the different rows of the grid will call these methods so that the data
 * can be accumulated. The methods. if there is relevant data will be called in the following order:
 *      a) addCustomHeader
 *      b) onNewHeaderGroupingRow
 *      c) onNewHeader
 *      d) onNewBodyRow
 *      e) addCustomFooter
 *      IF ANY OF THIS METHODS RETURN A ROW ACCUMULATOR, YOU CAN EXPECT THE SERIALIZER TO CALL ON THAT ACCUMULATOR WITH THE DATA FOR THAT ROW
 *      IMMEDIATELY AFTER IT HAS RECEIVED THE OBJECT AND BEFORE IT CALLS YOU TO OBTAIN A NEW ROW ACCUMULATOR
 * --3 Call to parse method. This method is the last one to be called and is expected to return whatever accumulated
 * parsed string is to be returned as a result of the serialization
 *
 * This interface is closely related to the RowAccumulator and RowSpanningAccumulator interfaces as every time a new row is about
 * to be created a new instances of RowAccumulator or RowSpanningAccumulator need to be provided.

 */
export interface GridSerializingSession {
    /**
     * INITIAL METHOD
     */
    prepare(columnsToExport: Column[]): void;
    /**
     * ROW METHODS
     */
    addCustomHeader(customHeader: string): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(): RowAccumulator;
    addCustomFooter(customFooter: string): void;
    /**
     * FINAL RESULT
     */
    parse(): string;
}
export interface RowAccumulator {
    onColumn(column: Column, index: number, node?: RowNode): void;
}
export interface RowSpanningAccumulator {
    onColumn(header: string, index: number, span: number): void;
}
export declare abstract class BaseGridSerializingSession implements GridSerializingSession {
    columnController: ColumnController;
    valueService: ValueService;
    gridOptionsWrapper: GridOptionsWrapper;
    processCellCallback: (params: ProcessCellForExportParams) => string;
    processHeaderCallback: (params: ProcessHeaderForExportParams) => string;
    cellAndHeaderEscaper: (rawValue: string) => string;
    constructor(columnController: ColumnController, valueService: ValueService, gridOptionsWrapper: GridOptionsWrapper, processCellCallback?: (params: ProcessCellForExportParams) => string, processHeaderCallback?: (params: ProcessHeaderForExportParams) => string, cellAndHeaderEscaper?: (rawValue: string) => string);
    abstract prepare(columnsToExport: Column[]): void;
    abstract addCustomHeader(customHeader: string): void;
    abstract addCustomFooter(customFooter: string): void;
    abstract onNewHeaderGroupingRow(): RowSpanningAccumulator;
    abstract onNewHeaderRow(): RowAccumulator;
    abstract onNewBodyRow(): RowAccumulator;
    abstract parse(): string;
    extractHeaderValue(column: Column): string;
    extractRowCellValue(column: Column, index: number, node?: RowNode): any;
    private getHeaderName(callback, column);
    private createValueForGroupNode(node);
    private processCell(rowNode, column, value, processCellCallback);
}
export declare class GridSerializer {
    private displayedGroupCreator;
    private columnController;
    private rowModel;
    private floatingRowModel;
    private selectionController;
    private balancedColumnTreeBuilder;
    private gridOptionsWrapper;
    serialize(gridSerializingSession: GridSerializingSession, userParams?: CsvExportParams): string;
}
export declare enum RowType {
    HEADER_GROUPING = 0,
    HEADER = 1,
    BODY = 2,
}
