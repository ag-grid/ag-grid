// ag-grid-enterprise v21.2.2
import { Component, IToolPanelComp } from "ag-grid-community";
export declare class FiltersToolPanel extends Component implements IToolPanelComp {
    private static TEMPLATE;
    private eventService;
    private columnController;
    private initialised;
    constructor();
    init(): void;
    onColumnsChanged(): void;
    refresh(): void;
    setVisible(visible: boolean): void;
    private addColumnComps;
}
