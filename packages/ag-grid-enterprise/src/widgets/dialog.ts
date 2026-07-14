import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    FocusableContainer,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';
import { _STOP_PROPAGATION_CALLBACKS } from 'ag-grid-community';

import type { AgDialogCallbacks, AgDialogOptions } from '../agStack/agDialog';
import { AgDialog } from '../agStack/agDialog';
import type { PanelPostProcessPopupParams } from './panel';

interface DialogOptions extends AgDialogOptions<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    PanelPostProcessPopupParams
> {}

export const DIALOG_CALLBACKS: AgDialogCallbacks<BeanCollection, Dialog> = {
    stopPropagationCallbacks: _STOP_PROPAGATION_CALLBACKS,
    configureFocusableContainer: (beans: BeanCollection, dialog: Dialog) => {
        const gridCtrl = beans.ctrlsSvc.get('gridCtrl');
        gridCtrl.addFocusableContainer(dialog);
        dialog.addDestroyFunc(() => gridCtrl.removeFocusableContainer(dialog));
    },
};

export class Dialog
    extends AgDialog<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        AgComponentSelectorType,
        DialogOptions
    >
    implements FocusableContainer
{
    constructor(config: DialogOptions) {
        super(config, DIALOG_CALLBACKS);
    }

    public getFocusableContainerName(): 'dialog' {
        return 'dialog';
    }
}
