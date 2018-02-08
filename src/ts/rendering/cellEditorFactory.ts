import {Autowired, Bean, Context, PostConstruct} from "../context/context";
import {ICellEditorComp, ICellEditorParams} from "./cellEditors/iCellEditor";
import {PopupEditorWrapper} from "./cellEditors/popupEditorWrapper";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColDef} from "../entities/colDef";
import {ComponentResolver} from "../components/framework/componentResolver";
import {_, Promise} from "../utils";

@Bean('cellEditorFactory')
export class CellEditorFactory {

    @Autowired('context') private context: Context;
    @Autowired('componentResolver') private componentResolver: ComponentResolver;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @PostConstruct
    private init(): void {
    }

    public addCellEditor(key: string, cellEditor: {new(): ICellEditorComp}): void {
        console.warn(`ag-grid: since v13.3.1 this method is not supported anymore. If you want to register your own editor check the docs: https://www.ag-grid.com/javascript-grid-cell-editor/`);
    }

    // private registerEditorsFromGridOptions(): void {
    //     let userProvidedCellEditors = this.gridOptionsWrapper.getCellEditors();
    //     _.iterateObject(userProvidedCellEditors, (key: string, cellEditor: {new(): ICellEditor})=> {
    //         this.addCellEditor(key, cellEditor);
    //     });
    // }

    public createCellEditor(column: ColDef, params: ICellEditorParams): Promise<ICellEditorComp> {

        let cellEditorPromise: Promise<ICellEditorComp> = this.componentResolver.createAgGridComponent (
            column,
            params,
            'cellEditor',
            {
                api: params.api,
                columnApi: params.columnApi,
                node: params.node,
                data: params.node.data,
                rowIndex: params.rowIndex,
                column: params.column,
                colDef: params.column.getColDef()
            },
            'agCellEditor'
        );
        return cellEditorPromise.map(cellEditor => {

            let isPopup = cellEditor.isPopup && cellEditor.isPopup();

            if (!isPopup) { return cellEditor; }

            if (this.gridOptionsWrapper.isFullRowEdit()) {
                console.warn('ag-Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                    '- either turn off fullRowEdit, or stop using popup editors.');
            }

            // if a popup, then we wrap in a popup editor and return the popup
            let popupEditorWrapper = new PopupEditorWrapper(cellEditor);
            this.context.wireBean(popupEditorWrapper);
            popupEditorWrapper.init(params);
            return popupEditorWrapper;
        });
    }

}