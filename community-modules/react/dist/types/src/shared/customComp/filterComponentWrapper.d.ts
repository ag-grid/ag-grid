import type { AgPromise, IDoesFilterPassParams, IFilter, IFilterParams } from '@ag-grid-community/core';
import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomFilterCallbacks, CustomFilterProps } from './interfaces';
export declare class FilterComponentWrapper extends CustomComponentWrapper<IFilterParams, CustomFilterProps, CustomFilterCallbacks> implements IFilter {
    private model;
    private readonly onModelChange;
    private readonly onUiChange;
    private expectingNewMethods;
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams<any>): boolean;
    getModel(): any;
    setModel(model: any): AgPromise<void>;
    refresh(newParams: IFilterParams): boolean;
    protected getOptionalMethods(): string[];
    protected setMethods(methods: CustomFilterCallbacks): void;
    private updateModel;
    protected getProps(): CustomFilterProps;
}
