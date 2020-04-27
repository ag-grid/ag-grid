export declare class ColumnKeyCreator {
    private existingKeys;
    addExistingKeys(keys: string[]): void;
    getUniqueKey(colId: string, colField: string): string;
}
