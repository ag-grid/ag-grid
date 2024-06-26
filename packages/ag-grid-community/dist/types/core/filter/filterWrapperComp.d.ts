import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import type { IFilterComp } from '../interfaces/iFilter';
import { AgPromise } from '../utils/promise';
import { Component } from '../widgets/component';
import type { FilterRequestSource } from './iColumnFilter';
export declare class FilterWrapperComp extends Component {
    private readonly column;
    private readonly source;
    private filterManager?;
    private columnModel;
    wireBeans(beans: BeanCollection): void;
    private filterWrapper;
    constructor(column: AgColumn, source: FilterRequestSource);
    postConstruct(): void;
    hasFilter(): boolean;
    getFilter(): AgPromise<IFilterComp> | null;
    afterInit(): AgPromise<void>;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    afterGuiDetached(): void;
    private createFilter;
    private onFilterDestroyed;
    destroy(): void;
}
