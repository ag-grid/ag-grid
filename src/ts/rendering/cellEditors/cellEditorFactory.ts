import {Bean, PostConstruct} from "../../context/context";
import {Utils as _} from '../../utils';
import {ICellEditor} from "./iCellEditor";
import {DefaultCellEditor} from "./defaultCellEditor";
import {SelectCellEditor} from "./selectCellEditor";

@Bean('cellEditorFactory')
export class CellEditorFactory {

    private static DEFAULT = 'default';
    private static SELECT = 'select';
    
    private cellEditorMap: {[key: string]: {new(): ICellEditor}} = {};

    @PostConstruct
    private init(): void {
        this.cellEditorMap[CellEditorFactory.DEFAULT] = DefaultCellEditor;
        this.cellEditorMap[CellEditorFactory.SELECT] = SelectCellEditor;
    }
    
    public addCellEditor(key: string, cellEditor: {new(): ICellEditor}): void {
        this.cellEditorMap[key] = cellEditor;
    }
    
    public createCellEditor(key: string|{new(): ICellEditor}): ICellEditor {

        var CellEditorClass: {new(): ICellEditor};

        if (_.missing(key)) {
            CellEditorClass = this.cellEditorMap[CellEditorFactory.DEFAULT];
        } else if (typeof key === 'string') {
            CellEditorClass = this.cellEditorMap[key];
            if (_.missing(CellEditorClass)) {
                console.warn('ag-Grid: unable to find cellEditor for key ' + key);
                CellEditorClass = this.cellEditorMap[CellEditorFactory.DEFAULT];
            }
        } else {
            CellEditorClass = <{new(): ICellEditor}> key;
        }

        var cellEditor = new CellEditorClass();
        return cellEditor;
    }
}