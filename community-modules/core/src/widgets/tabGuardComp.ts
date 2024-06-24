import type { ComponentEvent } from './component';
import { Component } from './component';
import type { TabGuardParams } from './tabGuardFeature';
import { TabGuardFeature } from './tabGuardFeature';

export class TabGuardComp<TLocalEvent extends string = ComponentEvent> extends Component<TLocalEvent> {
    protected tabGuardFeature: TabGuardFeature;

    protected initialiseTabGuard(params: TabGuardParams) {
        this.tabGuardFeature = this.createManagedBean(new TabGuardFeature(this));
        this.tabGuardFeature.initialiseTabGuard(params);
    }

    public forceFocusOutOfContainer(up: boolean = false): void {
        this.tabGuardFeature.forceFocusOutOfContainer(up);
    }

    public override appendChild(newChild: Component | HTMLElement, container?: HTMLElement | undefined): void {
        this.tabGuardFeature.appendChild(super.appendChild.bind(this), newChild, container);
    }
}
