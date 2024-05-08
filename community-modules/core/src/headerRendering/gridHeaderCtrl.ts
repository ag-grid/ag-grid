import { ColumnModel } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";
import { Autowired } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";

export interface IGridHeaderComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setHeightAndMinHeight(height: string): void;
}

export class GridHeaderCtrl extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private comp: IGridHeaderComp;
    private eGui: HTMLElement;
    private headerHeight: number;

    public setComp(comp: IGridHeaderComp, eGui: HTMLElement, eFocusableElement: HTMLElement): void {
        this.comp = comp;
        this.eGui = eGui;

        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));

        this.setupHeaderHeight();

        const listener = this.onHeaderContextMenu.bind(this)
        this.addManagedListener(this.eGui, 'contextmenu', listener);
        this.mockContextMenuForIPad(listener);

        this.ctrlsService.register('gridHeaderCtrl',this);
    }

    private setupHeaderHeight(): void {
        const listener = this.setHeaderHeight.bind(this);
        listener();

        this.addManagedPropertyListener('headerHeight', listener);
        this.addManagedPropertyListener('pivotHeaderHeight', listener);
        this.addManagedPropertyListener('groupHeaderHeight', listener);
        this.addManagedPropertyListener('pivotGroupHeaderHeight', listener);
        this.addManagedPropertyListener('floatingFiltersHeight', listener);

        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_GRID_STYLES_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED, listener);
    }

    public getHeaderHeight(): number {
        return this.headerHeight;
    }

    private setHeaderHeight(): void {
        const { columnModel } = this;

        let numberOfFloating = 0;
        let headerRowCount = columnModel.getHeaderRowCount();
        let totalHeaderHeight: number;

        const groupHeight = this.columnModel.getColumnGroupHeaderRowHeight();
        const headerHeight = this.columnModel.getColumnHeaderRowHeight();

        const numberOfNonGroups = 1 + numberOfFloating;
        const numberOfGroups = headerRowCount - numberOfNonGroups;

        totalHeaderHeight = numberOfFloating * columnModel.getFloatingFiltersHeight()!;
        totalHeaderHeight += numberOfGroups * groupHeight!;
        totalHeaderHeight += headerHeight!;

        if (this.headerHeight === totalHeaderHeight) { return; }

        this.headerHeight = totalHeaderHeight;

        // one extra pixel is needed here to account for the
        // height of the border
        const px = `${totalHeaderHeight + 1}px`;
        this.comp.setHeightAndMinHeight(px);

        this.eventService.dispatchEvent({
            type: Events.EVENT_HEADER_HEIGHT_CHANGED
        });
    }

    private onDisplayedColumnsChanged(): void {
        const columns = this.columnModel.getAllDisplayedColumns();
        const shouldAllowOverflow = columns.some(col => col.isSpanHeaderHeight());

        this.comp.addOrRemoveCssClass('ag-header-allow-overflow', shouldAllowOverflow);
    }

    protected onTabKeyDown(e: KeyboardEvent): void {

     }


    protected onFocusOut(e: FocusEvent): void {
        const { relatedTarget } = e;

        if (!relatedTarget && this.eGui.contains(this.gos.getActiveDomElement())) { return; }
    }

    private onHeaderContextMenu(mouseEvent?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent): void {

    }

    private mockContextMenuForIPad(listener: (mouseListener?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => void): void {

    }
}
