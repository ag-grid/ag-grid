import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class AutoGroupColService extends BeanStub {
    static GROUP_AUTO_COLUMN_BUNDLE_ID: "ag-Grid-AutoColumn";
    private columnModel;
    private columnFactory;
    createAutoGroupColumns(existingCols: Column[], rowGroupColumns: Column[]): Column[];
    private createOneAutoGroupColumn;
    private generateDefaultColDef;
}
