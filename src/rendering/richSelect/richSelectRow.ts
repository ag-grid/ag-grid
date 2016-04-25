
import {Component, Utils as _, Autowired, CellRendererService, ICellRendererFunc, ICellRenderer} from "ag-grid/main";

export class RichSelectRow extends Component {

    @Autowired('cellRendererService') cellRendererService: CellRendererService;

    private cellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string;

    constructor(cellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string) {
        super('<div class="ag-rich-select-row"></div>');
        this.cellRenderer = cellRenderer;
    }

    public setState(value: any, selected: boolean): void {
        var childComponent = this.cellRendererService.useCellRenderer(this.cellRenderer, this.getGui(), { value: value });
        if (childComponent && childComponent.destroy) {
            this.addDestroyFunc(childComponent.destroy.bind(childComponent));
        }
        _.addOrRemoveCssClass(this.getGui(), 'ag-rich-select-row-selected', selected);
    }

}