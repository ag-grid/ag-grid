import { AgColumn, BeanStub } from 'ag-grid-community';
import type { BeanCollection, ColumnEventType, IAutoColService, NamedBean } from 'ag-grid-community';
export declare class AutoColService extends BeanStub implements NamedBean, IAutoColService {
    beanName: "autoColService";
    private columnModel;
    private columnNameService;
    private columnFactory;
    wireBeans(beans: BeanCollection): void;
    createAutoCols(rowGroupCols: AgColumn[]): AgColumn[];
    updateAutoCols(autoGroupCols: AgColumn[], source: ColumnEventType): void;
    private createOneAutoCol;
    /**
     * Refreshes an auto group col to load changes from defaultColDef or autoGroupColDef
     */
    private updateOneAutoCol;
    private createAutoColDef;
    private createBaseColDef;
}
