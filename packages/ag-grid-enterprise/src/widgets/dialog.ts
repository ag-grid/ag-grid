import type {
    AgEventTypeParams,
    AgGridCommon,
    FocusableContainer,
    GridOptionsService,
    GridOptionsWithDefaults,
    _AgComponentSelectorType,
    _BeanCollection,
} from 'ag-grid-community';
import { _STOP_PROPAGATION_CALLBACKS, _focusNextGridCoreContainer } from 'ag-grid-community';

import type { AgDialogCallbacks, AgDialogOptions } from '../agStack/agDialog';
import { AgDialog } from '../agStack/agDialog';
import type { PanelPostProcessPopupParams } from './panel';

interface DialogOptions
    extends AgDialogOptions<_BeanCollection, GridOptionsWithDefaults, AgEventTypeParams, PanelPostProcessPopupParams> {}

export const DIALOG_CALLBACKS: AgDialogCallbacks<_BeanCollection, Dialog> = {
    stopPropagationCallbacks: _STOP_PROPAGATION_CALLBACKS,
    focusNextContainer: (beans: _BeanCollection, backwards: boolean) => {
        return _focusNextGridCoreContainer(beans, backwards);
    },

    configureFocusableContainer: (beans: _BeanCollection, dialog: Dialog) => {
        const gridCtrl = beans.ctrlsSvc.get('gridCtrl');
        gridCtrl.addFocusableContainer(dialog);
        dialog.addDestroyFunc(() => gridCtrl.removeFocusableContainer(dialog));
    },
};

export class Dialog
    extends AgDialog<
        _BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        _AgComponentSelectorType,
        DialogOptions
    >
    implements FocusableContainer
{
    constructor(config: DialogOptions) {
        super(config, DIALOG_CALLBACKS);
    }
}
