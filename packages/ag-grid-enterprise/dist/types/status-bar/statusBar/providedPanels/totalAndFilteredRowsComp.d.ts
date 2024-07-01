import type { BeanCollection, IStatusPanelComp } from 'ag-grid-community';
import { AgNameValue } from './agNameValue';
export declare class TotalAndFilteredRowsComp extends AgNameValue implements IStatusPanelComp {
    private rowModel;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    private onDataChanged;
    private getFilteredRowCountValue;
    private getTotalRowCount;
    init(): void;
    refresh(): boolean;
    destroy(): void;
}
