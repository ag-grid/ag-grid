import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    ComponentSelector,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';

import type { AgColorPickerParams } from '../../agStack/agColorPicker';
import { AgColorPicker } from '../../agStack/agColorPicker';
import { DIALOG_CALLBACKS } from '../../widgets/dialog';

export interface ColorPickerParams extends Omit<AgColorPickerParams<AgComponentSelectorType>, 'dialogCallbacks'> {}

export class ColorPicker extends AgColorPicker<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
> {
    constructor(config?: ColorPickerParams) {
        super({
            ...config,
            dialogCallbacks: DIALOG_CALLBACKS,
        });
    }
}

export const ColorPickerSelector: ComponentSelector = {
    selector: 'AG-COLOR-PICKER',
    component: ColorPicker,
};
