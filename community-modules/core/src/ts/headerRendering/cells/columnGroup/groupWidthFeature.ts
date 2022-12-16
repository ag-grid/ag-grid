import { BeanStub } from "../../../context/beanStub";
import { PostConstruct } from "../../../context/context";
import { Column } from "../../../entities/column";
import { ColumnGroup } from "../../../entities/columnGroup";
import { IHeaderGroupCellComp } from "./headerGroupCellCtrl";

export class GroupWidthFeature extends BeanStub {

    private columnGroup: ColumnGroup;
    private comp: IHeaderGroupCellComp;

    // the children can change, we keep destroy functions related to listening to the children here
    private removeChildListenersFuncs: (() => void)[] = [];

    constructor(comp: IHeaderGroupCellComp, columnGroup: ColumnGroup) {
        super();
        this.columnGroup = columnGroup;
        this.comp = comp;
    }

    @PostConstruct
    private postConstruct(): void {
        // we need to listen to changes in child columns, as they impact our width
        this.addListenersToChildrenColumns();

        // the children belonging to this group can change, so we need to add and remove listeners as they change
        this.addManagedListener(this.columnGroup, ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED, this.onDisplayedChildrenChanged.bind(this));

        this.onWidthChanged();

        // the child listeners are not tied to this components life-cycle, as children can get added and removed
        // to the group - hence they are on a different life-cycle. so we must make sure the existing children
        // listeners are removed when we finally get destroyed
        this.addDestroyFunc(this.removeListenersOnChildrenColumns.bind(this));
    }

    private addListenersToChildrenColumns(): void {
        // first destroy any old listeners
        this.removeListenersOnChildrenColumns();

        // now add new listeners to the new set of children
        const widthChangedListener = this.onWidthChanged.bind(this);
        this.columnGroup.getLeafColumns().forEach(column => {
            column.addEventListener('widthChanged', widthChangedListener);
            column.addEventListener('visibleChanged', widthChangedListener);
            this.removeChildListenersFuncs.push(() => {
                column.removeEventListener('widthChanged', widthChangedListener);
                column.removeEventListener('visibleChanged', widthChangedListener);
            });
        });
    }

    private removeListenersOnChildrenColumns(): void {
        this.removeChildListenersFuncs.forEach(func => func());
        this.removeChildListenersFuncs = [];
    }

    private onDisplayedChildrenChanged(): void {
        this.addListenersToChildrenColumns();
        this.onWidthChanged();
    }

    private onWidthChanged(): void {
        this.comp.setWidth(this.columnGroup.getActualWidth() + 'px');
    }

}
