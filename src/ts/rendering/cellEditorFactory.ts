import {Bean, PostConstruct, Autowired, Context} from "../context/context";
import {Utils as _} from '../utils';
import {ICellEditor} from "./cellEditors/iCellEditor";
import {TextCellEditor} from "./cellEditors/textCellEditor";
import {SelectCellEditor} from "./cellEditors/selectCellEditor";
import {PopupEditorWrapper} from "./cellEditors/popupEditorWrapper";
import {PopupTextCellEditor} from "./cellEditors/popupTextCellEditor";
import {PopupSelectCellEditor} from "./cellEditors/popupSelectCellEditor";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

@Bean('cellEditorFactory')
export class CellEditorFactory {

    private static TEXT = 'text';
    private static SELECT = 'select';
    private static POPUP_TEXT = 'popupText';
    private static POPUP_SELECT = 'popupSelect';

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private cellEditorMap: {[key: string]: {new(): ICellEditor}} = {};

    @PostConstruct
    private init(): void {
        this.cellEditorMap[CellEditorFactory.TEXT] = TextCellEditor;
        this.cellEditorMap[CellEditorFactory.SELECT] = SelectCellEditor;
        this.cellEditorMap[CellEditorFactory.POPUP_TEXT] = PopupTextCellEditor;
        this.cellEditorMap[CellEditorFactory.POPUP_SELECT] = PopupSelectCellEditor;
    }
    
    public addCellEditor(key: string, cellEditor: {new(): ICellEditor}): void {
        this.cellEditorMap[key] = cellEditor;
    }

    // private registerEditorsFromGridOptions(): void {
    //     var userProvidedCellEditors = this.gridOptionsWrapper.getCellEditors();
    //     _.iterateObject(userProvidedCellEditors, (key: string, cellEditor: {new(): ICellEditor})=> {
    //         this.addCellEditor(key, cellEditor);
    //     });
    // }

    public createCellEditor(key: string|{new(): ICellEditor}): ICellEditor {

        var CellEditorClass: {new(): ICellEditor};

        if (_.missing(key)) {
            CellEditorClass = this.cellEditorMap[CellEditorFactory.TEXT];
        } else if (typeof key === 'string') {
            CellEditorClass = this.cellEditorMap[key];
            if (_.missing(CellEditorClass)) {
                console.warn('ag-Grid: unable to find cellEditor for key ' + key);
                CellEditorClass = this.cellEditorMap[CellEditorFactory.TEXT];
            }
        } else {
            CellEditorClass = <{new(): ICellEditor}> key;
        }

        var cellEditor = new CellEditorClass();
        this.context.wireBean(cellEditor);
        
        if (cellEditor.isPopup && cellEditor.isPopup()) {
            cellEditor = new PopupEditorWrapper(cellEditor);
        }
        
        return cellEditor;
    }
}