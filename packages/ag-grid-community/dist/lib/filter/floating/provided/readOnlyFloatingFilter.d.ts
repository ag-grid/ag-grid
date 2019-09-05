// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IFloatingFilterComp, IFloatingFilterParams } from "../floatingFilter";
import { Component } from "../../../widgets/component";
export declare class ReadOnlyFloatingFilter extends Component implements IFloatingFilterComp {
    private eFloatingFilterText;
    private params;
    constructor();
    init(params: IFloatingFilterParams): void;
    onParentModelChanged(parentModel: any): void;
}
