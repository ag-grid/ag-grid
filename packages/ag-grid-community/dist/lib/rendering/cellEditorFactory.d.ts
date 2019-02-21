import { ICellEditorComp, ICellEditorParams } from "../interfaces/iCellEditor";
import { ColDef } from "../entities/colDef";
import { Promise } from "../utils";
export declare class CellEditorFactory {
    private context;
    private componentResolver;
    private gridOptionsWrapper;
    private init;
    addCellEditor(key: string, cellEditor: {
        new (): ICellEditorComp;
    }): void;
    createCellEditor(column: ColDef, params: ICellEditorParams): Promise<ICellEditorComp>;
}
