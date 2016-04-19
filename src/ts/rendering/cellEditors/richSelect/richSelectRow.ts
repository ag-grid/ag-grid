
import {Component} from "../../../widgets/component";
import {Utils as _} from '../../../utils';
import {Autowired} from "../../../context/context";
import {CellRendererService} from "../../cellRendererService";
import {ICellRendererFunc, ICellRenderer} from "../../cellRenderers/iCellRenderer";

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