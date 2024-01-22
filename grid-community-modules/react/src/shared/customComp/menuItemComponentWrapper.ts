import { IMenuItem, IMenuItemParams } from "@ag-grid-community/core";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomMenuItemProps, CustomMenuItemCallbacks } from "./interfaces";

export class MenuItemComponentWrapper extends CustomComponentWrapper<IMenuItemParams, CustomMenuItemProps, CustomMenuItemCallbacks> implements IMenuItem {
    private active: boolean = false;
    private expanded: boolean = false;

    public setActive(active: boolean): void {
        this.active = active;
        this.refreshProps();
    }

    public setExpanded(expanded: boolean): void {
        this.expanded = expanded;
        this.refreshProps();
    }

    protected getOptionalMethods(): string[] {
        return ['select'];
    }

    private updateActive(active: boolean): void {
        this.setActive(active);
        if (active) {
            setTimeout(() => {
                // ensure prop updates have happened
                this.sourceParams.onItemActivated();
            });
        }
    }

    protected getProps(): CustomMenuItemProps {
        const props: CustomMenuItemProps = {
            ...this.sourceParams,
            active: this.active,
            expanded: this.expanded,
            onActiveChange: (active: boolean) => this.updateActive(active),
            key: this.key
        } as any;
        // remove props in IMenuItemParams but not CustomMenuItemProps
        delete (props as any).onItemActivated;
        return props;
    }
}
