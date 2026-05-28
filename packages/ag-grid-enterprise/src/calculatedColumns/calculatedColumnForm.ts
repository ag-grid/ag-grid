import type {
    ElementParams,
    GridInputTextArea,
    GridInputTextField,
    GridSelect,
    ITooltipCtrl,
    TooltipFeature,
} from 'ag-grid-community';
import {
    AgInputTextAreaSelector,
    AgInputTextFieldSelector,
    AgSelectSelector,
    Component,
    KeyCode,
    RefPlaceholder,
    _getDocument,
    _setDisplayed,
} from 'ag-grid-community';

export type CalculatedColumnType = 'text' | 'number' | 'boolean' | 'date';

export interface CalculatedColumnDraft {
    colId: string;
    headerName: string;
    cellDataType: CalculatedColumnType;
    calculatedExpression: string;
}

export interface ColumnSuggestion {
    type: 'column' | 'function' | 'operator';
    label: string;
    value: string;
    searchText?: string;
}

export const DEFAULT_DRAFT: Omit<CalculatedColumnDraft, 'colId' | 'headerName'> = {
    cellDataType: 'text',
    calculatedExpression: '',
};

export const CALCULATED_COLUMN_TYPES: Record<CalculatedColumnType, true> = {
    text: true,
    number: true,
    boolean: true,
    date: true,
};

const OPERATOR_SUGGESTIONS: ColumnSuggestion[] = ['+', '-', '*', '/', '^', '&', '=', '<>', '>', '>=', '<', '<='].map(
    (operator) => ({
        type: 'operator' as const,
        label: operator,
        value: operator,
    })
);

const CalculatedColumnFormElement: ElementParams = {
    tag: 'div',
    cls: 'ag-calculated-column-form',
    children: [
        { tag: 'ag-input-text-field', ref: 'eTitle' },
        { tag: 'ag-select', ref: 'eType' },
        {
            tag: 'div',
            cls: 'ag-calculated-column-expression-wrap',
            children: [
                { tag: 'ag-input-text-area', ref: 'eExpression' },
                { tag: 'div', ref: 'eSuggestions', cls: 'ag-calculated-column-suggestions' },
            ],
        },
        {
            tag: 'div',
            cls: 'ag-calculated-column-expression-tools',
            children: [
                { tag: 'button', ref: 'eColumns', cls: 'ag-calculated-column-expression-tool' },
                { tag: 'button', ref: 'eFunctions', cls: 'ag-calculated-column-expression-tool' },
                { tag: 'button', ref: 'eOperators', cls: 'ag-calculated-column-expression-tool' },
            ],
        },
        {
            tag: 'div',
            cls: 'ag-calculated-column-actions',
            children: [
                { tag: 'button', ref: 'eCancel', cls: 'ag-button ag-standard-button ag-calculated-column-action' },
                {
                    tag: 'button',
                    ref: 'eApply',
                    cls: 'ag-button ag-standard-button ag-calculated-column-action ag-calculated-column-action-apply',
                },
            ],
        },
    ],
};

export class CalculatedColumnForm extends Component {
    private readonly eTitle: GridInputTextField = RefPlaceholder;
    private readonly eType: GridSelect<CalculatedColumnType> = RefPlaceholder;
    private readonly eExpression: GridInputTextArea = RefPlaceholder;
    private readonly eSuggestions: HTMLElement = RefPlaceholder;
    private readonly eColumns: HTMLButtonElement = RefPlaceholder;
    private readonly eFunctions: HTMLButtonElement = RefPlaceholder;
    private readonly eOperators: HTMLButtonElement = RefPlaceholder;
    private readonly eApply: HTMLButtonElement = RefPlaceholder;
    private readonly eCancel: HTMLButtonElement = RefPlaceholder;

    private suggestions: ColumnSuggestion[] = [];
    private activeSuggestion = 0;
    private activeReplacement: { start: number; end: number } | null = null;
    private suggestionSource: HTMLElement | null = null;
    private hideSuggestionPopup: (() => void) | undefined;
    private validationTooltipFeature?: TooltipFeature;
    private expressionValidationMessage: string | null = null;

    constructor(
        private draft: CalculatedColumnDraft,
        private readonly getColumnSuggestions: () => ColumnSuggestion[],
        private readonly getFunctionSuggestions: () => ColumnSuggestion[],
        private readonly onValidate: (draft: CalculatedColumnDraft) => string | null,
        private readonly onApply: (draft: CalculatedColumnDraft) => string | null,
        private readonly onCancel: () => void
    ) {
        super(CalculatedColumnFormElement, [AgInputTextFieldSelector, AgSelectSelector, AgInputTextAreaSelector]);
    }

    public postConstruct(): void {
        this.setupFormFields();
        this.setupActionButtons();
        this.setupSuggestions();
        this.setupValidationTooltip();
        this.addFormFieldListeners();
        this.setupExpressionEditor();
        this.addActionListeners();
        this.addFormListeners();
        this.addDestroyFunc(() => this.closeSuggestionPopup());
    }

    public hideSuggestions(): void {
        this.activeReplacement = null;
        this.suggestions = [];
        this.closeSuggestionPopup();
    }

    private setupFormFields(): void {
        const translate = this.getLocaleTextFunc();

        this.eTitle.setLabel(translate('calculatedColumnTitle', 'Title')).setValue(this.draft.headerName, true);
        this.eType
            .setLabel(translate('calculatedColumnType', 'Type'))
            .addOptions([
                { value: 'text', text: translate('dataTypeText', 'Text') },
                { value: 'number', text: translate('dataTypeNumber', 'Number') },
                { value: 'date', text: translate('dataTypeDate', 'Date') },
                { value: 'boolean', text: translate('dataTypeBoolean', 'Boolean') },
            ])
            .setValue(this.draft.cellDataType, true);
        this.eExpression
            .setLabel(translate('calculatedColumnExpression', 'Expression'))
            .setInputPlaceholder(translate('calculatedColumnExpressionPlaceholder', 'Type here'))
            .setRows(3)
            .setValue(this.draft.calculatedExpression, true);
    }

    private setupActionButtons(): void {
        const translate = this.getLocaleTextFunc();

        const actions = ['Columns', 'Functions', 'Operators', 'Apply', 'Cancel'] as const;
        for (const action of actions) {
            const btn = this[`e${action}`];
            btn.textContent = translate(`calculatedColumn${action}`, action);
            btn.type = 'button';
        }
    }

    private setupSuggestions(): void {
        this.eSuggestions.remove();
        _setDisplayed(this.eSuggestions, false);
    }

    private addFormFieldListeners(): void {
        const initialHeaderName = this.draft.headerName;
        this.eTitle.onValueChange((value) => this.updateDraft({ headerName: value || initialHeaderName }));
        this.eType.onValueChange((value) => this.updateDraft({ cellDataType: value ?? DEFAULT_DRAFT.cellDataType }));
        this.eExpression.onValueChange((value) => {
            this.updateDraft({ calculatedExpression: value ?? '' });
            this.setExpressionError(this.onValidate(this.draft));
            this.refreshContextSuggestions();
        });
    }

    private setupExpressionEditor(): void {
        const input = this.eExpression.getInputElement();
        // prevents spellcheck while writing formulas
        input.setAttribute('spellcheck', 'false');

        this.addManagedElementListeners(input, {
            click: () => this.refreshContextSuggestions(),
            keydown: (event: KeyboardEvent) => this.onExpressionKeyDown(event),
            keyup: (event: KeyboardEvent) => this.onExpressionKeyUp(event),
        });
    }

    private addActionListeners(): void {
        this.addManagedElementListeners(this.eColumns, {
            click: () => this.showSuggestions('column', '', null, this.eColumns),
        });
        this.addManagedElementListeners(this.eFunctions, {
            click: () => this.showSuggestions('function', '', null, this.eFunctions),
        });
        this.addManagedElementListeners(this.eOperators, {
            click: () => this.showSuggestions('operator', '', null, this.eOperators),
        });
        this.addManagedElementListeners(this.eApply, {
            click: () => this.setExpressionError(this.onApply(this.draft)),
        });
        this.addManagedElementListeners(this.eCancel, {
            click: () => this.onCancel(),
        });
    }

    private addFormListeners(): void {
        this.addManagedElementListeners(this.getGui(), {
            keydown: (event: KeyboardEvent) => {
                if (this.suggestions.length && event.key === KeyCode.ESCAPE) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.hideSuggestions();
                }
            },
            focusout: () =>
                window.setTimeout(() => {
                    if (!this.getGui().contains(_getDocument(this.beans).activeElement)) {
                        this.hideSuggestions();
                    }
                }, 0),
        });
    }

    private setExpressionError(message: string | null): void {
        const input = this.eExpression.getInputElement();
        const isInvalid = !!message;

        input.setCustomValidity(message ?? '');
        input.classList.toggle('invalid', isInvalid);
        input.toggleAttribute('aria-invalid', isInvalid);
        this.expressionValidationMessage = message;
        this.eApply.disabled = isInvalid;
        this.validationTooltipFeature?.setTooltipAndRefresh(message);
        // set title to empty string to prevent default browser tooltip from showing when validation tooltip is active
        input.setAttribute('title', '');
    }

    private setupValidationTooltip(): void {
        this.validationTooltipFeature = this.createOptionalManagedBean(
            this.beans.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, {
                getGui: () => this.eExpression.getInputElement(),
                getTooltipValue: () => this.expressionValidationMessage,
                getLocation: () => 'calculatedColumnExpression',
                shouldDisplayTooltip: () => !!this.expressionValidationMessage,
            } as ITooltipCtrl)
        );
    }

    private updateDraft(partial: Partial<CalculatedColumnDraft>): void {
        this.draft = { ...this.draft, ...partial };
    }

    private refreshContextSuggestions(): void {
        const input = this.eExpression.getInputElement();
        const value = input.value;
        const caret = input.selectionStart ?? value.length;
        const bracketStart = value.lastIndexOf('[', caret - 1);
        const bracketEnd = value.lastIndexOf(']', caret - 1);

        if (bracketStart > bracketEnd) {
            const prefix = value.slice(bracketStart + 1, caret);
            this.showSuggestions('column', prefix, { start: bracketStart, end: caret }, input);
            return;
        }

        const functionToken = this.getFunctionToken(value, caret);
        if (functionToken) {
            this.showSuggestions(
                'function',
                functionToken.prefix,
                {
                    start: functionToken.start,
                    end: functionToken.end,
                },
                input
            );
            return;
        }

        if (this.activeReplacement) {
            this.hideSuggestions();
        }
    }

    private showSuggestions(
        type: ColumnSuggestion['type'],
        search: string = '',
        replacement: { start: number; end: number } | null = null,
        source: HTMLElement = this.eExpression.getInputElement()
    ): void {
        let suggestions: ColumnSuggestion[];
        if (type === 'column') {
            suggestions = this.getColumnSuggestions();
        } else if (type === 'function') {
            suggestions = this.getFunctionSuggestions();
        } else {
            suggestions = OPERATOR_SUGGESTIONS;
        }

        const searchLower = search.toLocaleLowerCase();
        this.suggestions = searchLower
            ? suggestions.filter(({ label, value, searchText }) =>
                  (searchText ?? `${label} ${value}`).toLocaleLowerCase().includes(searchLower)
              )
            : suggestions;
        this.suggestionSource = source;
        this.activeReplacement = replacement;
        this.activeSuggestion = Math.min(this.activeSuggestion, Math.max(this.suggestions.length - 1, 0));
        this.renderSuggestions();
    }

    private renderSuggestions(): void {
        this.eSuggestions.textContent = '';
        if (!this.suggestions.length) {
            this.closeSuggestionPopup();
            return;
        }

        for (let i = 0; i < this.suggestions.length; i++) {
            const suggestion = this.suggestions[i];
            const row = _getDocument(this.beans).createElement('div');
            row.className = `ag-calculated-column-suggestion${
                i === this.activeSuggestion ? ' ag-calculated-column-suggestion-active' : ''
            }`;
            row.textContent = suggestion.label;
            this.addManagedElementListeners(row, {
                mousedown: (event: MouseEvent) => {
                    event.preventDefault();
                    this.acceptSuggestion(i);
                },
            });
            this.eSuggestions.appendChild(row);
        }

        this.openSuggestionPopup();
    }

    private openSuggestionPopup(): void {
        const source = this.suggestionSource;
        const popupSvc = this.beans.popupSvc;
        if (!source || !popupSvc) {
            return;
        }

        const positionPopup = () =>
            popupSvc.positionPopupByComponent({
                ePopup: this.eSuggestions,
                type: 'calculatedColumnAutocomplete',
                eventSource: source,
                position: 'under',
                alignSide: this.gos.get('enableRtl') ? 'right' : 'left',
                keepWithinBounds: true,
            });

        _setDisplayed(this.eSuggestions, true);

        if (this.hideSuggestionPopup) {
            positionPopup();
            popupSvc.bringPopupToFront(this.eSuggestions);
            return;
        }

        this.hideSuggestionPopup = popupSvc.addPopup({
            eChild: this.eSuggestions,
            positionCallback: positionPopup,
            alwaysOnTop: true,
            ariaLabel: this.getLocaleTextFunc()('calculatedColumnSuggestions', 'Calculated Column Suggestions'),
        }).hideFunc;
        popupSvc.bringPopupToFront(this.eSuggestions);
    }

    private closeSuggestionPopup(): void {
        _setDisplayed(this.eSuggestions, false);
        this.suggestionSource = null;
        this.hideSuggestionPopup?.();
        this.hideSuggestionPopup = undefined;
    }

    private onExpressionKeyDown(event: KeyboardEvent): void {
        if (this.suggestions.length && event.key === KeyCode.ESCAPE) {
            event.preventDefault();
            event.stopPropagation();
            this.hideSuggestions();
            return;
        }

        if (!this.suggestions.length) {
            return;
        }

        if (event.key === KeyCode.UP || event.key === KeyCode.DOWN) {
            event.preventDefault();
            event.stopPropagation();
            const delta = event.key === KeyCode.UP ? -1 : 1;
            this.activeSuggestion = (this.activeSuggestion + delta + this.suggestions.length) % this.suggestions.length;
            this.renderSuggestions();
            return;
        }

        if (event.key === KeyCode.TAB || event.key === KeyCode.ENTER) {
            event.preventDefault();
            event.stopPropagation();
            this.acceptSuggestion(this.activeSuggestion);
        }
    }

    private onExpressionKeyUp(event: KeyboardEvent): void {
        switch (event.key) {
            case KeyCode.ESCAPE:
            case KeyCode.UP:
            case KeyCode.DOWN:
            case KeyCode.TAB:
            case KeyCode.ENTER:
                return;
        }

        this.refreshContextSuggestions();
    }

    private acceptSuggestion(index: number): void {
        const suggestion = this.suggestions[index];
        if (!suggestion) {
            return;
        }

        const input = this.eExpression.getInputElement();
        const value = input.value;
        const start = this.activeReplacement?.start ?? input.selectionStart ?? value.length;
        const end = this.activeReplacement?.end ?? input.selectionEnd ?? start;
        const token = this.getSuggestionInsertText(suggestion);
        const nextValue = `${value.slice(0, start)}${token}${value.slice(end)}`;
        this.eExpression.setValue(nextValue);
        const nextCaret =
            suggestion.type === 'function' && token.endsWith('()') ? start + token.length - 1 : start + token.length;
        input.setSelectionRange(nextCaret, nextCaret);
        input.focus();
        this.hideSuggestions();
    }

    private getSuggestionInsertText(suggestion: ColumnSuggestion): string {
        switch (suggestion.type) {
            case 'column':
                return `[${suggestion.value}]`;
            case 'function':
                return `${suggestion.value}()`;
            case 'operator':
                return ` ${suggestion.value} `;
        }
    }

    private getFunctionToken(value: string, caret: number): { start: number; end: number; prefix: string } | null {
        if (this.isInsideStringLiteral(value, caret)) {
            return null;
        }

        let start = caret;
        while (start > 0 && /[A-Za-z0-9_.]/.test(value[start - 1])) {
            start--;
        }

        let end = caret;
        while (end < value.length && /[A-Za-z0-9_.]/.test(value[end])) {
            end++;
        }

        if (start === end || !/[A-Za-z_]/.test(value[start])) {
            return null;
        }

        const previousChar = this.getPreviousNonSpaceChar(value, start);
        if (previousChar != null && !'([,+-*/^&=<>'.includes(previousChar)) {
            return null;
        }

        return { start, end, prefix: value.slice(start, caret) };
    }

    private getPreviousNonSpaceChar(value: string, offset: number): string | null {
        for (let i = offset - 1; i >= 0; i--) {
            if (value[i] !== ' ') {
                return value[i];
            }
        }
        return null;
    }

    private isInsideStringLiteral(value: string, offset: number): boolean {
        let inString = false;
        for (let i = 0; i < offset && i < value.length; i++) {
            if (value[i] !== '"') {
                continue;
            }
            if (value[i + 1] === '"') {
                i++;
                continue;
            }
            inString = !inString;
        }
        return inString;
    }
}
