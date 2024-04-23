import { UserCompDetails } from "../../components/framework/userComponentFactory";
import { BeanStub } from "../../context/beanStub";
import { CellRendererSelectorFunc, ColumnFunctionCallbackParams } from "../../entities/colDef";
import { ICellRendererParams } from "./iCellRenderer";
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
export interface TotalValueGetterFunc {
    (params: GroupCellRendererParams): any;
}
export type GroupCheckboxSelectionCallbackParams<TData = any, TValue = any> = ColumnFunctionCallbackParams<TData> & GroupCellRendererParams<TData, TValue>;
export interface GroupCheckboxSelectionCallback<TData = any, TValue = any> {
    (params: GroupCheckboxSelectionCallbackParams<TData, TValue>): boolean;
}
/**
 * Parameters used in `colDef.cellRendererParams` to configure a  Group Cell Renderer (`agGroupCellRenderer`).
 */
export interface IGroupCellRendererParams<TData = any, TValue = any> {
    /** Set to `true` to not include any padding (indentation) in the child rows. */
    suppressPadding?: boolean;
    /** Set to `true` to suppress expand on double click. */
    suppressDoubleClickExpand?: boolean;
    /** Set to `true` to suppress expand on <kbd>↵ Enter</kbd> */
    suppressEnterExpand?: boolean;
    /** The value getter for the footer text. Can be a function or expression. @deprecated v31.2 use `totalValueGetter` */
    footerValueGetter?: string | FooterValueGetterFunc;
    /** The value getter for the total row text. Can be a function or expression. */
    totalValueGetter?: string | TotalValueGetterFunc;
    /** If `true`, count is not displayed beside the name. */
    suppressCount?: boolean;
    /**
     * Set to `true`, or a function that returns `true`, if a checkbox should be included.
     */
    checkbox?: boolean | GroupCheckboxSelectionCallback<TData, TValue>;
    /** The renderer to use for inside the cell (after grouping functions are added) */
    innerRenderer?: any;
    /** Additional params to customise to the `innerRenderer`. */
    innerRendererParams?: any;
    /** Callback to enable different innerRenderers to be used based of value of params. */
    innerRendererSelector?: CellRendererSelectorFunc;
}
export interface IGroupCellRendererFullRowParams {
    /**
     * Only when in fullWidth, this gives whether the comp is pinned or not.
     * If not doing fullWidth, then this is not provided, as pinned can be got from the column.
     */
    pinned?: "left" | "right" | null;
    /** 'true' if comp is showing full width. */
    fullWidth: boolean;
    rowDrag?: boolean;
}
/**
 * Parameters provided by the grid to the `init` method of a `agGroupCellRenderer`.
 * Do not use in `colDef.cellRendererParams` - see `IGroupCellRendererParams` instead.
 */
export type GroupCellRendererParams<TData = any, TValue = any> = IGroupCellRendererParams & ICellRendererParams<TData, TValue> & IGroupCellRendererFullRowParams;
export declare class GroupCellRendererCtrl extends BeanStub {
    private expressionService;
    private valueService;
    private columnModel;
    private userComponentFactory;
    private ctrlsService;
    private params;
    private showingValueForOpenedParent;
    private displayedGroupNode;
    private eGui;
    private eExpanded;
    private eContracted;
    private eCheckbox;
    private expandListener;
    private indentClass;
    private comp;
    private compClass;
    init(comp: IGroupCellRenderer, eGui: HTMLElement, eCheckbox: HTMLElement, eExpanded: HTMLElement, eContracted: HTMLElement, compClass: any, params: GroupCellRendererParams): void;
    getCellAriaRole(): string;
    protected destroy(): void;
    private refreshAriaExpanded;
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
    private onExpandClicked;
    private onExpandOrContract;
    private scrollToStickyNode;
    private isExpandable;
    private showExpandAndContractIcons;
    private onRowNodeIsExpandableChanged;
    private setupIndent;
    private setIndent;
    private addFullWidthRowDraggerIfNeeded;
    private isUserWantsSelected;
    private addCheckboxIfNeeded;
    private onKeyDown;
    private onCellDblClicked;
}
