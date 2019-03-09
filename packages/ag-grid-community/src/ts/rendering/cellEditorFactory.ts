import { Autowired, Bean, Context, PostConstruct } from "../context/context";
import { ICellEditorComp, ICellEditorParams } from "../interfaces/iCellEditor";
import { PopupEditorWrapper } from "./cellEditors/popupEditorWrapper";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColDef } from "../entities/colDef";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { _, Promise } from "../utils";

@Bean('cellEditorFactory')
export class CellEditorFactory {

    @Autowired('context') private context: Context;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
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

        const cellEditorPromise: Promise<ICellEditorComp> = this.userComponentFactory.createUserComponent (
            column,
            params,
            'cellEditor',
            'agCellEditor'
        );
        return cellEditorPromise.map(cellEditor => {

            const isPopup = cellEditor.isPopup && cellEditor.isPopup();

            if (!isPopup) { return cellEditor; }

            if (this.gridOptionsWrapper.isFullRowEdit()) {
                console.warn('ag-Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                    '- either turn off fullRowEdit, or stop using popup editors.');
            }

            // if a popup, then we wrap in a popup editor and return the popup
            const popupEditorWrapper = new PopupEditorWrapper(cellEditor);
            this.context.wireBean(popupEditorWrapper);
            popupEditorWrapper.init(params);
            return popupEditorWrapper;
        });
    }

}