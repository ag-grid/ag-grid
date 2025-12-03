import type {
    AgEventTypeParams,
    AgGridCommon,
    GridOptionsService,
    GridOptionsWithDefaults,
    _AgComponentSelectorType,
    _BeanCollection,
    _ComponentSelector,
} from 'ag-grid-community';

import type { AgColorPickerParams } from '../../agStack/agColorPicker';
import { AgColorPicker } from '../../agStack/agColorPicker';
import { DIALOG_CALLBACKS } from '../../widgets/dialog';

export interface ColorPickerParams extends Omit<AgColorPickerParams<_AgComponentSelectorType>, 'dialogCallbacks'> {}

export class ColorPicker extends AgColorPicker<
    _BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    _AgComponentSelectorType
> {
    constructor(config?: ColorPickerParams) {
        super({
            ...config,
            dialogCallbacks: DIALOG_CALLBACKS,
        });
    }
}

export const ColorPickerSelector: _ComponentSelector = {
    selector: 'AG-COLOR-PICKER',
    component: ColorPicker,
};
