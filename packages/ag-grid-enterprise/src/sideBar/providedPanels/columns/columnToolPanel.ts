import {
    _,
    Autowired,
    ColDef,
    ColGroupDef,
    Component,
    EventService,
    GridApi,
    GridOptionsWrapper,
    IToolPanelComp,
    IToolPanelParams,
    ModuleNames
} from "ag-grid-community";
import {PivotModePanel} from "./panels/pivotModePanel";
import {RowGroupDropZonePanel} from "./panels/rowGroupDropZonePanel";
import {ValuesDropZonePanel} from "./panels/valueDropZonePanel";
import {PivotDropZonePanel} from "./panels/pivotDropZonePanel";
import {PrimaryColsPanel} from "./panels/primaryColsPanel/primaryColsPanel";

export interface ToolPanelColumnCompParams extends IToolPanelParams {
    suppressRowGroups: boolean;
    suppressValues: boolean;
    suppressPivots: boolean;
    suppressPivotMode: boolean;
    suppressSideButtons: boolean;
    suppressColumnFilter: boolean;
    suppressColumnSelectAll: boolean;
    suppressColumnExpandAll: boolean;
    contractColumnSelection: boolean;
    syncLayoutWithGrid: boolean;
}

export interface IColumnToolPanel {
    expandColumnGroups(groupIds?: string[]): void;
    collapseColumnGroups(groupIds?: string[]): void;
    setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    syncLayoutWithGrid(): void;
}

export class ColumnToolPanel extends Component implements IColumnToolPanel, IToolPanelComp {

    private static TEMPLATE = `<div class="ag-column-panel"></div>`;

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;

    private initialised = false;
    private params: ToolPanelColumnCompParams;

    private childDestroyFuncs: Function[] = [];
    private primaryColsPanel: PrimaryColsPanel;

    constructor() {
        super(ColumnToolPanel.TEMPLATE);
    }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }

    public init(params: ToolPanelColumnCompParams): void {
        const defaultParams: ToolPanelColumnCompParams = {
            suppressSideButtons: false,
            suppressColumnSelectAll: false,
            suppressColumnFilter: false,
            suppressColumnExpandAll: false,
            contractColumnSelection: false,
            suppressPivotMode: false,
            suppressRowGroups: false,
            suppressValues: false,
            suppressPivots: false,
            syncLayoutWithGrid: true,
            api: this.gridApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        const aggregationModuleLoaded = this.getContext().isModuleRegistered(ModuleNames.RowGroupingModule);

        if (aggregationModuleLoaded && !this.params.suppressPivotMode) {
            this.addComponent(new PivotModePanel());
        }

        this.primaryColsPanel = new PrimaryColsPanel(true, this.params);
        this.addComponent(this.primaryColsPanel);

        if (aggregationModuleLoaded) {
            if (!this.params.suppressRowGroups) {
                this.addComponent(new RowGroupDropZonePanel(false));
            }

            if (!this.params.suppressValues) {
                this.addComponent(new ValuesDropZonePanel(false));
            }

            if (!this.params.suppressPivots) {
                this.addComponent(new PivotDropZonePanel(false));
            }
        }

        this.initialised = true;
    }

    public expandColumnGroups(groupIds?: string[]): void {
        this.primaryColsPanel.expandGroups(groupIds);
    }

    public collapseColumnGroups(groupIds?: string[]): void {
        this.primaryColsPanel.collapseGroups(groupIds);
    }

    public setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void {
        this.primaryColsPanel.setColumnLayout(colDefs);
    }

    public syncLayoutWithGrid(): void {
        this.primaryColsPanel.syncLayoutWithGrid();
    }

    private addComponent(component: Component): void {
        this.getContext().wireBean(component);
        this.getGui().appendChild(component.getGui());
        this.childDestroyFuncs.push(component.destroy.bind(component));
    }

    public destroyChildren(): void {
        this.childDestroyFuncs.forEach(func => func());
        this.childDestroyFuncs.length = 0;
        _.clearElement(this.getGui());
    }

    public refresh(): void {
        this.destroyChildren();
        this.init(this.params);
    }

    public destroy(): void {
        this.destroyChildren();
        super.destroy();
    }
}
