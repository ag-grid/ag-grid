import { BeanStub } from '@ag-grid-community/core';
import type { AgColumn, BeanCollection, IShowRowGroupColsService, NamedBean } from '@ag-grid-community/core';
export declare class ShowRowGroupColsService extends BeanStub implements NamedBean, IShowRowGroupColsService {
    beanName: "showRowGroupColsService";
    private columnModel;
    private funcColsService;
    wireBeans(beans: BeanCollection): void;
    private showRowGroupCols;
    private showRowGroupColsMap;
    refresh(): void;
    getShowRowGroupCols(): AgColumn[];
    getShowRowGroupCol(id: string): AgColumn | undefined;
}
