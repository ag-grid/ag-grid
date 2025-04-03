import type { IColor, _IUtil } from 'ag-charts-types';

import type { AgInputTextFieldParams, BeanCollection, ComponentSelector, ElementParams } from 'ag-grid-community';
import { AgInputTextField, RefPlaceholder } from 'ag-grid-community';

import type { AgChartsExports } from '../agChartsExports';
import type { ChartTranslationService } from '../chartComp/services/chartTranslationService';

export type AgColorInputEvent = 'colorChanged';
const AgColorInputElement: ElementParams = {
    tag: 'div',
    cls: 'ag-color-input',
    role: 'presentation',
    children: [
        { tag: 'div', ref: 'eLabel', cls: 'ag-input-field-label' },
        {
            tag: 'div',
            ref: 'eWrapper',
            cls: 'ag-wrapper ag-input-wrapper',
            role: 'presentation',
            children: [
                { tag: 'input', ref: 'eInput', cls: 'ag-input-field-input' },
                { tag: 'div', ref: 'eColor', cls: 'ag-color-input-color' },
            ],
        },
    ],
};
export class AgColorInput extends AgInputTextField<AgInputTextFieldParams, AgColorInputEvent> {
    private chartTranslation: ChartTranslationService;
    private color: _IUtil['Color'];

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
        this.color = (beans.agChartsExports as AgChartsExports)._Util.Color;
    }
    private readonly eColor: HTMLElement = RefPlaceholder;

    constructor() {
        super({
            template: AgColorInputElement,
        });
    }

    public setColor(color: IColor): void {
        const rgbaColor = color.toRgbaString();
        this.setValue(this.color.fromString(rgbaColor).toHexString().toUpperCase(), true);
        this.eColor.style.backgroundColor = rgbaColor;
    }

    public override setValue(value?: string | null | undefined, silent?: boolean | undefined): this {
        const isValid = this.color.validColorString(value ?? '');
        this.eInput.setCustomValidity(isValid ? '' : this.chartTranslation.translate('invalidColor'));
        super.setValue(value, silent);
        if (isValid && !silent) {
            this.dispatchLocalEvent({ type: 'colorChanged' });
        }
        return this;
    }

    public onColorChanged(callback: (color: IColor) => void): void {
        this.addManagedListeners(this, { colorChanged: () => callback(this.color.fromString(this.value!)) });
    }
}

export const AgColorInputSelector: ComponentSelector = {
    selector: 'AG-COLOR-INPUT',
    component: AgColorInput,
};
