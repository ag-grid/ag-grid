import { BeanStub } from 'ag-grid-community';

import type { AgGroupComponent } from '../../../../widgets/agGroupComponent';

// handles single group expansion
export class GroupExpansionFeature extends BeanStub {
    private id: number = 0;
    private groupComponents: Map<number, AgGroupComponent> = new Map();
    private expandedGroupComponent?: number;

    constructor(private readonly groupContainer: HTMLElement) {
        super();
    }

    public addGroupComponent(groupComponent: AgGroupComponent): void {
        const id = this.id++;
        this.groupComponents.set(id, groupComponent);
        if (groupComponent.isExpanded()) {
            this.expandedGroupComponent = id;
        }
        groupComponent.onExpandedChange((expanded) => {
            if (expanded) {
                const previouslyExpandedGroupComponent = this.expandedGroupComponent;
                this.expandedGroupComponent = id;
                if (previouslyExpandedGroupComponent != null) {
                    const groupComponentGui = groupComponent.getGui();
                    const groupPositionInViewport =
                        groupComponentGui.offsetTop - this.groupContainer.parentElement!.scrollTop;

                    this.groupComponents.get(previouslyExpandedGroupComponent)?.toggleGroupExpand(false, true);

                    // if the group above is collapsed, the expanded component will be in the wrong place, so scroll
                    let newScrollTop = groupComponentGui.offsetTop - groupPositionInViewport;
                    if (newScrollTop < 0) {
                        newScrollTop = 0;
                    }
                    if (newScrollTop !== this.groupContainer.parentElement!.scrollTop) {
                        this.groupContainer.parentElement!.scrollTop = newScrollTop;
                    }
                }
            } else {
                this.expandedGroupComponent = undefined;
            }
        });
    }

    public override destroy(): void {
        this.groupComponents.clear();
        super.destroy();
    }
}
