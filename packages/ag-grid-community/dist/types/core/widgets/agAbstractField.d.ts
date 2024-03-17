import { AgAbstractLabel, AgLabelParams } from './agAbstractLabel';
export interface AgFieldParams extends AgLabelParams {
    value?: any;
    width?: number;
    onValueChange?: (value?: any) => void;
}
export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export declare abstract class AgAbstractField<TValue, TConfig extends AgFieldParams = AgFieldParams> extends AgAbstractLabel<TConfig> {
    protected readonly className?: string | undefined;
    protected previousValue: TValue | null | undefined;
    protected value: TValue | null | undefined;
    constructor(config?: TConfig, template?: string, className?: string | undefined);
    protected postConstruct(): void;
    protected refreshAriaLabelledBy(): void;
    setAriaLabel(label?: string | null): this;
    onValueChange(callbackFn: (newValue?: TValue | null) => void): this;
    getWidth(): number;
    setWidth(width: number): this;
    getPreviousValue(): TValue | null | undefined;
    getValue(): TValue | null | undefined;
    setValue(value?: TValue | null, silent?: boolean): this;
}
