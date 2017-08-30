
import {Component, Utils, Autowired, CellRendererService, ICellRendererFunc, ICellRendererComp, ColDef} from "ag-grid/main";

export class RichSelectRow extends Component {

    @Autowired('cellRendererService') cellRendererService: CellRendererService;

    private columnDef: ColDef;

    constructor(columnDef: ColDef) {
        super('<div class="ag-rich-select-row"></div>');
        this.columnDef = columnDef;
    }

    public setState(value: any, valueFormatted: string, selected: boolean): void {
        if (!this.populateWithRenderer(value, valueFormatted)) {
            this.populateWithoutRenderer(value, valueFormatted);
        }
        Utils.addOrRemoveCssClass(this.getHtmlElement(), 'ag-rich-select-row-selected', selected);
    }

    private populateWithoutRenderer(value: any, valueFormatted: string) {
        let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        let valueToRender = valueFormattedExits ? valueFormatted : value;

        if (Utils.exists(valueToRender) && valueToRender !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getHtmlElement().textContent = valueToRender.toString();
        } else {
            // putting in blank, so if missing, at least the user can click on it
            this.getHtmlElement().innerHTML = '&nbsp;';
        }
    }

    private populateWithRenderer(value: any, valueFormatted: string): ICellRendererComp {
        let childComponent = this.cellRendererService.useCellRenderer(this.columnDef, this.getHtmlElement(), {value: value, valueFormatted: valueFormatted});
        if (childComponent && childComponent.destroy) {
            this.addDestroyFunc(childComponent.destroy.bind(childComponent));
        }
        return childComponent;
    }

}