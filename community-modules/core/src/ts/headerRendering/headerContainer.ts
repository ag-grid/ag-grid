import { Autowired, PostConstruct, PreDestroy } from '../context/context';
import { ColumnModel } from '../columns/columnModel';
import { Events } from '../events';
import { HeaderRowComp, HeaderRowType } from './headerRowComp';
import { BodyDropTarget } from './bodyDropTarget';
import { ScrollVisibleService } from '../gridBodyComp/scrollVisibleService';
import { Component } from '../widgets/component';
import { Constants } from '../constants/constants';
import { setFixedWidth, ensureDomOrder } from '../utils/dom';
import { NumberSequence } from "../utils";
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { CtrlsService } from '../ctrlsService';
import { RefSelector } from '../widgets/componentAnnotations';
import { PinnedWidthService } from '../gridBodyComp/pinnedWidthService';
import { CenterWidthFeature } from '../gridBodyComp/centerWidthFeature';

export class HeaderContainer extends Component {

    private static PINNED_TEMPLATE =  /* html */ `<div role="presentation"/>`;

    private static CENTER_TEMPLATE =  /* html */ 
        `<div role="presentation">
            <div class="ag-header-container" ref="eContainer" role="rowgroup"></div>
        <div>`;

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('pinnedWidthService') private pinnedWidthService: PinnedWidthService;

    @RefSelector('eContainer') private eContainer: HTMLElement;

    private pinned: string | null;

    private filtersRowComp: HeaderRowComp | undefined;
    private columnsRowComp: HeaderRowComp | undefined;
    private groupsRowComps: HeaderRowComp[] = [];

    private printLayout: boolean;

    constructor(pinned: string | null) {
        super();
        this.pinned = pinned;
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
        this.selectAndSetTemplate();
        this.selectTopLevelClass();

        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.setupDragAndDrop();

        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));

        this.ctrlsService.registerHeaderContainer(this, this.pinned);

        this.setupPinnedWidth();
        this.setupCenterWidth();

        if (this.columnModel.isReady()) {
            this.refresh();
        }
    }

    public setHorizontalScroll(offset: number): void {
        this.eContainer.style.transform = `translateX(${offset}px)`;
    }

    private setupCenterWidth(): void {
        if (this.pinned!=null) { return; }
        this.createManagedBean(new CenterWidthFeature(width => this.eContainer.style.width = `${width}px`));
    }

    private setupPinnedWidth(): void {
        if (this.pinned==null) { return; }

        const pinningLeft = this.pinned === Constants.PINNED_LEFT;
        const pinningRight = this.pinned === Constants.PINNED_RIGHT;

        const listener = ()=> {
            const width = pinningLeft ? this.pinnedWidthService.getPinnedLeftWidth() : this.pinnedWidthService.getPinnedRightWidth();
            if (width==null) { return; } // can happen at initialisation, width not yet set

            const hidden = width == 0;
            const isRtl = this.gridOptionsWrapper.isEnableRtl();
            const scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();

            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            const addPaddingForScrollbar = this.scrollVisibleService.isVerticalScrollShowing() && ((isRtl && pinningLeft) || (!isRtl && pinningRight));
            const widthWithPadding = addPaddingForScrollbar ? width + scrollbarWidth : width;

            setFixedWidth(this.getContainer(), widthWithPadding);

            this.addOrRemoveCssClass('ag-hidden', hidden);
        };

        this.addManagedListener(this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_SCROLLBAR_WIDTH_CHANGED, listener);
    }

    private selectTopLevelClass(): void {
        let cssClass: string;
        switch (this.pinned) {
            case Constants.PINNED_LEFT : cssClass = 'ag-pinned-left-header'; break;
            case Constants.PINNED_RIGHT : cssClass = 'ag-pinned-right-header'; break;
            default : cssClass = 'ag-header-viewport'; break;
        }
        this.addCssClass(cssClass);
    }

    private selectAndSetTemplate(): void {
        const template = this.pinned ? HeaderContainer.PINNED_TEMPLATE : HeaderContainer.CENTER_TEMPLATE;
        this.setTemplate(template);
    }

    private getContainer(): HTMLElement {
        return this.eContainer ? this.eContainer : this.getGui();
    }

    private onDomLayoutChanged(): void {
        const newValue = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        if (this.printLayout !== newValue) {
            this.printLayout = newValue;
            this.refresh();
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

    private setupDragAndDrop(): void {
        const dropContainer = this.getGui();
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
            this.getContainer().removeChild(rowComp.getGui());
        }
    }

    public refresh(keepColumns = false): void {
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

        // add in all the eGui's. if the gui is already in, don't re-add it. however we do check for order
        // so that if use adds a row of column headers, they get added in right location (before the columns)
        const eGuis = this.getRowComps().map(c => c.getGui());
        const eContainer = this.getContainer();
        let prevGui: HTMLElement;

        eGuis.forEach( eGui => {
            const notAlreadyIn = eGui.parentElement!=eContainer;
            if (notAlreadyIn) {
                eContainer.appendChild(eGui);
            }
            if (prevGui) {
                ensureDomOrder(eContainer, eGui, prevGui);
            }
            prevGui = eGui;
        });
    }
}
