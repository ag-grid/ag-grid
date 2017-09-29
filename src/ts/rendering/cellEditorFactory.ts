import {Autowired, Bean, Context, PostConstruct} from "../context/context";
import {ICellEditorComp, ICellEditorParams} from "./cellEditors/iCellEditor";
import {PopupEditorWrapper} from "./cellEditors/popupEditorWrapper";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColDef} from "../entities/colDef";
import {ComponentResolver} from "../components/framework/componentResolver";

@Bean('cellEditorFactory')
export class CellEditorFactory {

    @Autowired('context') private context: Context;
    @Autowired('componentResolver') private componentResolver: ComponentResolver;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;


    @PostConstruct
    private init(): void {
    }
    
    public addCellEditor(key: string, cellEditor: {new(): ICellEditorComp}): void {
        console.warn(`Ignoring this bwahahahahahaha!`)
    }

    // private registerEditorsFromGridOptions(): void {
    //     let userProvidedCellEditors = this.gridOptionsWrapper.getCellEditors();
    //     _.iterateObject(userProvidedCellEditors, (key: string, cellEditor: {new(): ICellEditor})=> {
    //         this.addCellEditor(key, cellEditor);
    //     });
    // }

    public createCellEditor(column:ColDef, params: ICellEditorParams): ICellEditorComp {
        let cellEditor:ICellEditorComp = this.componentResolver.createAgGridComponent (
            column,
            params,
            'cellEditor'
        );
        if (cellEditor.isPopup && cellEditor.isPopup()) {

            if (this.gridOptionsWrapper.isFullRowEdit()) {
                console.warn('ag-Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                    '- either turn off fullRowEdit, or stop using popup editors.');
            }

            cellEditor = new PopupEditorWrapper(cellEditor);
            this.context.wireBean(cellEditor);
            cellEditor.init(params);
        }

        return cellEditor;
    }
}