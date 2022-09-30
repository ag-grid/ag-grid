import { BeanStub } from "../../context/beanStub";
import { Column, ColumnPinnedType } from "../../entities/column";
import { IHeaderColumn } from "../../entities/iHeaderColumn";
import { HeaderRowType } from "../row/headerRowComp";
import { HeaderRowCtrl } from "../row/headerRowCtrl";
import { FocusService } from "../../focusService";
import { ColumnGroup } from "../../entities/columnGroup";
import { HeaderCellCtrl } from "../cells/column/headerCellCtrl";
import { HeaderGroupCellCtrl } from "../cells/columnGroup/headerGroupCellCtrl";
export interface IHeaderRowContainerComp {
    setCenterWidth(width: string): void;
    setContainerTransform(transform: string): void;
    setPinnedContainerWidth(width: string): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setCtrls(ctrls: HeaderRowCtrl[]): void;
}
export declare class HeaderRowContainerCtrl extends BeanStub {
    private ctrlsService;
    private scrollVisibleService;
    private pinnedWidthService;
    private columnModel;
    focusService: FocusService;
    private pinned;
    private comp;
    private filtersRowCtrl;
    private columnsRowCtrl;
    private groupsRowCtrls;
    private eViewport;
    constructor(pinned: ColumnPinnedType);
    setComp(comp: IHeaderRowContainerComp, eGui: HTMLElement): void;
    private setupDragAndDrop;
    refresh(keepColumns?: boolean): void;
    private restoreFocusOnHeader;
    private getAllCtrls;
    private onGridColumnsChanged;
    private setupCenterWidth;
    setHorizontalScroll(offset: number): void;
    private resetScrollLeft;
    private setupPinnedWidth;
    getHeaderCtrlForColumn(column: Column): HeaderCellCtrl | undefined;
    getHeaderCtrlForColumn(column: ColumnGroup): HeaderGroupCellCtrl | undefined;
    getHtmlElementForColumnHeader(column: ColumnGroup): HTMLElement | null;
    getHtmlElementForColumnHeader(column: Column): HTMLElement | null;
    getRowType(rowIndex: number): HeaderRowType | undefined;
    focusHeader(rowIndex: number, column: IHeaderColumn, event?: KeyboardEvent): boolean;
    getRowCount(): number;
}
