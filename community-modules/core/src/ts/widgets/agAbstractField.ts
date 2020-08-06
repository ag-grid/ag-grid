import { AgAbstractLabel, IAgLabel } from './agAbstractLabel';
import { setDisabled, addOrRemoveCssClass, setFixedWidth, addCssClass } from '../utils/dom';

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export abstract class AgAbstractField<TValue, TConfig extends IAgLabel = IAgLabel> extends AgAbstractLabel<TConfig> {
    public static EVENT_CHANGED = 'valueChange';

    protected value: TValue;
    protected disabled: boolean = false;

    constructor(protected readonly className: string, template?: string, config?: TConfig) {
        super(template, config);
    }

    protected postConstruct(): void {
        super.postConstruct();

        addCssClass(this.getGui(), this.className);
    }

    public onValueChange(callbackFn: (newValue: TValue) => void) {
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

    public getValue(): TValue {
        return this.value;
    }

    public setValue(value: TValue, silent?: boolean): this {
        if (this.value === value) {
            return this;
        }

        this.value = value;

        if (!silent) {
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }

        return this;
    }

    public setDisabled(disabled: boolean): this {
        disabled = !!disabled;

        const element = this.getGui();

        setDisabled(element, disabled);
        addOrRemoveCssClass(element, 'ag-disabled', disabled);

        this.disabled = disabled;

        return this;
    }

    public isDisabled(): boolean {
        return !!this.disabled;
    }
}
