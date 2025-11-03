import type { AgComponentSelector } from '../interfaces/agComponent';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _getAriaLabel, _setAriaLabel, _setAriaLabelledBy } from '../utils/aria';
import type { AgElementParams } from '../utils/dom';
import { _setFixedWidth } from '../utils/dom';
import { AgAbstractLabel } from './agAbstractLabel';
import type { AgFieldParams } from './agFieldParams';

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type AgAbstractFieldEvent = 'fieldValueChanged';

export abstract class AgAbstractField<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TValue,
    TConfig extends AgFieldParams = AgFieldParams,
    TEventType extends string = AgAbstractFieldEvent,
> extends AgAbstractLabel<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    TConfig,
    TEventType | AgAbstractFieldEvent
> {
    protected previousValue: TValue | null | undefined;
    protected value: TValue | null | undefined;

    constructor(
        config?: TConfig,
        template?: AgElementParams<TComponentSelectorType>,
        components?: AgComponentSelector<TComponentSelectorType>[],
        protected readonly className?: string
    ) {
        super(config, template, components);
    }

    public override postConstruct(): void {
        super.postConstruct();

        const { width, value, onValueChange, ariaLabel } = this.config;
        if (width != null) {
            this.setWidth(width);
        }
        if (value != null) {
            this.setValue(value);
        }
        if (onValueChange != null) {
            this.onValueChange(onValueChange);
        }
        if (ariaLabel != null) {
            this.setAriaLabel(ariaLabel);
        }

        if (this.className) {
            this.addCss(this.className);
        }

        this.refreshAriaLabelledBy();
    }

    public override setLabel(label: string | HTMLElement): this {
        super.setLabel(label);
        this.refreshAriaLabelledBy();

        return this;
    }

    protected refreshAriaLabelledBy() {
        const ariaEl = this.getAriaElement();
        const labelId = this.getLabelId();
        const label = this.getLabel();

        if (label == null || label == '' || _getAriaLabel(ariaEl) !== null) {
            _setAriaLabelledBy(ariaEl, '');
        } else {
            _setAriaLabelledBy(ariaEl, labelId ?? '');
        }
    }

    public setAriaLabel(label?: string | null): this {
        _setAriaLabel(this.getAriaElement(), label);
        this.refreshAriaLabelledBy();

        return this;
    }

    public onValueChange(callbackFn: (newValue?: TValue | null) => void) {
        this.addManagedListeners<AgAbstractFieldEvent>(this, { fieldValueChanged: () => callbackFn(this.getValue()) });

        return this;
    }

    public getWidth(): number {
        return this.getGui().clientWidth;
    }

    public setWidth(width: number): this {
        _setFixedWidth(this.getGui(), width);

        return this;
    }

    public getPreviousValue(): TValue | null | undefined {
        return this.previousValue;
    }

    public getValue(): TValue | null | undefined {
        return this.value;
    }

    public setValue(value?: TValue | null, silent?: boolean): this {
        if (this.value === value) {
            return this;
        }

        this.previousValue = this.value;
        this.value = value;

        if (!silent) {
            this.dispatchLocalEvent({ type: 'fieldValueChanged' });
        }

        return this;
    }
}
