import { RefPlaceholder, _getDocument, _setDisplayed } from 'ag-stack';

import type {
    CalculatedColumnExpressionPicker,
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
} from 'ag-grid-community';

import { AgAutocompleteList } from '../advancedFilter/autocomplete/agAutocompleteList';
import type { AutocompleteEntry } from '../advancedFilter/autocomplete/autocompleteParams';
import { CalculatedColumnAutocompleteRow } from './calculatedColumnAutocompleteRow';
import type {
    CalculatedColumnDataTypeOption,
    CalculatedColumnDraft,
    ColumnSuggestion,
} from './calculatedColumnFormTypes';
import { getOperatorReplacementRange, isInsideStringLiteral } from './calculatedColumnUtils';

export const DEFAULT_DRAFT: Omit<CalculatedColumnDraft, 'colId' | 'headerName'> = {
    cellDataType: 'text',
    calculatedExpression: '',
};

export const DEFAULT_CALCULATED_COLUMN_DATA_TYPES = ['text', 'number', 'date', 'boolean'] as const;
export const DEFAULT_CALCULATED_COLUMN_EXPRESSION_PICKERS = ['columns', 'functions', 'operators'] as const;

const OPERATOR_VALUES = ['+', '-', '*', '/', '^', '&', '=', '<>', '>', '>=', '<', '<='] as const;
const OPERATOR_REPLACEMENT_VALUES = [...OPERATOR_VALUES].sort((a, b) => b.length - a.length);
const OPERATOR_SUGGESTIONS: ColumnSuggestion[] = OPERATOR_VALUES.map((operator) => ({
    type: 'operator' as const,
    label: operator,
    value: operator,
}));
const MAX_VISIBLE_SUGGESTIONS = 6;

type CalculatedColumnAutocompleteEntry = AutocompleteEntry & { suggestion: ColumnSuggestion };

/** Search string for an entry: grouped columns render segments, so the matched text and displayed text can differ. */
function getSuggestionSearchValue(suggestion: ColumnSuggestion): string {
    const isGroupedColumn = suggestion.displayPath != null && suggestion.displayPath.length >= 2;
    return isGroupedColumn ? (suggestion.searchText ?? suggestion.label) : suggestion.label;
}

const CalculatedColumnFormElement: ElementParams = {
    tag: 'div',
    cls: 'ag-calculated-column-form',
    children: [
        { tag: 'ag-input-text-field', ref: 'eTitle' },
        { tag: 'ag-select', ref: 'eType' },
        {
            tag: 'div',
            cls: 'ag-calculated-column-expression-wrap',
            children: [{ tag: 'ag-input-text-area', ref: 'eExpression' }],
        },
        {
            tag: 'div',
            cls: 'ag-calculated-column-expression-tools',
            ref: 'eExpressionTools',
            children: [
                { tag: 'button', ref: 'eColumns', cls: 'ag-calculated-column-expression-tool' },
                { tag: 'button', ref: 'eFunctions', cls: 'ag-calculated-column-expression-tool' },
                { tag: 'button', ref: 'eOperators', cls: 'ag-calculated-column-expression-tool' },
            ],
        },
        {
            tag: 'div',
            ref: 'eActions',
            cls: 'ag-calculated-column-actions',
            children: [
                {
                    tag: 'button',
                    ref: 'eApply',
                    cls: 'ag-button ag-standard-button ag-calculated-column-action ag-calculated-column-action-apply',
                },
                { tag: 'button', ref: 'eCancel', cls: 'ag-button ag-standard-button ag-calculated-column-action' },
            ],
        },
    ],
};

export class CalculatedColumnForm extends Component {
    private readonly eTitle: GridInputTextField = RefPlaceholder;
    private readonly eType: GridSelect<string> = RefPlaceholder;
    private readonly eExpression: GridInputTextArea = RefPlaceholder;
    private readonly eColumns: HTMLButtonElement = RefPlaceholder;
    private readonly eFunctions: HTMLButtonElement = RefPlaceholder;
    private readonly eOperators: HTMLButtonElement = RefPlaceholder;
    private readonly eApply: HTMLButtonElement = RefPlaceholder;
    private readonly eCancel: HTMLButtonElement = RefPlaceholder;
    private readonly eActions: HTMLElement = RefPlaceholder;
    private readonly eExpressionTools: HTMLElement = RefPlaceholder;

    private activeReplacement: { start: number; end: number } | null = null;
    private suggestionSource: HTMLElement | null = null;
    private hideSuggestionPopup: (() => void) | undefined;
    private validationTooltipFeature?: TooltipFeature;
    private expressionValidationMessage: string | null = null;
    private readonly expressionPickers: ReadonlySet<CalculatedColumnExpressionPicker>;
    /** The open suggestion list, recreated whenever the picker type (column/function/operator) changes. */
    private autocompleteList: AgAutocompleteList | null = null;
    private suggestionType: ColumnSuggestion['type'] | null = null;
    private openSuggestions: ColumnSuggestion[] = [];
    private expressionSelection: { start: number; end: number } | null = null;

    constructor(
        private draft: CalculatedColumnDraft,
        private readonly dataTypeOptions: CalculatedColumnDataTypeOption[],
        expressionPickers: readonly CalculatedColumnExpressionPicker[],
        private readonly getColumnSuggestions: () => ColumnSuggestion[],
        private readonly getFunctionSuggestions: () => ColumnSuggestion[],
        private readonly onValidate: (draft: CalculatedColumnDraft) => string | null,
        private readonly onApply: (draft: CalculatedColumnDraft) => string | null,
        private readonly onCancel: () => void,
        private readonly liveApply: boolean,
        private readonly onDraftChange?: (draft: CalculatedColumnDraft) => void
    ) {
        super(CalculatedColumnFormElement, [AgInputTextFieldSelector, AgSelectSelector, AgInputTextAreaSelector]);
        this.expressionPickers = new Set(expressionPickers);
    }

    public postConstruct(): void {
        this.setupFormFields();
        this.setupActionButtons();

        if (!this.liveApply) {
            this.setupValidationTooltip();
        }

        this.addFormFieldListeners();
        this.setupExpressionEditor();
        this.addActionListeners();
        this.addFormListeners();
        this.addDestroyFunc(() => this.closeSuggestionPopup());
    }

    public hideSuggestions(): void {
        this.activeReplacement = null;
        this.closeSuggestionPopup();
    }

    private setupFormFields(): void {
        const translate = this.getLocaleTextFunc();

        this.eTitle
            .setLabel(translate('calculatedColumnTitle', 'Title'))
            .setLabelAlignment('top')
            .setValue(this.draft.headerName, true);
        this.eType
            .setLabel(translate('calculatedColumnType', 'Type'))
            .setLabelAlignment('top')
            .addOptions(this.dataTypeOptions)
            .setValue(this.draft.cellDataType, true);
        this.eExpression
            .setLabel(translate('calculatedColumnExpression', 'Expression'))
            .setLabelAlignment('top')
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

        const hasColumns = this.expressionPickers.has('columns');
        const hasFunctions = this.expressionPickers.has('functions');
        const hasOperators = this.expressionPickers.has('operators');

        _setDisplayed(this.eColumns, hasColumns);
        _setDisplayed(this.eFunctions, hasFunctions);
        _setDisplayed(this.eOperators, hasOperators);
        _setDisplayed(this.eExpressionTools, hasColumns || hasFunctions || hasOperators);
        _setDisplayed(this.eActions, !this.liveApply);
    }

    private addFormFieldListeners(): void {
        const initialHeaderName = this.draft.headerName;
        this.eTitle.onValueChange((value) => this.updateDraft({ headerName: value || initialHeaderName }));
        this.eType.onValueChange((value) => {
            this.updateDraft({ cellDataType: value ?? this.dataTypeOptions[0]?.value ?? DEFAULT_DRAFT.cellDataType });
        });
        this.eExpression.onValueChange((value) => {
            this.updateDraft({ calculatedExpression: value ?? '' });
            if (!this.liveApply) {
                this.setExpressionError(this.onValidate(this.draft));
            }
            this.refreshContextSuggestions();
        });
    }

    private setupExpressionEditor(): void {
        const input = this.eExpression.getInputElement();
        // prevents spellcheck while writing formulas
        input.setAttribute('spellcheck', 'false');

        this.addManagedElementListeners(input, {
            click: () => {
                this.rememberExpressionSelection();
                this.refreshContextSuggestions();
            },
            input: () => this.rememberExpressionSelection(),
            keydown: (event: KeyboardEvent) => this.onExpressionKeyDown(event),
            keyup: (event: KeyboardEvent) => this.onExpressionKeyUp(event),
            select: () => this.rememberExpressionSelection(),
        });
    }

    private addActionListeners(): void {
        const expressionPickers = this.expressionPickers;
        const pickerButtons: [CalculatedColumnExpressionPicker, ColumnSuggestion['type'], HTMLButtonElement][] = [
            ['columns', 'column', this.eColumns],
            ['functions', 'function', this.eFunctions],
            ['operators', 'operator', this.eOperators],
        ];
        for (const pickerButton of pickerButtons) {
            const [pickerKey, suggestionType, button] = pickerButton;
            if (expressionPickers.has(pickerKey)) {
                this.addManagedElementListeners(button, {
                    mousedown: () => this.rememberExpressionSelection(),
                    click: () => this.openPicker(suggestionType, button),
                });
            }
        }
        if (!this.liveApply) {
            this.addManagedElementListeners(this.eApply, {
                click: () => this.setExpressionError(this.onApply(this.draft)),
            });
            this.addManagedElementListeners(this.eCancel, {
                click: () => this.onCancel(),
            });
        }
    }

    private addFormListeners(): void {
        this.addManagedElementListeners(this.getGui(), {
            keydown: (event: KeyboardEvent) => {
                if (event.target !== this.eExpression.getInputElement()) {
                    this.onSuggestionKeyDown(event);
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
        this.onDraftChange?.(this.draft);
    }

    private rememberExpressionSelection(): void {
        const input = this.eExpression.getInputElement();
        const valueLength = input.value.length;
        const start = input.selectionStart ?? valueLength;
        const end = input.selectionEnd ?? start;
        this.expressionSelection = { start, end };
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

    private openPicker(type: ColumnSuggestion['type'], button: HTMLButtonElement): void {
        this.rememberExpressionSelection();
        this.showSuggestions(type, '', this.expressionSelection, button);
    }

    private getSuggestionsForType(type: ColumnSuggestion['type']): ColumnSuggestion[] {
        if (type === 'column') {
            return this.getColumnSuggestions();
        }
        if (type === 'function') {
            return this.getFunctionSuggestions();
        }
        return OPERATOR_SUGGESTIONS;
    }

    private showSuggestions(
        type: ColumnSuggestion['type'],
        search: string = '',
        replacement: { start: number; end: number } | null = null,
        source: HTMLElement = this.eExpression.getInputElement()
    ): void {
        const suggestions = this.getSuggestionsForType(type);
        const searchLower = search.toLocaleLowerCase();
        const hasMatch =
            !searchLower ||
            suggestions.some((suggestion) =>
                getSuggestionSearchValue(suggestion).toLocaleLowerCase().includes(searchLower)
            );
        if (!hasMatch) {
            this.hideSuggestions();
            return;
        }

        this.activeReplacement = replacement;
        this.suggestionSource = source;
        this.openSuggestionPopup(type, suggestions);
        this.autocompleteList?.setSearch(search);
        this.positionSuggestionPopup();
    }

    private openSuggestionPopup(type: ColumnSuggestion['type'], suggestions: ColumnSuggestion[]): void {
        const popupSvc = this.beans.popupSvc;
        if (!popupSvc) {
            return;
        }

        if (this.autocompleteList && this.suggestionType !== type) {
            this.closeSuggestionPopup();
        }
        if (this.autocompleteList) {
            return;
        }

        this.suggestionType = type;
        this.openSuggestions = suggestions;
        const list = this.createManagedBean(
            new AgAutocompleteList({
                autocompleteEntries: this.createAutocompleteEntries(suggestions),
                onConfirmed: () => this.confirmSelectedSuggestion(),
                autoSizeList: true,
                maxVisibleItems: MAX_VISIBLE_SUGGESTIONS,
                onListHeightChanged: () => this.positionSuggestionPopup(),
                rowComponentCreator:
                    type === 'column'
                        ? (entry, selected) => this.createColumnSuggestionRow(entry, selected)
                        : undefined,
            })
        );
        this.autocompleteList = list;
        this.hideSuggestionPopup = popupSvc.addPopup({
            eChild: list.getGui(),
            positionCallback: () => this.positionSuggestionPopup(),
            alwaysOnTop: true,
            ariaLabel: this.getLocaleTextFunc()('calculatedColumnSuggestions', 'Calculated Column Suggestions'),
        }).hideFunc;
        list.afterGuiAttached();
    }

    private createAutocompleteEntries(suggestions: ColumnSuggestion[]): AutocompleteEntry[] {
        const entries: AutocompleteEntry[] = [];
        for (let i = 0, len = suggestions.length; i < len; ++i) {
            const suggestion = suggestions[i];
            const entry: CalculatedColumnAutocompleteEntry = {
                key: `${i}`,
                displayValue: getSuggestionSearchValue(suggestion),
                suggestion,
            };
            entries.push(entry);
        }
        return entries;
    }

    private createColumnSuggestionRow(entry: AutocompleteEntry, selected: boolean): CalculatedColumnAutocompleteRow {
        const row = new CalculatedColumnAutocompleteRow();
        row.setState((entry as CalculatedColumnAutocompleteEntry).suggestion, selected);
        return row;
    }

    private positionSuggestionPopup(): void {
        const source = this.suggestionSource;
        const list = this.autocompleteList;
        const popupSvc = this.beans.popupSvc;
        if (!source || !list || !popupSvc) {
            return;
        }

        const editorWidth = this.eExpression.getInputElement().offsetWidth;
        if (editorWidth > 0) {
            list.getGui().style.width = `${editorWidth}px`;
        }

        popupSvc.positionPopupByComponent({
            ePopup: list.getGui(),
            type: 'calculatedColumnAutocomplete',
            eventSource: source,
            position: 'under',
            alignSide: this.gos.get('enableRtl') ? 'right' : 'left',
            keepWithinBounds: true,
        });
        // Keep the list above the (non-modal) dialog it was opened from.
        popupSvc.bringPopupToFront(list.getGui());
    }

    private confirmSelectedSuggestion(): void {
        const selected = this.autocompleteList?.getSelectedValue();
        const suggestion = selected ? this.openSuggestions[Number(selected.key)] : undefined;
        if (suggestion) {
            this.acceptSuggestion(suggestion);
        } else {
            this.hideSuggestions();
        }
    }

    private closeSuggestionPopup(): void {
        this.suggestionSource = null;
        this.suggestionType = null;
        this.openSuggestions = [];
        this.hideSuggestionPopup?.();
        this.hideSuggestionPopup = undefined;
        if (this.autocompleteList) {
            this.destroyBean(this.autocompleteList);
            this.autocompleteList = null;
        }
    }

    private onExpressionKeyDown(event: KeyboardEvent): void {
        this.onSuggestionKeyDown(event);
    }

    private onSuggestionKeyDown(event: KeyboardEvent): void {
        const list = this.autocompleteList;
        if (!list) {
            return;
        }

        switch (event.key) {
            case KeyCode.ESCAPE:
                event.preventDefault();
                event.stopPropagation();
                this.hideSuggestions();
                return;
            case KeyCode.UP:
            case KeyCode.DOWN:
                // onNavigationKeyDown calls preventDefault; stop the dialog handling the same key.
                event.stopPropagation();
                list.onNavigationKeyDown(event, event.key);
                return;
            case KeyCode.TAB:
            case KeyCode.ENTER:
                event.preventDefault();
                event.stopPropagation();
                this.confirmSelectedSuggestion();
                return;
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

    private acceptSuggestion(suggestion: ColumnSuggestion): void {
        const input = this.eExpression.getInputElement();
        const value = input.value;
        const token = this.getSuggestionInsertText(suggestion);
        const replacement = this.activeReplacement ?? this.expressionSelection;
        const initialStart = replacement?.start ?? input.selectionStart ?? value.length;
        const initialEnd = replacement?.end ?? input.selectionEnd ?? initialStart;
        const { start, end } =
            suggestion.type === 'operator'
                ? getOperatorReplacementRange(value, initialStart, initialEnd, OPERATOR_REPLACEMENT_VALUES)
                : { start: initialStart, end: initialEnd };
        const nextValue = `${value.slice(0, start)}${token}${value.slice(end)}`;
        this.eExpression.setValue(nextValue);
        const nextCaret =
            suggestion.type === 'function' && token.endsWith('()') ? start + token.length - 1 : start + token.length;
        input.setSelectionRange(nextCaret, nextCaret);
        this.expressionSelection = { start: nextCaret, end: nextCaret };
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
        if (isInsideStringLiteral(value, caret)) {
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
}
