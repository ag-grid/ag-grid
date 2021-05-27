import { Autowired, PostConstruct, PreDestroy } from '../context/context';
import { ColumnModel } from '../columns/columnModel';
import { Events } from '../events';
import { HeaderRowComp, HeaderRowType } from './headerRowComp';
import { BodyDropTarget } from './bodyDropTarget';
import { ScrollVisibleService } from '../gridBodyComp/scrollVisibleService';
import { Component } from '../widgets/component';
import { Constants } from '../constants/constants';
import { setFixedWidth } from '../utils/dom';
import { BeanStub } from "../context/beanStub";
import { NumberSequence } from "../utils";

export class HeaderContainer extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;

    private eContainer: HTMLElement;
    private eViewport: HTMLElement | null;

    private pinned: string | null;

    private filtersRowComp: HeaderRowComp | undefined;
    private columnsRowComp: HeaderRowComp | undefined;
    private groupsRowComps: HeaderRowComp[] = [];

    constructor(eContainer: HTMLElement, eViewport: HTMLElement | null, pinned: string | null) {
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
            this.filtersRowComp.forEachHeaderElement(callback);
        }
    }

    @PostConstruct
    private init(): void {
        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLLBAR_WIDTH_CHANGED, this.onScrollbarWidthChanged.bind(this));
        this.setupDragAndDrop();
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

    private onScrollbarWidthChanged(): void {
        this.setWidthOfPinnedContainer();
    }

    private setWidthOfPinnedContainer(): void {
        const pinningLeft = this.pinned === Constants.PINNED_LEFT;
        const pinningRight = this.pinned === Constants.PINNED_RIGHT;
        const controller = this.columnModel;
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        const scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();

        if (pinningLeft || pinningRight) {
            // size to fit all columns
            let width = controller[pinningLeft ? 'getDisplayedColumnsLeftWidth' : 'getDisplayedColumnsRightWidth']();

            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            const addPaddingForScrollbar = this.scrollVisibleService.isVerticalScrollShowing() && ((isRtl && pinningLeft) || (!isRtl && pinningRight));

            if (addPaddingForScrollbar) {
                width += scrollbarWidth;
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

    private setupDragAndDrop(): void {
        // center section has viewport, but pinned sections do not
        const dropContainer = this.eViewport ? this.eViewport : this.eContainer;
        const bodyDropTarget = new BodyDropTarget(this.pinned, dropContainer);
        this.createManagedBean(bodyDropTarget);
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

    private destroyRowComp(rowComp?: HeaderRowComp): void {
        if (rowComp) {
            this.destroyBean(rowComp);
            this.eContainer.removeChild(rowComp.getGui());
        }
    }

    private refreshRowComps(keepColumns = false): void {
        const sequence = new NumberSequence();

        const refreshColumnGroups = () => {
            const groupRowCount = this.columnModel.getHeaderRowCount() - 1;

            this.groupsRowComps.forEach(this.destroyRowComp.bind(this));
            this.groupsRowComps = [];

            for (let i = 0; i < groupRowCount; i++) {
                const rowComp = this.createBean(
                    new HeaderRowComp(sequence.next(), HeaderRowType.COLUMN_GROUP, this.pinned));
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
                    new HeaderRowComp(rowIndex, HeaderRowType.COLUMN, this.pinned));
            }
        };

        const refreshFilters = () => {

            const includeFloatingFilter = !this.columnModel.isPivotMode() && this.columnModel.hasFloatingFilters();

            const destroyPreviousComp = () => {
                this.destroyRowComp(this.filtersRowComp);
                this.filtersRowComp = undefined;
            };

            if (!includeFloatingFilter) {
                destroyPreviousComp();
                return;
            }

            const rowIndex = sequence.next();

            if (this.filtersRowComp) {
                const rowIndexMismatch = this.filtersRowComp.getRowIndex() !== rowIndex;
                if (!keepColumns || rowIndexMismatch) {
                    destroyPreviousComp();
                }
            }

            if (!this.filtersRowComp) {
                this.filtersRowComp = this.createBean(
                    new HeaderRowComp(rowIndex, HeaderRowType.FLOATING_FILTER, this.pinned));
            }
        };

        refreshColumnGroups();
        refreshColumns();
        refreshFilters();

        // this re-adds the this.columnsRowComp, which is fine, it just means the DOM will rearrange then,
        // taking it out of the last position and re-inserting relative to the other rows.
        this.getRowComps().forEach(rowComp => this.eContainer.appendChild(rowComp.getGui()));
    }
}
