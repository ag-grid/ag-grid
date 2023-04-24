import { IFloatingFilterComp, IFloatingFilterParams, IFloatingFilterParent } from '../floatingFilter';
import { Component } from '../../../widgets/component';
import { IFilter } from '../../../interfaces/iFilter';
export declare class ReadOnlyFloatingFilter extends Component implements IFloatingFilterComp<IFilter & IFloatingFilterParent> {
    private eFloatingFilterText;
    private columnModel;
    private params;
    constructor();
    destroy(): void;
    init(params: IFloatingFilterParams): void;
    onParentModelChanged(parentModel: any): void;
}
