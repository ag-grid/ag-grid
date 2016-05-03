
import {Component} from "../widgets/component";
import {RowNode} from "../entities/rowNode";
import {Utils as _} from '../utils';
import {Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export class CheckboxSelectionComponent extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super(`<input type="checkbox" name="name" class="ag-selection-checkbox"/>`);
    }

    public init(params: any): void {

        var rowNode = <RowNode> params.rowNode;
        var eCheckbox = <HTMLInputElement> this.getGui();

        _.setCheckboxState(eCheckbox, rowNode.isSelected());

        // we don't want the row clicked event to fire when selecting the checkbox, otherwise the row
        // would possibly get selected twice
        this.addGuiEventListener('click', event => event.stopPropagation() );

        this.addGuiEventListener('change', () => {
            var newValue = eCheckbox.checked;
            rowNode.setSelected(newValue);
        });

        var selectionChangedCallback = ()=> _.setCheckboxState(eCheckbox, rowNode.isSelected());
        rowNode.addEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);

        this.addDestroyFunc( ()=> rowNode.removeEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback));
    }
}
