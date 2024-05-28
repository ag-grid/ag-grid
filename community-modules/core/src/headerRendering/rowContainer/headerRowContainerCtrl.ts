import type { ColumnModel } from '../../columns/columnModel';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { CtrlsService } from '../../ctrlsService';
import type { ColumnPinnedType } from '../../entities/column';
import { Column } from '../../entities/column';
import type { ColumnGroup } from '../../entities/columnGroup';
import { Events } from '../../eventKeys';
import type { FilterManager } from '../../filter/filterManager';
import type { FocusService } from '../../focusService';
import { CenterWidthFeature } from '../../gridBodyComp/centerWidthFeature';
import type { PinnedWidthService } from '../../gridBodyComp/pinnedWidthService';
import type { ScrollVisibleService } from '../../gridBodyComp/scrollVisibleService';
import type { IHeaderColumn } from '../../interfaces/iHeaderColumn';
import { NumberSequence } from '../../utils/numberSequence';
import type { HeaderCellCtrl } from '../cells/column/headerCellCtrl';
import type { HeaderGroupCellCtrl } from '../cells/columnGroup/headerGroupCellCtrl';
import { BodyDropTarget } from '../columnDrag/bodyDropTarget';
import type { HeaderPosition } from '../common/headerPosition';
import { HeaderRowType } from '../row/headerRowComp';
import { HeaderRowCtrl } from '../row/headerRowCtrl';

export interface IHeaderRowContainerComp {
    setCenterWidth(width: string): void;
    setViewportScrollLeft(left: number): void;
    setPinnedContainerWidth(width: string): void;
    setDisplayed(displayed: boolean): void;
    setCtrls(ctrls: HeaderRowCtrl[]): void;
}

export class HeaderRowContainerCtrl extends BeanStub {
    private ctrlsService: CtrlsService;
    private scrollVisibleService: ScrollVisibleService;
    private pinnedWidthService: PinnedWidthService;
    private columnModel: ColumnModel;
    private focusService: FocusService;
    private filterManager: FilterManager;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.ctrlsService = beans.ctrlsService;
        this.scrollVisibleService = beans.scrollVisibleService;
        this.pinnedWidthService = beans.pinnedWidthService;
        this.columnModel = beans.columnModel;
        this.focusService = beans.focusService;
        this.filterManager = beans.filterManager;
    }

    private pinned: ColumnPinnedType;
    private comp: IHeaderRowContainerComp;
    private hidden: boolean = false;
    private includeFloatingFilter: boolean = false;

    private filtersRowCtrl: HeaderRowCtrl | undefined;
    private columnsRowCtrl: HeaderRowCtrl | undefined;
    private groupsRowCtrls: HeaderRowCtrl[] = [];
    private eViewport: HTMLElement;

    constructor(pinned: ColumnPinnedType) {
        super();
        this.pinned = pinned;
    }

    public setComp(comp: IHeaderRowContainerComp, eGui: HTMLElement): void {
        this.comp = comp;
        this.eViewport = eGui;

        this.setupCenterWidth();
        this.setupPinnedWidth();

        this.setupDragAndDrop(this.eViewport);

        this.addManagedListener(
            this.eventService,
            Events.EVENT_GRID_COLUMNS_CHANGED,
            this.onGridColumnsChanged.bind(this)
        );

        this.addManagedListener(
            this.eventService,
            Events.EVENT_DISPLAYED_COLUMNS_CHANGED,
            this.onDisplayedColumnsChanged.bind(this)
        );

        this.addManagedListener(
            this.eventService,
            Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED,
            this.onDisplayedColumnsChanged.bind(this)
        );

        this.ctrlsService.registerHeaderContainer(this, this.pinned);

        if (this.columnModel.isReady()) {
            this.refresh();
        }
    }

    private setupDragAndDrop(dropContainer: HTMLElement): void {
        const bodyDropTarget = new BodyDropTarget(this.pinned, dropContainer);
        this.createManagedBean(bodyDropTarget);
    }

    public refresh(keepColumns = false): void {
        const sequence = new NumberSequence();
        const focusedHeaderPosition = this.focusService.getFocusHeaderToUseAfterRefresh();

        const refreshColumnGroups = () => {
            const groupRowCount = this.columnModel.getHeaderRowCount() - 1;

            this.groupsRowCtrls = this.destroyBeans(this.groupsRowCtrls);

            for (let i = 0; i < groupRowCount; i++) {
                const ctrl = this.createBean(
                    new HeaderRowCtrl(sequence.next(), this.pinned, HeaderRowType.COLUMN_GROUP)
                );
                this.groupsRowCtrls.push(ctrl);
            }
        };

        const refreshColumns = () => {
            const rowIndex = sequence.next();

            const needNewInstance =
                !this.hidden &&
                (this.columnsRowCtrl == null || !keepColumns || this.columnsRowCtrl.getRowIndex() !== rowIndex);
            const shouldDestroyInstance = needNewInstance || this.hidden;

            if (shouldDestroyInstance) {
                this.columnsRowCtrl = this.destroyBean(this.columnsRowCtrl);
            }

            if (needNewInstance) {
                this.columnsRowCtrl = this.createBean(new HeaderRowCtrl(rowIndex, this.pinned, HeaderRowType.COLUMN));
            }
        };

        const refreshFilters = () => {
            this.includeFloatingFilter = this.filterManager.hasFloatingFilters() && !this.hidden;

            const destroyPreviousComp = () => {
                this.filtersRowCtrl = this.destroyBean(this.filtersRowCtrl);
            };

            if (!this.includeFloatingFilter) {
                destroyPreviousComp();
                return;
            }

            const rowIndex = sequence.next();

            if (this.filtersRowCtrl) {
                const rowIndexMismatch = this.filtersRowCtrl.getRowIndex() !== rowIndex;
                if (!keepColumns || rowIndexMismatch) {
                    destroyPreviousComp();
                }
            }

            if (!this.filtersRowCtrl) {
                this.filtersRowCtrl = this.createBean(
                    new HeaderRowCtrl(rowIndex, this.pinned, HeaderRowType.FLOATING_FILTER)
                );
            }
        };

        refreshColumnGroups();
        refreshColumns();
        refreshFilters();

        const allCtrls = this.getAllCtrls();
        this.comp.setCtrls(allCtrls);

        this.restoreFocusOnHeader(focusedHeaderPosition);
    }

    private restoreFocusOnHeader(position: HeaderPosition | null): void {
        if (position == null || position.column.getPinned() != this.pinned) {
            return;
        }

        this.focusService.focusHeaderPosition({ headerPosition: position });
    }

    private getAllCtrls(): HeaderRowCtrl[] {
        const res: HeaderRowCtrl[] = [...this.groupsRowCtrls];

        if (this.columnsRowCtrl) {
            res.push(this.columnsRowCtrl);
        }

        if (this.filtersRowCtrl) {
            res.push(this.filtersRowCtrl);
        }

        return res;
    }

    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    private onGridColumnsChanged() {
        this.refresh(true);
    }

    private onDisplayedColumnsChanged(): void {
        const includeFloatingFilter = this.filterManager.hasFloatingFilters() && !this.hidden;
        if (this.includeFloatingFilter !== includeFloatingFilter) {
            this.refresh(true);
        }
    }

    private setupCenterWidth(): void {
        if (this.pinned != null) {
            return;
        }

        this.createManagedBean(new CenterWidthFeature((width) => this.comp.setCenterWidth(`${width}px`), true));
    }

    public setHorizontalScroll(offset: number): void {
        this.comp.setViewportScrollLeft(offset);
    }

    private setupPinnedWidth(): void {
        if (this.pinned == null) {
            return;
        }

        const pinningLeft = this.pinned === 'left';
        const pinningRight = this.pinned === 'right';

        this.hidden = true;

        const listener = () => {
            const width = pinningLeft
                ? this.pinnedWidthService.getPinnedLeftWidth()
                : this.pinnedWidthService.getPinnedRightWidth();
            if (width == null) {
                return;
            } // can happen at initialisation, width not yet set

            const hidden = width == 0;
            const hiddenChanged = this.hidden !== hidden;
            const isRtl = this.gos.get('enableRtl');
            const scrollbarWidth = this.gos.getScrollbarWidth();

            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            const addPaddingForScrollbar =
                this.scrollVisibleService.isVerticalScrollShowing() &&
                ((isRtl && pinningLeft) || (!isRtl && pinningRight));
            const widthWithPadding = addPaddingForScrollbar ? width + scrollbarWidth : width;

            this.comp.setPinnedContainerWidth(`${widthWithPadding}px`);
            this.comp.setDisplayed(!hidden);

            if (hiddenChanged) {
                this.hidden = hidden;
                this.refresh();
            }
        };

        this.addManagedListener(this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_SCROLLBAR_WIDTH_CHANGED, listener);
    }

    public getHeaderCtrlForColumn(column: Column): HeaderCellCtrl | undefined;
    public getHeaderCtrlForColumn(column: ColumnGroup): HeaderGroupCellCtrl | undefined;
    public getHeaderCtrlForColumn(column: any): any {
        if (column instanceof Column) {
            if (!this.columnsRowCtrl) {
                return;
            }
            return this.columnsRowCtrl.getHeaderCellCtrl(column);
        }

        if (this.groupsRowCtrls.length === 0) {
            return;
        }

        for (let i = 0; i < this.groupsRowCtrls.length; i++) {
            const ctrl = this.groupsRowCtrls[i].getHeaderCellCtrl(column);

            if (ctrl) {
                return ctrl;
            }
        }
    }

    /* tslint:disable */
    public getHtmlElementForColumnHeader(column: ColumnGroup): HTMLElement | null;
    public getHtmlElementForColumnHeader(column: Column): HTMLElement | null;
    public getHtmlElementForColumnHeader(column: any): any {
        /* tslint:enable */
        const cellCtrl = this.getHeaderCtrlForColumn(column);

        if (!cellCtrl) {
            return null;
        }

        return cellCtrl.getGui();
    }

    public getRowType(rowIndex: number): HeaderRowType | undefined {
        const allCtrls = this.getAllCtrls();
        const ctrl = allCtrls[rowIndex];
        return ctrl ? ctrl.getType() : undefined;
    }

    public focusHeader(rowIndex: number, column: IHeaderColumn, event?: KeyboardEvent): boolean {
        const allCtrls = this.getAllCtrls();
        const ctrl = allCtrls[rowIndex];
        if (!ctrl) {
            return false;
        }

        return ctrl.focusHeader(column, event);
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getRowCount(): number {
        return this.groupsRowCtrls.length + (this.columnsRowCtrl ? 1 : 0) + (this.filtersRowCtrl ? 1 : 0);
    }

    public override destroy(): void {
        if (this.filtersRowCtrl) {
            this.filtersRowCtrl = this.destroyBean(this.filtersRowCtrl);
        }

        if (this.columnsRowCtrl) {
            this.columnsRowCtrl = this.destroyBean(this.columnsRowCtrl);
        }

        if (this.groupsRowCtrls && this.groupsRowCtrls.length) {
            this.groupsRowCtrls = this.destroyBeans(this.groupsRowCtrls);
        }

        super.destroy();
    }
}
