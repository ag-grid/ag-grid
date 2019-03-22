// Type definitions for ag-grid-community v20.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { OriginalColumnGroup } from "./originalColumnGroup";
export interface OriginalColumnGroupChild {
    isVisible(): boolean;
    getColumnGroupShow(): string | undefined;
    getId(): string;
    setOriginalParent(originalParent: OriginalColumnGroup | null): void;
}
