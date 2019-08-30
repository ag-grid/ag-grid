import {
    Events,
    GridOptionsWrapper,
    Constants,
    ColumnController,
    Component,
    EventService,
    Autowired,
    PostConstruct,
    Context
} from "ag-grid-community/main";
import { RowGroupDropZonePanel } from "./panels/rowGroupDropZonePanel";
import { PivotDropZonePanel } from "./panels/pivotDropZonePanel";

export class GridHeaderDropZones extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    private rowGroupComp: Component;
    private pivotComp: Component;

    constructor() {
        super();
    }

    @PostConstruct
    private postConstruct(): void {
        this.setGui(this.createNorthPanel());

        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));

        this.onRowGroupChanged();
    }

    private createNorthPanel(): HTMLElement {

        const topPanelGui = document.createElement('div');

        const dropPanelVisibleListener = this.onDropPanelVisible.bind(this);

        this.rowGroupComp = new RowGroupDropZonePanel(true);
        this.getContext().wireBean(this.rowGroupComp);
        this.addDestroyFunc(() => this.rowGroupComp.destroy());

        this.pivotComp = new PivotDropZonePanel(true);
        this.getContext().wireBean(this.pivotComp);
        this.addDestroyFunc(() => this.pivotComp.destroy());

        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());

        this.rowGroupComp.addEventListener(Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
        this.pivotComp.addEventListener(Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);

        this.addDestroyFunc(() => {
            this.rowGroupComp.removeEventListener(Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
            this.pivotComp.removeEventListener(Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
        });

        this.onDropPanelVisible();

        return topPanelGui;
    }

    private onDropPanelVisible(): void {
        const bothDisplayed = this.rowGroupComp.isDisplayed() && this.pivotComp.isDisplayed();
        this.rowGroupComp.addOrRemoveCssClass('ag-width-half', bothDisplayed);
        this.pivotComp.addOrRemoveCssClass('ag-width-half', bothDisplayed);
    }

    private onRowGroupChanged(): void {
        if (!this.rowGroupComp) {
            return;
        }

        const rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();

        if (rowGroupPanelShow === Constants.ALWAYS) {
            this.rowGroupComp.setDisplayed(true);
        } else if (rowGroupPanelShow === Constants.ONLY_WHEN_GROUPING) {
            const grouping = !this.columnController.isRowGroupEmpty();
            this.rowGroupComp.setDisplayed(grouping);
        } else {
            this.rowGroupComp.setDisplayed(false);
        }
    }

}
