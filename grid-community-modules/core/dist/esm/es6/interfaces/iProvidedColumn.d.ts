// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColumnGroupShowType } from "../entities/columnGroup";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
export interface IProvidedColumn {
    isVisible(): boolean;
    getInstanceId(): number;
    getColumnGroupShow(): ColumnGroupShowType | undefined;
    getId(): string;
    setOriginalParent(originalParent: ProvidedColumnGroup | null): void;
}
