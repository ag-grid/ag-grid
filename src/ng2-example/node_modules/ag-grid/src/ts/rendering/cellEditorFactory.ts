import {Bean, PostConstruct, Autowired, Context} from "../context/context";
import {Utils} from '../utils';
import {ICellEditor, ICellEditorParams} from "./cellEditors/iCellEditor";
import {TextCellEditor} from "./cellEditors/textCellEditor";
import {SelectCellEditor} from "./cellEditors/selectCellEditor";
import {PopupEditorWrapper} from "./cellEditors/popupEditorWrapper";
import {PopupTextCellEditor} from "./cellEditors/popupTextCellEditor";
import {PopupSelectCellEditor} from "./cellEditors/popupSelectCellEditor";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {LargeTextCellEditor} from "./cellEditors/largeTextCellEditor";

@Bean('cellEditorFactory')
export class CellEditorFactory {

    private static TEXT = 'text';
    private static SELECT = 'select';
    private static POPUP_TEXT = 'popupText';
    private static POPUP_SELECT = 'popupSelect';
    private static LARGE_TEXT = 'largeText';

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private cellEditorMap: {[key: string]: {new(): ICellEditor}} = {};

    @PostConstruct
    private init(): void {
        this.cellEditorMap[CellEditorFactory.TEXT] = TextCellEditor;
        this.cellEditorMap[CellEditorFactory.SELECT] = SelectCellEditor;
        this.cellEditorMap[CellEditorFactory.POPUP_TEXT] = PopupTextCellEditor;
        this.cellEditorMap[CellEditorFactory.POPUP_SELECT] = PopupSelectCellEditor;
        this.cellEditorMap[CellEditorFactory.LARGE_TEXT] = LargeTextCellEditor;
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

    public createCellEditor(key: string|{new(): ICellEditor}, params: ICellEditorParams): ICellEditor {

        var CellEditorClass: {new(): ICellEditor};

        if (Utils.missing(key)) {
            CellEditorClass = this.cellEditorMap[CellEditorFactory.TEXT];
        } else if (typeof key === 'string') {
            CellEditorClass = this.cellEditorMap[key];
            if (Utils.missing(CellEditorClass)) {
                console.warn('ag-Grid: unable to find cellEditor for key ' + key);
                CellEditorClass = this.cellEditorMap[CellEditorFactory.TEXT];
            }
        } else {
            CellEditorClass = <{new(): ICellEditor}> key;
        }

        var cellEditor = new CellEditorClass();
        this.context.wireBean(cellEditor);

        // we have to call init first, otherwise when using the frameworks, the wrapper
        // classes won't be set up
        if (cellEditor.init) {
            cellEditor.init(params);
        }

        if (cellEditor.isPopup && cellEditor.isPopup()) {

            if (this.gridOptionsWrapper.isFullRowEdit()) {
                console.warn('ag-Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                    '- either turn off fullRowEdit, or stop using popup editors.');
            }

            cellEditor = new PopupEditorWrapper(cellEditor);
            cellEditor.init(params);
        }
        
        return cellEditor;
    }
}