import type { AgComponentSelector, BeanCollection} from '@ag-grid-community/core';
import { AgInputTextField, RefSelector } from '@ag-grid-community/core';
import { _Util } from 'ag-charts-community';

import type { ChartTranslationService } from '../charts/chartComp/services/chartTranslationService';

export class AgColorInput extends AgInputTextField {
    static readonly selector: AgComponentSelector = 'AG-COLOR-INPUT';
    private static TEMPLATE = /* html */ `
        <div role="presentation" class="ag-color-input">
            <div ref="eLabel" class="ag-input-field-label"></div>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input">
                <div ref="eColor" class="ag-color-input-color"></div>
            </div>
        </div>`;

    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.chartTranslationService = beans.chartTranslationService;
    }
    @RefSelector('eColor') private readonly eColor: HTMLElement;

    constructor() {
        super({ template: AgColorInput.TEMPLATE });
    }

    public setColor(color: _Util.Color): void {
        const rgbaColor = color.toRgbaString();
        this.setValue(_Util.Color.fromString(rgbaColor).toHexString().toUpperCase(), true);
        this.eColor.style.backgroundColor = rgbaColor;
    }

    public setValue(value?: string | null | undefined, silent?: boolean | undefined): this {
        const isValid = _Util.Color.validColorString(value ?? '');
        this.eInput.setCustomValidity(isValid ? '' : this.chartTranslationService.translate('invalidColor'));
        super.setValue(value, silent);
        if (isValid && !silent) {
            this.dispatchEvent({ type: 'colorChanged' });
        }
        return this;
    }

    public onColorChanged(callback: (color: _Util.Color) => void): void {
        this.addManagedListener(this, 'colorChanged', () => callback(_Util.Color.fromString(this.value!)));
    }
}
