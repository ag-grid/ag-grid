import {Grid} from "./grid";
import {Bean} from "./context/context";
import {GridCore} from "./gridCore";
import {Qualifier} from "./context/context";
import {SelectionController} from "./selectionController";
import {RowNode} from "./entities/rowNode";
import {RenderedRow} from "./rendering/renderedRow";
import {Utils as _} from './utils';

@Bean('selectionRendererFactory')
export class SelectionRendererFactory {

    public createSelectionCheckbox(rowNode: RowNode, addRenderedRowEventListener: Function) {

        var eCheckbox = document.createElement('input');
        eCheckbox.type = "checkbox";
        eCheckbox.name = "name";
        eCheckbox.className = 'ag-selection-checkbox';
        _.setCheckboxState(eCheckbox, rowNode.isSelected());

        eCheckbox.addEventListener('click', event => event.stopPropagation() );

        eCheckbox.addEventListener('change', () => {
            var newValue = eCheckbox.checked;
            if (newValue) {
                rowNode.setSelected(newValue);
            } else {
                rowNode.setSelected(newValue);
            }
        });

        var selectionChangedCallback = ()=> _.setCheckboxState(eCheckbox, rowNode.isSelected());
        rowNode.addEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);

        addRenderedRowEventListener(RenderedRow.EVENT_RENDERED_ROW_REMOVED, () => {
            rowNode.removeEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);
        });

        return eCheckbox;
    }



}
