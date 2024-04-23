import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { DragItem } from "../../../dragAndDrop/dragAndDropService";
import { ColumnEventType } from "../../../events";
import { ColumnGroup } from "../../../entities/columnGroup";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { GroupResizeFeature } from "./groupResizeFeature";
import { IHeaderGroupComp } from "./headerGroupComp";
import { HorizontalDirection } from "../../../constants/direction";
import { HeaderColumnId } from "../../../interfaces/iHeaderColumn";
import { Beans } from "../../../rendering/beans";
export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp {
    setResizableDisplayed(displayed: boolean): void;
    setWidth(width: string): void;
    setAriaExpanded(expanded: 'true' | 'false' | undefined): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
    getUserCompInstance(): IHeaderGroupComp | undefined;
}
export declare class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl<IHeaderGroupCellComp, ColumnGroup, GroupResizeFeature> {
    private expandable;
    private displayName;
    private tooltipFeature;
    constructor(columnGroup: ColumnGroup, beans: Beans, parentRowCtrl: HeaderRowCtrl);
    setComp(comp: IHeaderGroupCellComp, eGui: HTMLElement, eResize: HTMLElement): void;
    protected resizeHeader(delta: number, shiftKey: boolean): void;
    protected moveHeader(hDirection: HorizontalDirection): void;
    private restoreFocus;
    private findGroupWidthId;
    resizeLeafColumnsToFit(source: ColumnEventType): void;
    private setupUserComp;
    private addHeaderMouseListeners;
    private handleMouseOverChange;
    private setupTooltip;
    private setupExpandable;
    private refreshExpanded;
    getColId(): HeaderColumnId;
    private addClasses;
    private setupMovingCss;
    private onSuppressColMoveChange;
    private onFocusIn;
    protected handleKeyDown(e: KeyboardEvent): void;
    setDragSource(eHeaderGroup: HTMLElement): void;
    getDragItemForGroup(columnGroup: ColumnGroup): DragItem;
    private isSuppressMoving;
}
