import { Column } from "../entities/column";
export declare class AutoGroupColService {
    static GROUP_AUTO_COLUMN_BUNDLE_ID: string;
    private gridOptionsWrapper;
    private context;
    private columnController;
    private columnFactory;
    createAutoGroupColumns(rowGroupColumns: Column[]): Column[];
    private createOneAutoGroupColumn;
    private generateDefaultColDef;
}
