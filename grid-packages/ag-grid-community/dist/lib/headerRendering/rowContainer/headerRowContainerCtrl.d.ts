import { BeanStub } from "../../context/beanStub";
import { Column } from "../../entities/column";
import { IHeaderColumn } from "../../entities/iHeaderColumn";
import { HeaderRowType } from "../row/headerRowComp";
import { HeaderRowCtrl } from "../row/headerRowCtrl";
import { FocusService } from "../../focusService";
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
    constructor(pinned: string | null);
    setComp(comp: IHeaderRowContainerComp, eGui: HTMLElement): void;
    private setupDragAndDrop;
    refresh(keepColumns?: boolean): void;
    private restoreFocusOnHeader;
    private getAllCtrls;
    private onGridColumnsChanged;
    private setupCenterWidth;
    setHorizontalScroll(offset: number): void;
    private setupPinnedWidth;
    getHtmlElementForColumnHeader(column: Column): HTMLElement | undefined;
    getRowType(rowIndex: number): HeaderRowType | undefined;
    focusHeader(rowIndex: number, column: IHeaderColumn): boolean;
    getRowCount(): number;
}
