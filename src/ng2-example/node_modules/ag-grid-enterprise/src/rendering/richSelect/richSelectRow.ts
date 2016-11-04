
import {Component, Utils, Autowired, CellRendererService, ICellRendererFunc, ICellRenderer} from "ag-grid/main";

export class RichSelectRow extends Component {

    @Autowired('cellRendererService') cellRendererService: CellRendererService;

    private cellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string;

    constructor(cellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string) {
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
        }
    }

    private populateWithRenderer(value:any) {
        var childComponent = this.cellRendererService.useCellRenderer(this.cellRenderer, this.getGui(), {value: value});
        if (childComponent && childComponent.destroy) {
            this.addDestroyFunc(childComponent.destroy.bind(childComponent));
        }
    }

}