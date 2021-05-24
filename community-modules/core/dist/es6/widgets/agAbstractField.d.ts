// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgAbstractLabel, IAgLabel } from './agAbstractLabel';
export declare type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export declare abstract class AgAbstractField<TValue, TConfig extends IAgLabel = IAgLabel> extends AgAbstractLabel<TConfig> {
    protected readonly className?: string;
    static EVENT_CHANGED: string;
    protected previousValue: TValue | null | undefined;
    protected value: TValue | null | undefined;
    protected disabled: boolean;
    constructor(config?: TConfig, template?: string, className?: string);
    protected postConstruct(): void;
    onValueChange(callbackFn: (newValue?: TValue | null) => void): this;
    getWidth(): number;
    setWidth(width: number): this;
    getPreviousValue(): TValue | null | undefined;
    getValue(): TValue | null | undefined;
    setValue(value?: TValue | null, silent?: boolean): this;
    setDisabled(disabled: boolean): this;
    isDisabled(): boolean;
}
