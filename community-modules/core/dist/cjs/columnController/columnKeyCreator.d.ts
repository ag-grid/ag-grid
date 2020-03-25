// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class ColumnKeyCreator {
    private existingKeys;
    addExistingKeys(keys: string[]): void;
    getUniqueKey(colId: string, colField: string): string;
}
