import type { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { _createElement } from '../../utils/element';
import type { GridInputNumberField, GridInputTextField } from '../../widgets/gridWidgetTypes';
import type { ISimpleFilterModel, Tuple } from './iSimpleFilter';
import type { SimpleFilterDisplayParams } from './simpleFilter';
import { SimpleFilter } from './simpleFilter';

/** What an input was written with: the value is only still its own while the text is the one written. */
interface RenderedValue<V> {
    text: string;
    value: V | null;
}

/**
 * A simple filter whose condition is a pair of text-holding inputs. The element type is fixed when an input is
 * built, so parameters deciding it can only take effect by replacing the element.
 */
export abstract class TextInputSimpleFilter<
    M extends ISimpleFilterModel,
    V,
    E extends GridInputTextField | GridInputNumberField,
    P extends SimpleFilterDisplayParams<M>,
> extends SimpleFilter<M, V, E, P> {
    /** Held by position, never handed out as an element: removing a condition shifts every one after it. */
    protected readonly eValuesFrom: E[] = [];
    protected readonly eValuesTo: E[] = [];
    /** Keyed on the element so it cannot outlive it, unlike a position, which shifts. */
    private readonly renderedValues = new WeakMap<E, RenderedValue<V>>();
    /** Read once when an input is built, so a `colDef` refresh that changes it has to rebuild them. */
    protected allowedCharPattern: string | null;
    /** The parameters the mounted inputs were filled through; their text is only readable through these. */
    protected renderedWith: P | undefined;

    protected abstract createInputElement(fromTo: 'from' | 'to'): E;

    /** How one set of parameters reads its own text back; only the user's own typing is ever parsed. */
    protected abstract parseText(text: string | null | undefined, params: P | undefined): V | null;

    /** The text a value is written as, where the filter formats it at all. */
    protected abstract getValueFormatter(): ((value: V | null) => string | null) | undefined;

    public override afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.refreshInputValidation();
    }

    protected override createEValue(): HTMLElement {
        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        const from = this.createInputElement('from');
        const to = this.createInputElement('to');
        this.eValuesFrom.push(from);
        this.eValuesTo.push(to);
        eCondition.appendChild(from.getGui());
        eCondition.appendChild(to.getGui());
        this.attachRangeValidationListeners(from, to);

        return eCondition;
    }

    protected override removeEValues(startPosition: number, deleteCount?: number): void {
        this.removeComponents(this.eValuesFrom, startPosition, deleteCount);
        this.removeComponents(this.eValuesTo, startPosition, deleteCount);
    }

    /** A replacement element carries none of the original's listeners, so a rebuild re-attaches them all. */
    private attachRebuiltInputListeners(from: E, to: E): void {
        this.attachElementOnChange(from, this.listener);
        this.attachElementOnChange(to, this.listener);
        this.attachRangeValidationListeners(from, to);
    }

    /** Either input changing re-validates the pair: the message is about their order, not one value. */
    private attachRangeValidationListeners(from: E, to: E): void {
        const fromListener = () => this.refreshInputValidationAt(from, true);
        from.onValueChange(fromListener);
        from.addGuiEventListener('focusin', fromListener);

        const toListener = () => this.refreshInputValidationAt(to, false);
        to.onValueChange(toListener);
        to.addGuiEventListener('focusin', toListener);
    }

    /** Resolved per event, never captured: a condition removed from the middle shifts every one after it. */
    private refreshInputValidationAt(element: E, isFrom: boolean): void {
        const position = (isFrom ? this.eValuesFrom : this.eValuesTo).indexOf(element);
        if (position >= 0) {
            this.refreshPositionValidation(position, isFrom);
        }
    }

    /** What the input was rendered with, or `undefined` once the user has made the text their own. */
    private getRenderedValue(element: E): RenderedValue<V> | undefined {
        const rendered = this.renderedValues.get(element);
        return rendered?.text === element.getInputElement().value ? rendered : undefined;
    }

    /** The value an input holds: the one it was rendered with, until the user makes the text their own. */
    protected readValue(element: E, ignoreValidity?: boolean): V | null {
        const rendered = this.getRenderedValue(element);
        return rendered ? rendered.value : this.parseText(element.getValue(ignoreValidity), this.params);
    }

    protected override setElementValue(element: E, value: V | null, fromFloatingFilter?: boolean): void {
        // A floating filter's value comes straight from its own input, so it is shown as the user wrote it.
        const valueFormatter = this.getValueFormatter();
        const valueToSet = !fromFloatingFilter && valueFormatter ? valueFormatter(value) : value;
        super.setElementValue(element, valueToSet as any, fromFloatingFilter);
        // What the filter wrote is not something the user typed, so it is never read back through the parser.
        // A floating filter passes the text the user typed there, which is read back like any other typing.
        if (fromFloatingFilter) {
            this.renderedValues.delete(element);
        } else {
            this.renderedValues.set(element, { text: element.getInputElement().value, value });
        }
        if (valueToSet === null) {
            element.setCustomValidity('');
        }
    }

    protected override getValues(position: number): Tuple<V> {
        const result: Tuple<V> = [];
        this.forEachPositionInput(position, (element, index, _position, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(this.readValue(element));
            }
        });

        return result;
    }

    protected override getInputs(position: number): Tuple<E> {
        const eValuesFrom = this.eValuesFrom;
        return position < eValuesFrom.length ? [eValuesFrom[position], this.eValuesTo[position]] : [null, null];
    }

    protected override isInputInvalid(element: E): boolean {
        return !element.getInputElement().validity.valid;
    }

    /**
     * Equivalent to the inputs' validity, so a change in it drives a UI update (see `ProvidedFilter.refresh`).
     * Only the filters that can report an invalid input emit it: it reaches the public `columnFilterState`.
     */
    protected override getState(): { isInvalid: boolean } {
        return { isInvalid: this.hasInvalidInputs() };
    }

    protected override areStatesEqual(stateA?: { isInvalid: boolean }, stateB?: { isInvalid: boolean }): boolean {
        return (stateA?.isInvalid ?? false) === (stateB?.isInvalid ?? false);
    }

    /** Shows every mounted input again, replacing the elements whose type the new parameters changed. */
    protected refreshInputElements(rebuild: boolean, previous: P | undefined): void {
        const { eValuesFrom, eValuesTo } = this;
        const numConditions = eValuesFrom.length;
        if (!numConditions) {
            return;
        }
        for (let position = 0; position < numConditions; ++position) {
            this.refreshInputElement(eValuesFrom, position, 'from', rebuild, previous);
            this.refreshInputElement(eValuesTo, position, 'to', rebuild, previous);
            if (rebuild) {
                this.attachRebuiltInputListeners(eValuesFrom[position], eValuesTo[position]);
            }
        }
        this.updateUiVisibility(); // the replacements start visible and enabled, whatever the condition is
        this.refreshInputValidation();
    }

    private refreshInputElement(
        eValues: E[],
        position: number,
        fromTo: 'from' | 'to',
        rebuild: boolean,
        previous: P | undefined
    ): void {
        const mounted = eValues[position];
        // Read past the validity gate: an input reported as out of order still holds what the user typed.
        const text = mounted.getValue(true);
        const rendered = this.getRenderedValue(mounted);
        const value = rendered ? rendered.value : this.parseText(text, previous);
        // Text no parser reads is not a value to render again, it is what the user is still typing.
        const isMidEdit = value == null && text != null && text !== '';
        let element = mounted;
        if (rebuild) {
            element = this.createInputElement(fromTo);
            mounted.getGui().replaceWith(element.getGui());
            this.destroyBean(mounted);
            eValues[position] = element;
        }
        if (isMidEdit) {
            this.renderedValues.delete(element);
            element.setValue(text, true);
        } else {
            this.setElementValue(element, value);
        }
    }
}
