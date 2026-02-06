import type { IColor, _IUtil } from 'ag-charts-types';

import type {
    AgInputTextFieldParams,
    _AgComponentSelector,
    _AgCoreBeanCollection,
    _AgWidgetSelectorType,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
} from 'ag-grid-community';
import { AgInputTextField, RefPlaceholder } from 'ag-grid-community';

import type { IAgChartsExports } from './iAgChartsExports';

type AgColorInputEvent = 'colorChanged';
export class AgColorInput<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
> extends AgInputTextField<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    AgInputTextFieldParams<TComponentSelectorType>,
    AgColorInputEvent
> {
    private color: _IUtil['Color'];

    public wireBeans(beans: TBeanCollection): void {
        this.color = (beans.agChartsExports as IAgChartsExports)._Util.Color;
    }
    private readonly eColor: HTMLElement = RefPlaceholder;

    constructor() {
        super({
            template: {
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
            },
        });
    }

    public setColor(color: IColor): void {
        const rgbaColor = color.toRgbaString();
        this.setValue(this.color.fromString(rgbaColor).toHexString().toUpperCase(), true);
        this.eColor.style.backgroundColor = rgbaColor;
    }

    public override setValue(value?: string | null | undefined, silent?: boolean | undefined): this {
        const isValid = this.color.validColorString(value ?? '');
        this.eInput.setCustomValidity(
            isValid ? '' : this.getLocaleTextFunc()('invalidColor', 'Color value is invalid')
        );
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

export const AgColorInputSelector: _AgComponentSelector<_AgWidgetSelectorType> = {
    selector: 'AG-COLOR-INPUT',
    component: AgColorInput,
};
