
import {_, Component, Utils, Autowired, CellRendererService, ICellRendererFunc, ICellRendererComp, ColDef, Promise} from "ag-grid/main";

export class RichSelectRow extends Component {

    @Autowired('cellRendererService') cellRendererService: CellRendererService;

    private columnDef: ColDef;

    constructor(columnDef: ColDef) {
        super('<div class="ag-rich-select-row"></div>');
        this.columnDef = columnDef;
    }

    public setState(value: any, valueFormatted: string, selected: boolean): void {
        let rendererSuccessful = this.populateWithRenderer(value, valueFormatted);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, valueFormatted);
        }
        Utils.addOrRemoveCssClass(this.getGui(), 'ag-rich-select-row-selected', selected);
    }

    private populateWithoutRenderer(value: any, valueFormatted: string) {
        let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        let valueToRender = valueFormattedExits ? valueFormatted : value;

        if (Utils.exists(valueToRender) && valueToRender !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getGui().textContent = valueToRender.toString();
        } else {
            // putting in blank, so if missing, at least the user can click on it
            this.getGui().innerHTML = '&nbsp;';
        }
    }

    private populateWithRenderer(value: any, valueFormatted: string): boolean {
        let promise:Promise<ICellRendererComp> = this.cellRendererService.useRichSelectCellRenderer(this.columnDef, this.getGui(), {value: value, valueFormatted: valueFormatted});

        let foundRenderer = _.exists(promise);
        if (foundRenderer) {
            promise.then(childComponent => {
                if (childComponent && childComponent.destroy) {
                    this.addDestroyFunc(childComponent.destroy.bind(childComponent));
                }
            });
            return true;
        } else {
            return false;
        }
    }

}