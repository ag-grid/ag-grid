// ag-grid-react v31.0.3
import { IDoesFilterPassParams, IFilter, IFilterParams } from "ag-grid-community";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomFilterProps, CustomFilterCallbacks } from "./interfaces";
export declare class FilterComponentWrapper extends CustomComponentWrapper<IFilterParams, CustomFilterProps, CustomFilterCallbacks> implements IFilter {
    private model;
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams<any>): boolean;
    getModel(): any;
    setModel(model: any): void;
    refresh(newParams: IFilterParams): boolean;
    protected getOptionalMethods(): string[];
    private updateModel;
    protected getProps(): CustomFilterProps;
}
