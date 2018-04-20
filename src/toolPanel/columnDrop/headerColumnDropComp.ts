import {Events, GridOptionsWrapper, Constants, ColumnController, ICompFactory, Component, EventService, Autowired, Optional, PostConstruct} from "ag-grid";

export class HeaderColumnDropComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Optional('rowGroupCompFactory') private rowGroupCompFactory: ICompFactory;
    @Optional('pivotCompFactory') private pivotCompFactory: ICompFactory;

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

        let topPanelGui = document.createElement('div');

        let dropPanelVisibleListener = this.onDropPanelVisible.bind(this);

        this.rowGroupComp = this.rowGroupCompFactory.create();
        this.pivotComp = this.pivotCompFactory.create();

        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());

        this.rowGroupComp.addEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        this.pivotComp.addEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);

        this.addDestroyFunc(() => {
            this.rowGroupComp.removeEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
            this.pivotComp.removeEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        });

        this.onDropPanelVisible();

        return topPanelGui;
    }

    private onDropPanelVisible(): void {
        let bothVisible = this.rowGroupComp.isVisible() && this.pivotComp.isVisible();
        this.rowGroupComp.addOrRemoveCssClass('ag-width-half', bothVisible);
        this.pivotComp.addOrRemoveCssClass('ag-width-half', bothVisible);
    }

    private onRowGroupChanged(): void {
        if (!this.rowGroupComp) {
            return;
        }

        let rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();

        if (rowGroupPanelShow === Constants.ALWAYS) {
            this.rowGroupComp.setVisible(true);
        } else if (rowGroupPanelShow === Constants.ONLY_WHEN_GROUPING) {
            let grouping = !this.columnController.isRowGroupEmpty();
            this.rowGroupComp.setVisible(grouping);
        } else {
            this.rowGroupComp.setVisible(false);
        }
    }

}
