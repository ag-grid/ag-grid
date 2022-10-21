import { RowNode } from "../entities/rowNode";
import { Bean, PostConstruct } from "../context/context";
import { IsRowSelectable } from "../entities/gridOptions";
import { BeanStub } from "../context/beanStub";
import { exists } from "../utils/generic";

@Bean('selectableService')
export class SelectableService extends BeanStub {

    private groupSelectsChildren: boolean;
    private isRowSelectableFunc?: IsRowSelectable;

    @PostConstruct
    public init(): void {
        this.groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.isRowSelectableFunc = this.gridOptionsService.get('isRowSelectable');
    }

    public updateSelectableAfterGrouping(rowNode: RowNode): void {
        if (this.isRowSelectableFunc) {
            const nextChildrenFunc = (node: RowNode) => node.childrenAfterGroup;
            this.recurseDown(rowNode.childrenAfterGroup, nextChildrenFunc);
        }
    }

    private recurseDown(children: RowNode[] | null, nextChildrenFunc: ((rowNode: RowNode) => RowNode[] | null)): void {
        if (!children) { return; }

        children.forEach((child: RowNode) => {

            if (!child.group) { return; } // only interested in groups

            if (child.hasChildren()) {
                this.recurseDown(nextChildrenFunc(child), nextChildrenFunc);
            }

            let rowSelectable: boolean;

            if (this.groupSelectsChildren) {
                // have this group selectable if at least one direct child is selectable
                const firstSelectable = (nextChildrenFunc(child) || []).find(rowNode => rowNode.selectable ===  true);
                rowSelectable = exists(firstSelectable);
            } else {
                // directly retrieve selectable value from user callback
                rowSelectable = this.isRowSelectableFunc ? this.isRowSelectableFunc(child) : false;
            }

            child.setRowSelectable(rowSelectable);
        });
    }

}
