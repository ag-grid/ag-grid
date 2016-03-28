import {Bean, PostConstruct} from "../../context/context";
import {Utils as _} from '../../utils';
import {ICellEditor} from "./iCellEditor";
import {TextCellEditor} from "./textCellEditor";
import {SelectCellEditor} from "./selectCellEditor";
import {PopupEditorWrapper} from "./popupEditorWrapper";
import {PopupTextCellEditor} from "./popupTextCellEditor";
import {PopupSelectCellEditor} from "./popupSelectCellEditor";

@Bean('cellEditorFactory')
export class CellEditorFactory {

    private static TEXT = 'text';
    private static SELECT = 'select';
    private static POPUP_TEXT = 'popupText';
    private static POPUP_SELECT = 'popupSelect';

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
        
        if (cellEditor.isPopup && cellEditor.isPopup()) {
            cellEditor = new PopupEditorWrapper(cellEditor);
        }
        
        return cellEditor;
    }
}