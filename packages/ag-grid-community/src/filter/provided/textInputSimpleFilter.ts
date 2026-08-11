import type { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { _createElement } from '../../utils/element';
import type { GridInputNumberField, GridInputTextField } from '../../widgets/gridWidgetTypes';
import type { ICombinedSimpleModel, ISimpleFilterModel, Tuple } from './iSimpleFilter';
import type { SimpleFilterDisplayParams } from './simpleFilter';
import { SimpleFilter } from './simpleFilter';

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
    protected readonly eValuesFrom: E[] = [];
    protected readonly eValuesTo: E[] = [];
    /** Read once when an input is built, so a `colDef` refresh that changes it has to rebuild them. */
    protected allowedCharPattern: string | null;
    /** The parameters the mounted inputs were filled through; their text is only readable through these. */
    protected renderedWith: P | undefined;

    /** What each input was last rendered with. Every removal path forgets it, so no entry outlives its input. */
    private readonly rendered = new Map<object, { text: string; value: V | null }>();

    protected abstract createInputElement(fromTo: string): E;

    /** How the parameters that wrote the text read it back; only the user's own typing is ever parsed. */
    protected abstract readPreviousText(text: string | null | undefined, previous: P | undefined): V | null;

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
        this.removeValues(this.eValuesFrom, startPosition, deleteCount);
        this.removeValues(this.eValuesTo, startPosition, deleteCount);
    }

    /** Forgotten before they go: only the filter that rendered an element knows what it was rendered with. */
    private removeValues(eValues: E[], startPosition: number, deleteCount?: number): void {
        const end = deleteCount == null ? eValues.length : startPosition + deleteCount;
        for (let i = startPosition, len = Math.min(end, eValues.length); i < len; ++i) {
            this.forgetRenderedValue(eValues[i]);
        }
        this.removeComponents(eValues, startPosition, deleteCount);
    }

    /** A replacement element carries none of the original's listeners, so a rebuild re-attaches them all. */
    protected attachRebuiltInputListeners(from: E, to: E): void {
        this.attachElementOnChange(from, this.listener);
        this.attachElementOnChange(to, this.listener);
        this.attachRangeValidationListeners(from, to);
    }

    /** Either input changing re-validates the pair: the message is about their order, not one value. */
    protected attachRangeValidationListeners(from: E, to: E): void {
        const fromListener = () => this.refreshInputValidationAt(from, true);
        from.onValueChange(fromListener);
        from.addGuiEventListener('focusin', fromListener);

        const toListener = () => this.refreshInputValidationAt(to, false);
        to.onValueChange(toListener);
        to.addGuiEventListener('focusin', toListener);
    }

    private refreshInputValidationAt(element: E, isFrom: boolean): void {
        const position = this.getInputPosition(element);
        if (position < 0) {
            return;
        }
        this.refreshPositionValidation(position, isFrom);
    }

    /**
     * What the filter wrote is not something the user typed, so it is never read back through the parser.
     * A floating filter passes the text the user typed there, which is read back like any other typing.
     */
    protected trackRenderedValue(element: E, value: V | null, fromFloatingFilter?: boolean): void {
        if (fromFloatingFilter) {
            this.rendered.delete(element);
        } else {
            this.rendered.set(element, { text: element.getInputElement().value, value });
        }
    }

    /** The value the input was rendered with, or `undefined` once the user has made the text their own. */
    protected getRenderedValue(element: E): { value: V | null } | undefined {
        const rendered = this.rendered.get(element);
        return rendered?.text === element.getInputElement().value ? rendered : undefined;
    }

    protected forgetRenderedValue(element: object): void {
        this.rendered.delete(element);
    }

    protected override getInputs(position: number): Tuple<E> {
        const { eValuesFrom, eValuesTo } = this;
        if (position >= eValuesFrom.length) {
            return [null, null];
        }
        return [eValuesFrom[position], eValuesTo[position]];
    }

    protected override isInputInvalid(element: E): boolean {
        return !element.getInputElement().validity.valid;
    }

    protected override canApply(_model: M | ICombinedSimpleModel<M> | null): boolean {
        return !this.hasInvalidInputs();
    }

    /** Equivalent to the inputs' validity, so a change in it drives a UI update (see `ProvidedFilter.refresh`). */
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
        fromTo: string,
        rebuild: boolean,
        previous: P | undefined
    ): void {
        const mounted = eValues[position];
        const text = mounted.getValue();
        // What the filter wrote is read back from what it was rendered with; only the user's own typing is parsed.
        const rendered = this.getRenderedValue(mounted);
        const value = rendered ? rendered.value : this.readPreviousText(text, previous);
        // Text no parser reads is not a value to render again, it is what the user is still typing.
        const isMidEdit = value == null && text != null && text !== '';
        let element = mounted;
        if (rebuild) {
            element = this.createInputElement(fromTo);
            mounted.getGui().replaceWith(element.getGui());
            this.forgetRenderedValue(mounted);
            this.destroyBean(mounted);
            eValues[position] = element;
        }
        if (isMidEdit) {
            element.setValue(text, true);
        } else {
            this.setElementValue(element, value);
        }
    }
}
