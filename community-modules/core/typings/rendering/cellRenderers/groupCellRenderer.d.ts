import { Component } from "../../widgets/component";
import { ICellRendererComp, ICellRendererFunc, ICellRendererParams } from "./iCellRenderer";
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
export declare class GroupCellRenderer extends Component implements ICellRendererComp {
    private static TEMPLATE;
    private rowRenderer;
    private expressionService;
    private valueFormatterService;
    private columnController;
    private userComponentFactory;
    private eExpanded;
    private eContracted;
    private eCheckbox;
    private eValue;
    private eChildCount;
    private params;
    private draggedFromHideOpenParents;
    private displayedGroup;
    private cellIsBlank;
    private indentClass;
    private innerCellRenderer;
    constructor();
    private isTopLevelFooter;
    init(params: GroupCellRendererParams): void;
    private isEmbeddedRowMismatch;
    private setIndent;
    private setPaddingDeprecatedWay;
    private setupIndent;
    private addValueElement;
    private addFooterValue;
    private addGroupValue;
    private useInnerRenderer;
    private useFullWidth;
    private addFullWidthRowDraggerIfNeeded;
    private addChildCount;
    private updateChildCount;
    private isUserWantsSelected;
    private addCheckboxIfNeeded;
    private addExpandAndContract;
    private onRowNodeIsExpandableChanged;
    private onKeyDown;
    private setupDragOpenParents;
    onExpandClicked(mouseEvent: MouseEvent): void;
    onCellDblClicked(mouseEvent: MouseEvent): void;
    onExpandOrContract(): void;
    private isShowRowGroupForThisRow;
    private isExpandable;
    private showExpandAndContractIcons;
    destroy(): void;
    refresh(): boolean;
}
