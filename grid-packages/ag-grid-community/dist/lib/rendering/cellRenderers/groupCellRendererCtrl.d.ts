import { UserCompDetails } from "../../components/framework/userComponentFactory";
import { BeanStub } from "../../context/beanStub";
import { ICellRendererComp, ICellRendererFunc, ICellRendererParams } from "./iCellRenderer";
export interface IGroupCellRenderer {
    setInnerRenderer(compDetails: UserCompDetails | undefined, valueToDisplay: any): void;
    setChildCount(count: string): void;
    setCheckboxVisible(value: boolean): void;
    setExpandedDisplayed(value: boolean): void;
    setContractedDisplayed(value: boolean): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
}
export interface GroupCellRendererParams extends ICellRendererParams {
    pinned: string;
    fullWidth: boolean;
    suppressPadding: boolean;
    suppressDoubleClickExpand: boolean;
    suppressEnterExpand: boolean;
    footerValueGetter: any;
    suppressCount: boolean;
    checkbox: any;
    rowDrag?: boolean;
    innerRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    innerRendererFramework?: any;
    innerRendererParams?: any;
    scope: any;
    /** @deprecated */
    padding: number;
}
export declare class GroupCellRendererCtrl extends BeanStub {
    private expressionService;
    private valueFormatterService;
    private columnModel;
    private userComponentFactory;
    private readonly gridOptions;
    private params;
    private showingValueForOpenedParent;
    private displayedGroupNode;
    private cellIsBlank;
    private eGui;
    private eExpanded;
    private eContracted;
    private eCheckbox;
    private indentClass;
    private comp;
    private compClass;
    init(comp: IGroupCellRenderer, eGui: HTMLElement, eCheckbox: HTMLElement, eExpanded: HTMLElement, eContracted: HTMLElement, compClass: any, params: GroupCellRendererParams): void;
    private isTopLevelFooter;
    private isEmbeddedRowMismatch;
    private findDisplayedGroupNode;
    private setupShowingValueForOpenedParent;
    private addValueElement;
    private addGroupValue;
    private adjustParamsWithDetailsFromRelatedColumn;
    private addFooterValue;
    private getInnerCompDetails;
    private addChildCount;
    private updateChildCount;
    private isShowRowGroupForThisRow;
    private addExpandAndContract;
    onExpandClicked(mouseEvent: MouseEvent): void;
    onExpandOrContract(): void;
    private isExpandable;
    private showExpandAndContractIcons;
    private onRowNodeIsExpandableChanged;
    private setupIndent;
    private setIndent;
    private addFullWidthRowDraggerIfNeeded;
    private isUserWantsSelected;
    private addCheckboxIfNeeded;
    private onKeyDown;
    onCellDblClicked(mouseEvent: MouseEvent): void;
}
