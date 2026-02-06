import type {
    AgInputFieldParams,
    _AgComponentSelector,
    _AgCoreBeanCollection,
    _AgWidgetSelectorType,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
} from 'ag-grid-community';
import { AgAbstractInputField } from 'ag-grid-community';

export interface AgInputRangeParams<TComponentSelectorType extends string>
    extends AgInputFieldParams<TComponentSelectorType> {
    min?: number;
    max?: number;
    step?: number;
}

export class AgInputRange<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
> extends AgAbstractInputField<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    HTMLInputElement,
    string,
    AgInputRangeParams<TComponentSelectorType>
> {
    private min: number;
    private max: number;

    constructor(config?: AgInputRangeParams<TComponentSelectorType>) {
        super(config, 'ag-range-field', 'range');
    }

    public override postConstruct() {
        super.postConstruct();

        const { min, max, step } = this.config;

        if (min != null) {
            this.setMinValue(min);
        }

        if (max != null) {
            this.setMaxValue(max);
        }

        this.setStep(step || 1);
    }

    protected override addInputListeners() {
        this.addManagedElementListeners(this.eInput, {
            input: (e: any) => {
                const value = e.target.value;

                this.setValue(value);
            },
        });
    }

    public setMinValue(value: number): this {
        this.min = value;

        this.eInput.setAttribute('min', value.toString());

        return this;
    }

    public setMaxValue(value: number): this {
        this.max = value;

        this.eInput.setAttribute('max', value.toString());

        return this;
    }

    public setStep(value: number): this {
        this.eInput.setAttribute('step', value.toString());

        return this;
    }

    public override setValue(value: string, silent?: boolean): this {
        if (this.min != null) {
            value = Math.max(parseFloat(value), this.min).toString();
        }

        if (this.max != null) {
            value = Math.min(parseFloat(value), this.max).toString();
        }

        const ret = super.setValue(value, silent);

        this.eInput.value = value;

        return ret;
    }
}

export const AgInputRangeSelector: _AgComponentSelector<_AgWidgetSelectorType> = {
    selector: 'AG-INPUT-RANGE',
    component: AgInputRange,
};
