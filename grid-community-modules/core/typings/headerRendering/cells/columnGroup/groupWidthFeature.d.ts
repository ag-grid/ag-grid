import { BeanStub } from "../../../context/beanStub";
import { ColumnGroup } from "../../../entities/columnGroup";
import { IHeaderGroupCellComp } from "./headerGroupCellCtrl";
export declare class GroupWidthFeature extends BeanStub {
    private columnGroup;
    private comp;
    private removeChildListenersFuncs;
    constructor(comp: IHeaderGroupCellComp, columnGroup: ColumnGroup);
    private postConstruct;
    private addListenersToChildrenColumns;
    private removeListenersOnChildrenColumns;
    private onDisplayedChildrenChanged;
    private onWidthChanged;
}
