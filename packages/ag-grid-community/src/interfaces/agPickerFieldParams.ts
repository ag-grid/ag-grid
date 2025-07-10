import type { AgComponentSelector } from '../agStack/interfaces/iComponent';
import type { ElementParams } from '../utils/dom';
import type { AgComponentSelectorType } from '../widgets/component';
import type { AgFieldParams } from './agFieldParams';

export interface AgPickerFieldParams extends AgFieldParams {
    pickerType: string;
    pickerGap?: number;
    /**
     * If true, will set min-width and max-width (if present), and will set width to wrapper element width.
     * If false, will set min-width, max-width and width to maxPickerWidth or wrapper element width.
     */
    variableWidth?: boolean;
    minPickerWidth?: number | string;
    maxPickerWidth?: number | string;
    maxPickerHeight?: number | string;
    pickerAriaLabelKey: string;
    pickerAriaLabelValue: string;
    template?: ElementParams;
    agComponents?: AgComponentSelector<AgComponentSelectorType>[];
    className?: string;
    pickerIcon?: string;
    ariaRole?: string;
    modalPicker?: boolean;
    inputWidth?: number | 'flex';
}
