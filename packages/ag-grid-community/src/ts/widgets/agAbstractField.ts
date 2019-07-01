import { AgAbstractLabel } from "./agAbstractLabel";
import { _ } from "../utils";

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export abstract class AgAbstractField<T> extends AgAbstractLabel {
    protected abstract displayTag: string;
    protected abstract className: string;
    public abstract getValue(): T;
    public abstract setValue(value: T): this;

    public static EVENT_CHANGED = 'valueChange';
}