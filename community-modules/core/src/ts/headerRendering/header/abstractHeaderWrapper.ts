import { Component } from "../../widgets/component";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { PostConstruct, Autowired } from "../../context/context";
import { Beans } from "../../rendering/beans";

export abstract class AbstractHeaderWrapper extends Component {

    protected abstract readonly column: Column | ColumnGroup;
    protected abstract readonly pinned: string;

    @Autowired('beans') protected beans: Beans;

    @PostConstruct
    protected postConstruct(): void {
        const eGui = this.getGui();
        this.addManagedListener(eGui, 'focusin', (e: FocusEvent) => {
            if (!eGui.contains(e.relatedTarget as HTMLElement)) {
                eGui.focus();
                this.beans.focusController.setHeaderFocused(this);
            }
        });
    }

    public getColumn(): Column | ColumnGroup {
        return this.column;
    }

    public getPinned(): string {
        return this.pinned;
    }
}