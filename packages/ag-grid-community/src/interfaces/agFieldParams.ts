import type { ElementParams } from '../utils/dom';

export type LabelAlignment = 'left' | 'right' | 'top';

export interface AgLabelParams {
    label?: HTMLElement | string;
    labelWidth?: number | 'flex';
    labelSeparator?: string;
    labelAlignment?: LabelAlignment;
    disabled?: boolean;
}

export interface AgFieldParams extends AgLabelParams {
    value?: any;
    width?: number;
    onValueChange?: (value?: any) => void;
}

export interface AgInputFieldParams extends AgFieldParams {
    inputName?: string;
    inputWidth?: number | 'flex';
    template?: ElementParams;
}

export interface AgCheckboxParams extends AgInputFieldParams {
    readOnly?: boolean;
    passive?: boolean;
}
