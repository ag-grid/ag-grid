import { AgAbstractLabel, AgLabelParams } from './agAbstractLabel';
import { setFixedWidth } from '../utils/dom';
import { Events } from '../eventKeys';
import { getAriaLabel, setAriaLabel, setAriaLabelledBy } from '../utils/aria';

export interface AgFieldParams extends AgLabelParams {
    value?: any;
    width?: number;
    onValueChange?: (value?: any) => void;
}

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export abstract class AgAbstractField<TValue, TConfig extends AgFieldParams = AgFieldParams> extends AgAbstractLabel<TConfig> {

    protected previousValue: TValue | null | undefined;
    protected value: TValue | null | undefined;

    constructor(config?: TConfig, template?: string, protected readonly className?: string) {
        super(config, template);
    }

    protected postConstruct(): void {
        super.postConstruct();

        const { width, value, onValueChange } = this.config;
        if (width != null) {
            this.setWidth(width);
        }
        if (value != null) {
            this.setValue(value);
        }
        if (onValueChange != null) {
            this.onValueChange(onValueChange);
        }

        if (this.className) {
            this.addCssClass(this.className);
        }

        this.refreshAriaLabelledBy();
    }

    protected refreshAriaLabelledBy() {
        const ariaEl = this.getAriaElement();
        const labelId = this.getLabelId();

        if (getAriaLabel(ariaEl) !== null) {
            setAriaLabelledBy(ariaEl, '');
        } else {
            setAriaLabelledBy(ariaEl, labelId ?? '');
        }
    }

    public setAriaLabel(label?: string | null): this {
        setAriaLabel(this.getAriaElement(), label);
        this.refreshAriaLabelledBy();

        return this;
    }

    public onValueChange(callbackFn: (newValue?: TValue | null) => void) {
        this.addManagedListener(this, Events.EVENT_FIELD_VALUE_CHANGED, () => callbackFn(this.getValue()));

        return this;
    }

    public getWidth(): number {
        return this.getGui().clientWidth;
    }

    public setWidth(width: number): this {
        setFixedWidth(this.getGui(), width);

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
            this.dispatchEvent({ type: Events.EVENT_FIELD_VALUE_CHANGED });
        }

        return this;
    }
}
