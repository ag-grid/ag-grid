import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { Autowired, PostConstruct, PreDestroy } from '../context/context';
import { DropTarget } from '../dragAndDrop/dragAndDropService';
import { ColumnController } from '../columnController/columnController';
import { Events } from '../events';
import { HeaderRowComp, HeaderRowType } from './headerRowComp';
import { BodyDropTarget } from './bodyDropTarget';
import { ScrollVisibleService } from '../gridPanel/scrollVisibleService';
import { Component } from '../widgets/component';
import { Constants } from '../constants/constants';
import { setFixedWidth } from '../utils/dom';
import { BeanStub } from "../context/beanStub";
import { GridPanel } from '../gridPanel/gridPanel';
import { NumberSequence } from "../utils";

export class HeaderContainer extends BeanStub {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;

    private eContainer: HTMLElement;
    private eViewport: HTMLElement;

    private pinned: string;
    private scrollWidth: number;
    private dropTarget: DropTarget;

    private filtersRowComp: HeaderRowComp;
    private columnsRowComp: HeaderRowComp;
    private groupsRowComps: HeaderRowComp[] = [];

    constructor(eContainer: HTMLElement, eViewport: HTMLElement, pinned: string) {
        super();
        this.eContainer = eContainer;
        this.pinned = pinned;
        this.eViewport = eViewport;
    }

    public forEachHeaderElement(callback: (renderedHeaderElement: Component) => void): void {
        if (this.groupsRowComps) {
            this.groupsRowComps.forEach(c => c.forEachHeaderElement(callback));
        }
        if (this.columnsRowComp) {
            this.columnsRowComp.forEachHeaderElement(callback);
        }
        if (this.filtersRowComp) {
            this.columnsRowComp.forEachHeaderElement(callback);
        }
    }

    @PostConstruct
    private init(): void {
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();

        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed

        // this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this));
        // this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));

        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
    }

    // if row group changes, that means we may need to add aggFuncs to the column headers,
    // if the grid goes from no aggregation (ie no grouping) to grouping
    private onColumnRowGroupChanged(): void {
        this.refresh();
    }

    // if the agg func of a column changes, then we may need to update the agg func in columns header
    private onColumnValueChanged(): void {
        this.refresh();
    }

    private onColumnResized(): void {
        this.setWidthOfPinnedContainer();
    }

    private onDisplayedColumnsChanged(): void {
        this.setWidthOfPinnedContainer();
    }

    private onScrollVisibilityChanged(): void {
        this.setWidthOfPinnedContainer();
    }

    private setWidthOfPinnedContainer(): void {
        const pinningLeft = this.pinned === Constants.PINNED_LEFT;
        const pinningRight = this.pinned === Constants.PINNED_RIGHT;
        const controller = this.columnController;
        const isRtl = this.gridOptionsWrapper.isEnableRtl();

        if (pinningLeft || pinningRight) {
            // size to fit all columns
            let width = controller[pinningLeft ? 'getPinnedLeftContainerWidth' : 'getPinnedRightContainerWidth']();

            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            const addPaddingForScrollbar = this.scrollVisibleService.isVerticalScrollShowing() && ((isRtl && pinningLeft) || (!isRtl && pinningRight));

            if (addPaddingForScrollbar) {
                width += this.scrollWidth;
            }

            setFixedWidth(this.eContainer, width);
        }
    }

    public getRowComps(): HeaderRowComp[] {
        let res: HeaderRowComp[] = [];
        if (this.groupsRowComps) {
            res = res.concat(this.groupsRowComps);
        }
        if (this.columnsRowComp) {
            res.push(this.columnsRowComp);
        }
        if (this.filtersRowComp) {
            res.push(this.filtersRowComp);
        }
        return res;
    }

    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    private onGridColumnsChanged() {
        this.refresh(true);
    }

    // we expose this for gridOptions.api.refreshHeader() to call
    public refresh(keepColumns = false): void {
        this.refreshRowComps(keepColumns);
    }

    public setupDragAndDrop(gridComp: GridPanel): void {
        const dropContainer = this.eViewport ? this.eViewport : this.eContainer;
        const bodyDropTarget = new BodyDropTarget(this.pinned, dropContainer);
        this.createManagedBean(bodyDropTarget);
        bodyDropTarget.registerGridComp(gridComp);
    }

    @PreDestroy
    private destroyRowComps(keepColumns = false): void {

        this.groupsRowComps.forEach(this.destroyRowComp.bind(this));
        this.groupsRowComps = [];

        this.destroyRowComp(this.filtersRowComp);
        this.filtersRowComp = undefined;

        if (!keepColumns) {
            this.destroyRowComp(this.columnsRowComp);
            this.columnsRowComp = undefined;
        }
    }

    private destroyRowComp(rowComp: HeaderRowComp): void {
        if (rowComp) {
            this.destroyBean(rowComp);
            this.eContainer.removeChild(rowComp.getGui());
        }
    }

    private refreshRowComps(keepColumns = false): void {

        const sequence = new NumberSequence();

        const refreshColumnGroups = () => {
            const groupRowCount = this.columnController.getHeaderRowCount() - 1;

            this.groupsRowComps.forEach(this.destroyRowComp.bind(this));
            this.groupsRowComps = [];

            for (let i = 0; i < groupRowCount; i++) {
                const rowComp = this.createBean(
                    new HeaderRowComp(sequence.next(), HeaderRowType.COLUMN_GROUP, this.pinned, this.dropTarget));
                this.groupsRowComps.push(rowComp);
            }
        };

        const refreshColumns = () => {
            const rowIndex = sequence.next();

            if (this.columnsRowComp) {
                const rowIndexMismatch = this.columnsRowComp.getRowIndex() !== rowIndex;
                if (!keepColumns || rowIndexMismatch) {
                    this.destroyRowComp(this.columnsRowComp);
                    this.columnsRowComp = undefined;
                }
            }

            if (!this.columnsRowComp) {
                this.columnsRowComp = this.createBean(
                    new HeaderRowComp(rowIndex, HeaderRowType.COLUMN, this.pinned, this.dropTarget));
            }
        };

        const refreshFilters = () => {
            this.destroyRowComp(this.filtersRowComp);
            this.filtersRowComp = undefined;

            const includeFloatingFilter = !this.columnController.isPivotMode() && this.columnController.hasFloatingFilters();
            if (includeFloatingFilter) {
                this.filtersRowComp = this.createBean(
                    new HeaderRowComp(sequence.next(), HeaderRowType.FLOATING_FILTER, this.pinned, this.dropTarget));
            }
        };

        refreshColumnGroups();
        refreshColumns();
        refreshFilters();

        // this re-adds the this.columnsRowComp, which is fine, it just means the DOM will rearrange then,
        // taking it out of the last position and re-inserting relative to the other rows.
        this.getRowComps().forEach(rowComp => this.eContainer.appendChild(rowComp.getGui()));
    }

    private createRowComps(): void {

        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        const rowsWithGroupsCount = this.columnController.getHeaderRowCount() - 1;
        let rowIndex = 0;

        const createHeaderRowComp = (type: HeaderRowType, index: number): HeaderRowComp => {
            return this.createBean(new HeaderRowComp(index, type, this.pinned, this.dropTarget));
        };

        for (let i = 0; i < rowsWithGroupsCount; i++) {
            const rowComp = createHeaderRowComp(HeaderRowType.COLUMN_GROUP, rowIndex++);
            this.groupsRowComps.push(rowComp);
        }

        if (this.columnsRowComp && this.columnsRowComp.getRowIndex() !== rowIndex) {
            this.destroyRowComp(this.columnsRowComp);
            this.columnsRowComp = undefined;
        }

        if (!this.columnsRowComp) {
            this.columnsRowComp = createHeaderRowComp(HeaderRowType.COLUMN, rowIndex++);
        }

        const includeFloatingFilter = !this.columnController.isPivotMode() && this.columnController.hasFloatingFilters();
        if (includeFloatingFilter) {
            this.filtersRowComp = createHeaderRowComp(HeaderRowType.FLOATING_FILTER, rowIndex++);
        }

        // this re-adds the this.columnsRowComp, which is fine, it just means the DOM will rearrange then,
        // taking it out of the last position and re-inserting relative to the other rows.
        this.getRowComps().forEach(rowComp => this.eContainer.appendChild(rowComp.getGui()));
    }
}
