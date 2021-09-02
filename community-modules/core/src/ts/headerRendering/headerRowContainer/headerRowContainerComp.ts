import { ColumnModel } from '../../columns/columnModel';
import { Constants } from '../../constants/constants';
import { Autowired, PostConstruct, PreDestroy } from '../../context/context';
import { Column } from '../../entities/column';
import { Events } from '../../events';
import { PinnedWidthService } from '../../gridBodyComp/pinnedWidthService';
import { ScrollVisibleService } from '../../gridBodyComp/scrollVisibleService';
import { NumberSequence } from "../../utils";
import { ensureDomOrder, setFixedWidth } from '../../utils/dom';
import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { BodyDropTarget } from '../bodyDropTarget';
import { HeaderWrapperComp } from '../columnHeader/headerWrapperComp';
import { HeaderRowComp, HeaderRowType } from '../headerRow/headerRowComp';
import { HeaderRowContainerCtrl, IHeaderRowContainerComp } from './headerRowContainerCtrl';

export class HeaderRowContainer extends Component {

    private static PINNED_LEFT_TEMPLATE =  /* html */ `<div class="ag-pinned-left-header" role="presentation"/>`;

    private static PINNED_RIGHT_TEMPLATE =  /* html */ `<div class="ag-pinned-right-header" role="presentation"/>`;

    private static CENTER_TEMPLATE =  /* html */ 
        `<div class="ag-header-viewport" role="presentation">
            <div class="ag-header-container" ref="eContainer" role="rowgroup"></div>
        </div>`;

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('pinnedWidthService') private pinnedWidthService: PinnedWidthService;

    @RefSelector('eContainer') private eContainer: HTMLElement;

    private pinned: string | null;

    private filtersRowComp: HeaderRowComp | undefined;
    private columnsRowComp: HeaderRowComp | undefined;
    private groupsRowComps: HeaderRowComp[] = [];

    constructor(pinned: string | null) {
        super();
        this.pinned = pinned;
    }

    public getHeaderWrapperComp(column: Column): HeaderWrapperComp | undefined {
        if (this.columnsRowComp) {
            return this.columnsRowComp.getHeaderWrapperComp(column);
        }
    }

    @PostConstruct
    private init(): void {
        this.selectAndSetTemplate();

        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.setupDragAndDrop();

        if (this.columnModel.isReady()) {
            this.refresh();
        }

        const compProxy: IHeaderRowContainerComp = {
            setCenterWidth: width => this.eContainer.style.width = width,
            setContainerTransform: transform => this.eContainer.style.transform = transform,
            setContainerWidth: width => {
                const container = this.getContainer();
                container.style.width = width;
                container.style.maxWidth = width;
                container.style.minWidth = width;
            },
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),


            // temp pass through
            getRowComps: ()=> this.getRowComps(),
            refresh: ()=> this.refresh(),
            getHeaderWrapperComp: column => this.getHeaderWrapperComp(column)
        };

        const ctrl = this.createManagedBean(new HeaderRowContainerCtrl(this.pinned));
        ctrl.setComp(compProxy);
    }

    private selectAndSetTemplate(): void {
        const pinnedLeft = this.pinned == Constants.PINNED_LEFT;
        const pinnedRight = this.pinned == Constants.PINNED_RIGHT;

        const template = pinnedLeft ? HeaderRowContainer.PINNED_LEFT_TEMPLATE : 
                         pinnedRight ? HeaderRowContainer.PINNED_RIGHT_TEMPLATE : HeaderRowContainer.CENTER_TEMPLATE;

        this.setTemplate(template);
    }

    private getContainer(): HTMLElement {
        return this.eContainer ? this.eContainer : this.getGui();
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
