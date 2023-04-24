import { AgAbstractLabel, IAgLabel } from './agAbstractLabel';
import { setFixedWidth } from '../utils/dom';

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export abstract class AgAbstractField<TValue, TConfig extends IAgLabel = IAgLabel> extends AgAbstractLabel<TConfig> {
    public static EVENT_CHANGED = 'valueChange';

    protected previousValue: TValue | null | undefined;
    protected value: TValue | null | undefined;

    constructor(config?: TConfig, template?: string, protected readonly className?: string) {
        super(config, template);
    }

    protected postConstruct(): void {
        super.postConstruct();

        if (this.className) {
            this.addCssClass(this.className);
        }
    }

    public onValueChange(callbackFn: (newValue?: TValue | null) => void) {
        this.addManagedListener(this, AgAbstractField.EVENT_CHANGED, () => callbackFn(this.getValue()));

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
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }

        return this;
    }
}
