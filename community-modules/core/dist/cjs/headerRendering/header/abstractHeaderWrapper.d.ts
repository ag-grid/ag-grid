// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ManagedFocusComponent } from "../../widgets/managedFocusComponent";
export declare abstract class AbstractHeaderWrapper extends ManagedFocusComponent {
    protected abstract readonly column: Column | ColumnGroup;
    protected abstract readonly pinned: string | null;
    protected abstract onFocusIn(e: FocusEvent): void;
    protected shouldStopEventPropagation(e: KeyboardEvent): boolean;
    getColumn(): Column | ColumnGroup;
    getPinned(): string | null;
}
