import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { DragItem } from "../../../dragAndDrop/dragAndDropService";
import { ColumnGroup } from "../../../entities/columnGroup";
import { Beans } from "../../../rendering/beans";
import { ITooltipFeatureComp } from "../../../widgets/tooltipFeature";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp, ITooltipFeatureComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    addOrRemoveResizableCssClass(cssClassName: string, on: boolean): void;
    setWidth(width: string): void;
    setColId(id: string): void;
    setAriaExpanded(expanded: 'true' | 'false' | undefined): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
}
export declare class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl {
    protected beans: Beans;
    private columnModel;
    private dragAndDropService;
    private userComponentFactory;
    private gridApi;
    private columnApi;
    private columnGroup;
    private comp;
    private expandable;
    private displayName;
    private groupResizeFeature;
    constructor(columnGroup: ColumnGroup, parentRowCtrl: HeaderRowCtrl);
    setComp(comp: IHeaderGroupCellComp, eGui: HTMLElement, eResize: HTMLElement): void;
    resizeLeafColumnsToFit(): void;
    private setupUserComp;
    private setupTooltip;
    private setupExpandable;
    private refreshExpanded;
    private addAttributes;
    private addClasses;
    private setupMovingCss;
    protected onFocusIn(e: FocusEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    setDragSource(eHeaderGroup: HTMLElement): void;
    getDragItemForGroup(): DragItem;
    private isSuppressMoving;
}
