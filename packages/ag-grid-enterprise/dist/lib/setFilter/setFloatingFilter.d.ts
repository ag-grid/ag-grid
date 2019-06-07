// ag-grid-enterprise v21.0.1
import { Component, IFloatingFilter } from "ag-grid-community";
import { SetFilterModel } from "./setFilterModel";
export declare class SetFloatingFilterComp extends Component implements IFloatingFilter {
    private eFloatingFilterText;
    constructor();
    init(): void;
    onParentModelChanged(parentModel: SetFilterModel): void;
}
