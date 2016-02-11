import {Grid} from "./grid";
import {Bean} from "./context/context";
import {GridCore} from "./gridCore";
import {Qualifier} from "./context/context";
import SelectionController from "./selectionController";
import {VirtualRowEventService} from "./rendering/virtualRowEventService";
import {RowNode} from "./entities/rowNode";

@Bean('selectionRendererFactory')
export default class SelectionRendererFactory {

    @Qualifier('virtualRowEventService') private virtualRowEventService: VirtualRowEventService;

    public createSelectionCheckbox(rowNode: RowNode, rowIndex: any) {

        var eCheckbox = document.createElement('input');
        eCheckbox.type = "checkbox";
        eCheckbox.name = "name";
        eCheckbox.className = 'ag-selection-checkbox';
        this.setCheckboxState(eCheckbox, rowNode.isSelected());

        eCheckbox.addEventListener('click', event => event.stopPropagation() );

        eCheckbox.addEventListener('change', () => {
            var newValue = eCheckbox.checked;
            if (newValue) {
                rowNode.setSelected(newValue);
            } else {
                rowNode.setSelected(newValue);
            }
        });

        var selectionChangedCallback = ()=> this.setCheckboxState(eCheckbox, rowNode.isSelected());
        rowNode.addEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);

        this.virtualRowEventService.addVirtualRowListener(VirtualRowEventService.VIRTUAL_ROW_REMOVED, rowIndex, () => {
            rowNode.removeEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);
        });

        return eCheckbox;
    }

    private setCheckboxState(eCheckbox: any, state: any) {
        if (typeof state === 'boolean') {
            eCheckbox.checked = state;
            eCheckbox.indeterminate = false;
        } else {
            // isNodeSelected returns back undefined if it's a group and the children
            // are a mix of selected and unselected
            eCheckbox.indeterminate = true;
        }
    }

}
