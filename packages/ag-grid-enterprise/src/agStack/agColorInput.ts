import type {
    AgComponentSelector,
    AgCoreBeanCollection,
    BaseEvents,
    BaseProperties,
    IPropertiesService,
} from 'ag-stack';
import { RefPlaceholder } from 'ag-stack';

import type { AgInputTextFieldParams, _AgWidgetSelectorType } from 'ag-grid-community';
import { AgInputTextField } from 'ag-grid-community';

import { AgColor } from './agColor';

type AgColorInputEvent = 'colorChanged';
export class AgColorInput<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
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

    public setColor(color: AgColor): void {
        const rgbaColor = color.toRgbaString();
        this.setValue(AgColor.fromString(rgbaColor).toHexString().toUpperCase(), true);
        this.eColor.style.backgroundColor = rgbaColor;
    }

    public override setValue(value?: string | null | undefined, silent?: boolean | undefined): this {
        const isValid = AgColor.validColorString(value ?? '');
        this.eInput.setCustomValidity(
            isValid ? '' : this.getLocaleTextFunc()('invalidColor', 'Color value is invalid')
        );
        super.setValue(value, silent);
        if (isValid && !silent) {
            this.dispatchLocalEvent({ type: 'colorChanged' });
        }
        return this;
    }

    public onColorChanged(callback: (color: AgColor) => void): void {
        this.addManagedListeners(this, { colorChanged: () => callback(AgColor.fromString(this.value!)) });
    }
}

export const AgColorInputSelector: AgComponentSelector<_AgWidgetSelectorType> = {
    selector: 'AG-COLOR-INPUT',
    component: AgColorInput,
};
