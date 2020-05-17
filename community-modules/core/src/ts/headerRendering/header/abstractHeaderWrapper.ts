import { Autowired } from "../../context/context";
import { Beans } from "../../rendering/beans";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ManagedFocusComponent } from "../../widgets/managedFocusComponent";

export abstract class AbstractHeaderWrapper extends ManagedFocusComponent {

    protected abstract readonly column: Column | ColumnGroup;
    protected abstract readonly pinned: string;

    @Autowired('beans') protected beans: Beans;

    protected onFocusIn(e: FocusEvent) {
        if (!this.getGui().contains(e.relatedTarget as HTMLElement)) {
            this.beans.focusController.setHeaderFocused(this);
        }
    }

    public getColumn(): Column | ColumnGroup {
        return this.column;
    }

    public getPinned(): string {
        return this.pinned;
    }
}