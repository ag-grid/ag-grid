// ag-grid-react v31.0.3
import { IFloatingFilter, IFloatingFilterParams } from "ag-grid-community";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomFloatingFilterProps, CustomFloatingFilterCallbacks } from "./interfaces";
export declare class FloatingFilterComponentWrapper extends CustomComponentWrapper<IFloatingFilterParams, CustomFloatingFilterProps, CustomFloatingFilterCallbacks> implements IFloatingFilter {
    private model;
    onParentModelChanged(parentModel: any): void;
    refresh(newParams: IFloatingFilterParams): void;
    protected getOptionalMethods(): string[];
    private updateModel;
    protected getProps(): CustomFloatingFilterProps;
}
