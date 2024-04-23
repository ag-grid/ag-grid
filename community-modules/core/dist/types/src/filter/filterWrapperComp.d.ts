import { Column } from "../entities/column";
import { IFilterComp } from "../interfaces/iFilter";
import { AgPromise } from "../utils/promise";
import { Component } from "../widgets/component";
import { FilterRequestSource } from "./filterManager";
import { IAfterGuiAttachedParams } from "../interfaces/iAfterGuiAttachedParams";
export declare class FilterWrapperComp extends Component {
    private readonly column;
    private readonly source;
    private readonly filterManager;
    private readonly columnModel;
    private filterWrapper;
    constructor(column: Column, source: FilterRequestSource);
    private postConstruct;
    hasFilter(): boolean;
    getFilter(): AgPromise<IFilterComp> | null;
    afterInit(): AgPromise<void>;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    afterGuiDetached(): void;
    private createFilter;
    private onFilterDestroyed;
    protected destroy(): void;
}
