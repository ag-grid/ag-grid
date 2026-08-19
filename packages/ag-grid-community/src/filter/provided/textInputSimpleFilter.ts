import { _getActiveDomElement, _isBrowserFirefox } from 'ag-stack';

import { AgInputTextField } from '../../agWidgets/agInputTextField';
import type { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { _createElement } from '../../utils/element';
import type { GridInputNumberField, GridInputTextField } from '../../widgets/gridWidgetTypes';
import type { ProvidedFilterParams } from './iProvidedFilter';
import type { ICombinedSimpleModel, ISimpleFilterModel, Tuple } from './iSimpleFilter';
import type { SimpleFilterDisplayParams } from './simpleFilter';
import { SimpleFilter } from './simpleFilter';

/** The value the filter wrote into an input; it stands for that input only while the text still matches. */
interface RenderedValue<V> {
    text: string;
    value: V | null;
}

/** A `number` input reports `null` for both, so a replacement can only be re-focused, not re-positioned. */
interface Caret {
    start: number | null;
    end: number | null;
}

/** Whether new parameters need the elements replaced, or only their text shown again. */
export type RenderChange = 'rebuild' | 'rerender';

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
    /** Held by position: removing a condition shifts every later one. */
    protected readonly eValuesFrom: E[] = [];
    protected readonly eValuesTo: E[] = [];
    /** Keyed on the element so it cannot outlive it, unlike a position, which shifts. */
    private readonly renderedValues = new WeakMap<E, RenderedValue<V>>();
    /** The parameters the mounted inputs were filled through; their text is only readable through these. */
    private renderedWith: P | undefined;

    /** The widget itself; the pair's shared decoration is the base's. */
    protected abstract createInputWidget(): E;

    /** How one set of parameters reads its own text back. */
    protected abstract parseText(text: string | null | undefined, params: P | undefined): V | null;

    protected abstract getValueFormatter(): ((value: V | null) => string | null) | undefined;

    /** What the new parameters need done to the mounted inputs, if anything. */
    protected abstract getRenderChange(params: P, previous: P | undefined): RenderChange | undefined;

    protected abstract refreshInputPairValidation(from: E, to: E, isFrom?: boolean): void;

    protected override defaultDebounceMs = 500;

    protected override shouldKeepInvalidInputState(): boolean {
        // Mimics incomplete date and datetime inputs, which Firefox clears and Chrome/Safari keep.
        return !_isBrowserFirefox() && this.hasInvalidInputs() && this.getConditionTypes().includes('inRange');
    }

    protected createTextInput(allowedCharPattern: string | null): GridInputTextField {
        return this.createBean(
            new AgInputTextField({
                allowedCharPattern: allowedCharPattern ?? undefined,
                clearButton: true,
                searchIcon: true,
            })
        );
    }

    private buildInput(fromTo: 'from' | 'to'): E {
        const element = this.createInputWidget();
        element.addCss(`ag-filter-${fromTo}`);
        element.addCss('ag-filter-filter');
        return element;
    }

    public override afterGuiAttached(params?: IAfterGuiAttachedParams | undefined): void {
        super.afterGuiAttached(params);

        this.refreshInputValidation();
    }

    public override refresh(legacyNewParams: ProvidedFilterParams): boolean {
        const result = super.refresh(legacyNewParams);

        const { state: newState, additionalEventAttributes } = legacyNewParams as unknown as P;
        const oldState = this.state;

        const fromAction = additionalEventAttributes?.fromAction;
        const forceRefreshValidation = fromAction && fromAction != 'apply';

        if (
            forceRefreshValidation ||
            newState.model !== oldState.model ||
            !this.areStatesEqual(newState.state, oldState.state)
        ) {
            this.refreshInputValidation();
        }

        return result;
    }

    /** Non-model UI state, so validity changes reach the UI through `ProvidedFilter.refresh`. */
    protected override getState(): { isInvalid: boolean } {
        return { isInvalid: this.hasInvalidInputs() };
    }

    protected override areStatesEqual(stateA?: { isInvalid: boolean }, stateB?: { isInvalid: boolean }): boolean {
        return (stateA?.isInvalid ?? false) === (stateB?.isInvalid ?? false);
    }

    protected override hasInvalidInputs(): boolean {
        let invalidInputs = false;
        this.forEachInput((element) => (invalidInputs ||= !element.getInputElement().validity.valid));
        return invalidInputs;
    }

    protected override positionHasInvalidInputs(position: number): boolean {
        let invalidInputs = false;
        this.forEachPositionInput(position, (element) => (invalidInputs ||= !element.getInputElement().validity.valid));
        return invalidInputs;
    }

    protected override canApply(_model: M | ICombinedSimpleModel<M> | null): boolean {
        return !this.hasInvalidInputs();
    }

    protected override removeConditionsAndOperators(startPosition: number, deleteCount?: number | undefined): void {
        // An invalid range lives in the last condition, which must survive until the user finishes editing it.
        if (this.hasInvalidInputs()) {
            return;
        }

        return super.removeConditionsAndOperators(startPosition, deleteCount);
    }

    protected override commonUpdateSimpleParams(params: P): void {
        super.commonUpdateSimpleParams(params);

        const previous = this.renderedWith;
        this.renderedWith = params;
        const change = this.getRenderChange(params, previous);
        if (change) {
            this.refreshInputElements(change === 'rebuild', previous);
        }
    }

    /**
     * The inputs are replaced when a parameter decides a different element, so they cannot be managed beans:
     * `createManagedBean` registers a destroy func that cannot be unregistered, retaining every dead widget.
     */
    public override destroy(): void {
        this.destroyBeans(this.eValuesFrom);
        this.destroyBeans(this.eValuesTo);
        super.destroy();
    }

    protected override createEValue(): HTMLElement {
        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        const from = this.buildInput('from');
        const to = this.buildInput('to');
        this.eValuesFrom.push(from);
        this.eValuesTo.push(to);
        eCondition.appendChild(from.getGui());
        eCondition.appendChild(to.getGui());
        this.attachInputPairListeners(from, to);

        return eCondition;
    }

    protected override removeEValues(startPosition: number, deleteCount?: number): void {
        this.removeComponents(this.eValuesFrom, startPosition, deleteCount);
        this.removeComponents(this.eValuesTo, startPosition, deleteCount);
    }

    protected override getInputs(position: number): Tuple<E> {
        const eValuesFrom = this.eValuesFrom;
        return position < eValuesFrom.length ? [eValuesFrom[position], this.eValuesTo[position]] : [null, null];
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

    /** The value an input holds: the one it was rendered with, until the user makes the text their own. */
    protected readValue(element: E, ignoreValidity?: boolean): V | null {
        const rendered = this.getRenderedValue(element);
        return rendered ? rendered.value : this.parseText(element.getValue(ignoreValidity), this.params);
    }

    /** `value` widens to `string` for the legacy floating-filter path, which passes its input's text. */
    protected override setElementValue(element: E, value: V | string | null, fromFloatingFilter?: boolean): void {
        // Only that path passes text, and it is the one path that neither formats nor records a value.
        const modelValue = value as V | null;
        // A floating filter's value comes straight from its own input, so it is shown as the user wrote it.
        const valueFormatter = this.getValueFormatter();
        const valueToSet = !fromFloatingFilter && valueFormatter ? valueFormatter(modelValue) : value;
        super.setElementValue(element, valueToSet, fromFloatingFilter);
        const text = element.getInputElement().value;
        // A floating filter passes the text the user typed there, which is read back like any other typing;
        // and an input showing nothing stands for no value, whatever a formatter failed to render into it.
        if (fromFloatingFilter || (text === '' && modelValue !== null)) {
            this.renderedValues.delete(element);
        } else {
            this.renderedValues.set(element, { text, value: modelValue });
        }
        // An empty condition carries no validity, whatever a formatter chose to render null as.
        if (modelValue === null || valueToSet === null) {
            element.setCustomValidity('');
        }
    }

    private getRenderedValue(element: E): RenderedValue<V> | undefined {
        const rendered = this.renderedValues.get(element);
        return rendered?.text === element.getInputElement().value ? rendered : undefined;
    }

    /** Re-validates every mounted condition; a replaced element carries none of the original's validity. */
    protected refreshInputValidation(): void {
        const { eValuesFrom, eValuesTo } = this;
        for (let i = 0, len = eValuesFrom.length; i < len; ++i) {
            this.refreshInputPairValidation(eValuesFrom[i], eValuesTo[i]);
        }
    }

    /** A pair's own listeners, re-attached whenever either element is replaced. */
    private attachInputPairListeners(from: E, to: E): void {
        this.attachInputListeners(from, () => this.refreshInputPairValidation(from, to, true));
        this.attachInputListeners(to, () => this.refreshInputPairValidation(from, to, false));
    }

    private attachInputListeners(element: E, refreshValidation: () => void): void {
        element.onValueChange(() => {
            // Typing makes the text the user's own, so the value the filter wrote no longer stands for it.
            this.renderedValues.delete(element);
            refreshValidation();
        });
        element.addGuiEventListener('focusin', refreshValidation);
    }

    /** Shows every mounted input again, replacing the elements whose type the new parameters changed. */
    private refreshInputElements(rebuild: boolean, previous: P | undefined): void {
        const eValuesFrom = this.eValuesFrom;
        const numConditions = eValuesFrom.length;
        if (!numConditions) {
            return;
        }
        const eValuesTo = this.eValuesTo;
        for (let position = 0; position < numConditions; ++position) {
            this.refreshInputElement(position, 'from', rebuild, previous);
            this.refreshInputElement(position, 'to', rebuild, previous);
            if (rebuild) {
                // A replacement element carries none of the original's listeners, so re-attach them all.
                this.attachInputsOnChange(position);
                this.attachInputPairListeners(eValuesFrom[position], eValuesTo[position]);
            }
        }
        // Before the visibility pass: a replacement carries no validity, and an invalid condition is
        // not a complete one.
        this.refreshInputValidation();
        if (rebuild) {
            this.updateUiVisibility(); // the replacements start visible and enabled, whatever the condition is
        }
    }

    private refreshInputElement(
        position: number,
        fromTo: 'from' | 'to',
        rebuild: boolean,
        previous: P | undefined
    ): void {
        const eValues = fromTo === 'from' ? this.eValuesFrom : this.eValuesTo;
        const mounted = eValues[position];
        // Read past the validity gate: an input reported as out of order still holds what the user typed.
        const text = mounted.getValue(true);
        const rendered = this.getRenderedValue(mounted);
        const value = rendered ? rendered.value : this.parseText(text, previous);
        // Text the filter did not write is the user's own: re-rendering it would move the caret, and a
        // lossy formatter would change what they typed.
        const keepAsTyped = !rendered && text != null && text !== '';
        let element = mounted;
        let caret: Caret | undefined;
        if (rebuild) {
            caret = this.takeCaret(mounted);
            element = this.buildInput(fromTo);
            mounted.getGui().replaceWith(element.getGui());
            this.destroyBean(mounted);
            eValues[position] = element;
        }
        if (keepAsTyped) {
            element.setValue(text, true);
            // A replacement holds only its own grammar; text it refused leaves the value it stood for unshown.
            if (element.getInputElement().value === text) {
                this.restoreCaret(element, caret);
                return;
            }
        }
        this.setElementValue(element, value);
        this.restoreCaret(element, caret);
    }

    /** Where the user was, if they were in this input at all — a replacement is a different element. */
    private takeCaret(mounted: E): Caret | undefined {
        const eInput = mounted.getInputElement();
        if (_getActiveDomElement(this.beans) !== eInput) {
            return undefined;
        }
        // A `number` input reports no selection, so only its focus can be carried across.
        return { start: eInput.selectionStart, end: eInput.selectionEnd };
    }

    private restoreCaret(element: E, caret: Caret | undefined): void {
        if (!caret) {
            return;
        }
        const eInput = element.getInputElement();
        eInput.focus();
        // A replacement holding no selection, such as a `number` input, reports none and throws on one.
        if (caret.start != null && eInput.selectionStart != null) {
            eInput.setSelectionRange(caret.start, caret.end);
        }
    }
}
