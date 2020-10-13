// Type definitions for @ag-grid-community/core v24.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgAbstractLabel, IAgLabel } from './agAbstractLabel';
export declare type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export declare abstract class AgAbstractField<TValue, TConfig extends IAgLabel = IAgLabel> extends AgAbstractLabel<TConfig> {
    protected readonly className?: string;
    static EVENT_CHANGED: string;
    protected value: TValue;
    protected disabled: boolean;
    constructor(config?: TConfig, template?: string, className?: string);
    protected postConstruct(): void;
    onValueChange(callbackFn: (newValue: TValue) => void): this;
    getWidth(): number;
    setWidth(width: number): this;
    getValue(): TValue;
    setValue(value: TValue, silent?: boolean): this;
    setDisabled(disabled: boolean): this;
    isDisabled(): boolean;
}
