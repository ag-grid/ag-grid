import { IFloatingFilterComp, IFloatingFilterParams } from '../floatingFilter';
import { Component } from '../../../widgets/component';
export declare class ReadOnlyFloatingFilter extends Component implements IFloatingFilterComp {
    private eFloatingFilterText;
    private columnModel;
    private params;
    constructor();
    destroy(): void;
    init(params: IFloatingFilterParams): void;
    onParentModelChanged(parentModel: any): void;
}
