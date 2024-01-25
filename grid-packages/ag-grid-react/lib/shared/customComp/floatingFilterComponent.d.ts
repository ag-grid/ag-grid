// ag-grid-react v31.0.3
import { IFloatingFilter, IFloatingFilterParams } from "ag-grid-community";
import { CustomFloatingFilterProps, CustomFloatingFilterCallbacks } from "./interfaces";
export declare class FloatingFilterComponent implements IFloatingFilter {
    private floatingFilterParams;
    private readonly refreshProps;
    private model;
    constructor(floatingFilterParams: IFloatingFilterParams, refreshProps: () => void);
    getProps(): CustomFloatingFilterProps;
    onParentModelChanged(parentModel: any): void;
    refresh(params: IFloatingFilterParams): void;
    setMethods(methods: CustomFloatingFilterCallbacks): void;
    private getOptionalMethods;
    private updateModel;
}
