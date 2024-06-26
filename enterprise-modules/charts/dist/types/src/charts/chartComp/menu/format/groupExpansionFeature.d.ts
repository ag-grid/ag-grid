import { BeanStub } from '@ag-grid-community/core';
import type { AgGroupComponent } from '@ag-grid-enterprise/core';
export declare class GroupExpansionFeature extends BeanStub {
    private readonly groupContainer;
    private id;
    private groupComponents;
    private expandedGroupComponent?;
    constructor(groupContainer: HTMLElement);
    addGroupComponent(groupComponent: AgGroupComponent): void;
    destroy(): void;
}
