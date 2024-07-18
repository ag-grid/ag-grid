import type { ComponentSelector } from '../widgets/component';

export type LabelAlignment = 'left' | 'right' | 'top';

export interface AgLabelParams {
    label?: HTMLElement | string;
    labelWidth?: number | 'flex';
    labelSeparator?: string;
    labelAlignment?: LabelAlignment;
    disabled?: boolean;
    labelEllipsis?: boolean;
}

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
    template?: string;
    agComponents?: ComponentSelector[];
    className?: string;
    pickerIcon?: string;
    ariaRole?: string;
    modalPicker?: boolean;
    inputWidth?: number | 'flex';
}

export interface AgFieldParams extends AgLabelParams {
    value?: any;
    width?: number;
    onValueChange?: (value?: any) => void;
    ariaLabel?: string | null;
}

export interface AgInputFieldParams extends AgFieldParams {
    inputName?: string;
    inputWidth?: number | 'flex';
    template?: string;
    inputPlaceholder?: string;
    autoComplete?: boolean;
    tabIndex?: number;
}

export interface AgCheckboxParams extends AgInputFieldParams {
    readOnly?: boolean;
    passive?: boolean;
    name?: string;
}
