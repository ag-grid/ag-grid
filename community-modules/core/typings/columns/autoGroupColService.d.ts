import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare const GROUP_AUTO_COLUMN_ID: 'ag-Grid-AutoColumn';
export declare class AutoGroupColService extends BeanStub {
    private columnModel;
    private columnFactory;
    createAutoGroupColumns(existingCols: Column[], rowGroupColumns: Column[]): Column[];
    private createOneAutoGroupColumn;
    private generateDefaultColDef;
}
