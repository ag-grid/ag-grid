
import {Component, Utils, Autowired, CellRendererService, ICellRendererFunc, ICellRendererComp} from "ag-grid/main";

export class RichSelectRow extends Component {

    @Autowired('cellRendererService') cellRendererService: CellRendererService;

    private cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;

    constructor(cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string) {
        super('<div class="ag-rich-select-row"></div>');
        this.cellRenderer = cellRenderer;
    }

    public setState(value: any, selected: boolean): void {
        if (Utils.exists(this.cellRenderer)) {
            this.populateWithRenderer(value);
        } else {
            this.populateWithoutRenderer(value);
        }
        Utils.addOrRemoveCssClass(this.getGui(), 'ag-rich-select-row-selected', selected);
    }

    private populateWithoutRenderer(value: any) {
        if (Utils.exists(value) && value !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getGui().textContent = value.toString();
        } else {
            // putting in blank, so if missing, at least the user can click on it
            this.getGui().innerHTML = '&nbsp;';
        }
    }

    private populateWithRenderer(value:any) {
        var childComponent = this.cellRendererService.useCellRenderer(this.cellRenderer, this.getGui(), {value: value});
        if (childComponent && childComponent.destroy) {
            this.addDestroyFunc(childComponent.destroy.bind(childComponent));
        }
    }

}