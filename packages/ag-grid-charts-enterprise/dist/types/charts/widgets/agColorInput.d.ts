import type { AgInputTextFieldParams, BeanCollection, ComponentSelector } from 'ag-grid-community';
import { AgInputTextField } from 'ag-grid-community';
import { _Util } from 'ag-charts-community';
export type AgColorInputEvent = 'colorChanged';
export declare class AgColorInput extends AgInputTextField<AgInputTextFieldParams, AgColorInputEvent> {
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private readonly eColor;
    constructor();
    setColor(color: _Util.Color): void;
    setValue(value?: string | null | undefined, silent?: boolean | undefined): this;
    onColorChanged(callback: (color: _Util.Color) => void): void;
}
export declare const AgColorInputSelector: ComponentSelector;
