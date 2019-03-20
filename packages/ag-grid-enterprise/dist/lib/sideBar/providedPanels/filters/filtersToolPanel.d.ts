// ag-grid-enterprise v20.2.0
import { Component, IToolPanelComp } from "ag-grid-community";
export declare class FiltersToolPanel extends Component implements IToolPanelComp {
    private static TEMPLATE;
    private columnApi;
    private gridOptionsWrapper;
    private gridApi;
    private eventService;
    private columnController;
    private rowModel;
    private userComponentFactory;
    private valueService;
    private $scope;
    private initialised;
    constructor();
    init(): void;
    onColumnsChanged(): void;
    refresh(): void;
    setVisible(visible: boolean): void;
    private addColumnComps;
}
