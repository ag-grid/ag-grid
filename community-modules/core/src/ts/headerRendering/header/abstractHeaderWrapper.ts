import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ManagedFocusComponent } from "../../widgets/managedFocusComponent";

export abstract class AbstractHeaderWrapper extends ManagedFocusComponent {

    protected abstract readonly column: Column | ColumnGroup;
    protected abstract readonly pinned: string;

    protected abstract onFocusIn(e: FocusEvent): void;

    public getColumn(): Column | ColumnGroup {
        return this.column;
    }

    public getPinned(): string {
        return this.pinned;
    }
}