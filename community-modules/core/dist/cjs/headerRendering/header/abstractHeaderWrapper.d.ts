// Type definitions for @ag-grid-community/core v23.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ManagedFocusComponent } from "../../widgets/managedFocusComponent";
export declare abstract class AbstractHeaderWrapper extends ManagedFocusComponent {
    protected abstract readonly column: Column | ColumnGroup;
    protected abstract readonly pinned: string;
    protected abstract onFocusIn(e: FocusEvent): void;
    getColumn(): Column | ColumnGroup;
    getPinned(): string;
}
