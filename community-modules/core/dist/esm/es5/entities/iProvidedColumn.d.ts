// Type definitions for @ag-grid-community/core v27.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ProvidedColumnGroup } from "./providedColumnGroup";
export interface IProvidedColumn {
    isVisible(): boolean;
    getColumnGroupShow(): string | undefined;
    getId(): string;
    setOriginalParent(originalParent: ProvidedColumnGroup | null): void;
}
