import type { BeanCollection, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class ChartCrossFilterService extends BeanStub implements NamedBean {
    beanName: "chartCrossFilterService";
    private columnModel;
    private valueService;
    private filterManager?;
    private clientSideRowModel?;
    wireBeans(beans: BeanCollection): void;
    filter(event: any, reset?: boolean): void;
    private resetFilters;
    private updateFilters;
    private getUpdatedFilterModel;
    private getCurrentGridValuesForCategory;
    private static extractFilterColId;
    private isValidColumnFilter;
    private getColumnFilterType;
    private getColumnById;
}
