import { AgAbstractLabel } from "./agAbstractLabel";
import { _ } from "../utils";

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export abstract class AgAbstractField<T> extends AgAbstractLabel {
    public static EVENT_CHANGED = 'valueChange';

    protected abstract displayTag: string;
    protected abstract className: string;

    protected value: T;

    public onValueChange(callbackFn: (newValue: T) => void) {
        this.addDestroyableEventListener(this, AgAbstractField.EVENT_CHANGED, () => {
            callbackFn(this.getValue());
        });
        return this;
    }

    public getWidth(): number {
        return this.getGui().clientWidth;
    }

    public setWidth(width: number): this {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }

    public getValue(): T {
        return this.value;
    }

    public setValue(value: T, silent?: boolean): this {
        if (this.value === value) {
            return this;
        }

        this.value = value;

        if (!silent) {
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }

        return this;
    }
}