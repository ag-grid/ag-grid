import { UserCompDetails } from "../../components/framework/userComponentFactory";
import { BeanStub } from "../../context/beanStub";
import { CellRendererSelectorFunc } from "../../entities/colDef";
import { ICellRendererComp, ICellRendererFunc, ICellRendererParams } from "./iCellRenderer";
export interface IGroupCellRenderer {
    setInnerRenderer(compDetails: UserCompDetails | undefined, valueToDisplay: any): void;
    setChildCount(count: string): void;
    setCheckboxVisible(value: boolean): void;
    setExpandedDisplayed(value: boolean): void;
    setContractedDisplayed(value: boolean): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
}
export interface FooterValueGetterFunc {
    (params: GroupCellRendererParams): any;
}
export interface GroupCellRendererParams extends ICellRendererParams {
    /**
     * Only when in fullWidth, this gives whether the comp is pinned or not.
     * If not doing fullWidth, then this is not provided, as pinned can be got from the column.
     */
    pinned: string;
    /** 'true' if comp is showing full width. */
    fullWidth: boolean;
    /** Set to `true` to not include any padding (indentation) in the child rows. */
    suppressPadding: boolean;
    /** Set to `true` to suppress expand on double click. */
    suppressDoubleClickExpand: boolean;
    /** Set to `true` to suppress expand on <kbd>Enter</kbd> */
    suppressEnterExpand: boolean;
    /** The value getter for the footer text. Can be a function or expression. */
    footerValueGetter: string | FooterValueGetterFunc;
    /** If `true`, count is not displayed beside the name. */
    suppressCount: boolean;
    /** If `true`, a selection checkbox is included.  */
    checkbox: any;
    rowDrag?: boolean;
    /** The renderer to use for inside the cell (after grouping functions are added) */
    innerRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    /**
     * @deprecated as of v27, use innerRenderer for Framework components
     * Same as `innerRenderer` but for a framework component. */
    innerRendererFramework?: any;
    /** Additional params to customise to the `innerRenderer`. */
    innerRendererParams?: any;
    /** Callback to enable different innerRenderers to be used based of value of params. */
    innerRendererSelector?: CellRendererSelectorFunc;
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
