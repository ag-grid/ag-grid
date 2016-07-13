// Type definitions for ag-grid v5.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "./entities/column";
import { ColumnGroup } from "./entities/columnGroup";
export declare class ColumnChangeEvent {
    private type;
    private column;
    private columns;
    private columnGroup;
    private toIndex;
    private finished;
    private visible;
    private pinned;
    constructor(type: string);
    toString(): string;
    withPinned(pinned: string): ColumnChangeEvent;
    withVisible(visible: boolean): ColumnChangeEvent;
    isVisible(): boolean;
    getPinned(): string;
    withColumn(column: Column): ColumnChangeEvent;
    withColumns(columns: Column[]): ColumnChangeEvent;
    withFinished(finished: boolean): ColumnChangeEvent;
    withColumnGroup(columnGroup: ColumnGroup): ColumnChangeEvent;
    withToIndex(toIndex: number): ColumnChangeEvent;
    getToIndex(): number;
    getType(): string;
    getColumn(): Column;
    getColumns(): Column[];
    getColumnGroup(): ColumnGroup;
    isFinished(): boolean;
}
