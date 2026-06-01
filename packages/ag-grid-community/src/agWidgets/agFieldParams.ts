import type { AgElementParams } from 'ag-stack';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type LabelAlignment = 'left' | 'right' | 'top';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgLabelParams {
    label?: HTMLElement | string;
    labelWidth?: number | 'flex';
    labelSeparator?: string;
    labelAlignment?: LabelAlignment;
    disabled?: boolean;
    labelEllipsis?: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgFieldParams extends AgLabelParams {
    value?: any;
    width?: number;
    onValueChange?: (value?: any) => void;
    ariaLabel?: string | null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgInputFieldParams<TComponentSelectorType extends string> extends AgFieldParams {
    inputName?: string;
    inputWidth?: number | 'flex';
    template?: AgElementParams<TComponentSelectorType>;
    inputPlaceholder?: string;
    autoComplete?: boolean;
    tabIndex?: number;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgCheckboxParams<
    TComponentSelectorType extends string,
> extends AgInputFieldParams<TComponentSelectorType> {
    readOnly?: boolean;
    passive?: boolean;
    name?: string;
}
