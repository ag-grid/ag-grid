import { IFloatingFilter, Component, FilterChangedEvent, _ } from '@ag-grid-community/core';

export class CombinedFloatingFilterComp extends Component implements IFloatingFilter {
    onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent): void {
    }

    public getGui(): HTMLElement {
        return _.loadTemplate(`<div style="margin: auto 0;">Combined filter</div>`);
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }
}