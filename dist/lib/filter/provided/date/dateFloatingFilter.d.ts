// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { DateFilterModel } from "./dateFilter";
import { IFloatingFilterParams } from "../../floating/floatingFilter";
import { ISimpleFilterModel } from "../simpleFilter";
import { SimpleFloatingFilter } from "../../floating/provided/simpleFloatingFilter";
import { FilterChangedEvent } from "../../../events";
export declare class DateFloatingFilter extends SimpleFloatingFilter {
    private userComponentFactory;
    private eReadOnlyText;
    private eDateWrapper;
    private dateComp;
    private params;
    constructor();
    protected getDefaultFilterOptions(): string[];
    protected conditionToString(condition: DateFilterModel): string;
    init(params: IFloatingFilterParams): void;
    protected setEditable(editable: boolean): void;
    onParentModelChanged(model: ISimpleFilterModel, event: FilterChangedEvent): void;
    private onDateChanged;
    private createDateComponent;
}
