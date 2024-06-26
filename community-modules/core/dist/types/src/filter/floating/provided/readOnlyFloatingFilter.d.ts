import type { BeanCollection } from '../../../context/context';
import type { IFilter } from '../../../interfaces/iFilter';
import { Component } from '../../../widgets/component';
import type { IFloatingFilterComp, IFloatingFilterParams, IFloatingFilterParent } from '../floatingFilter';
export declare class ReadOnlyFloatingFilter extends Component implements IFloatingFilterComp<IFilter & IFloatingFilterParent> {
    private columnNameService;
    wireBeans(beans: BeanCollection): void;
    private readonly eFloatingFilterText;
    private params;
    constructor();
    destroy(): void;
    init(params: IFloatingFilterParams): void;
    onParentModelChanged(parentModel: any): void;
    onParamsUpdated(params: IFloatingFilterParams): void;
    refresh(params: IFloatingFilterParams): void;
}
