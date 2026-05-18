import type {
    AgColumn,
    CalculatedColumnDef,
    CalculatedColumnUpdate,
    ColDef,
    ColGroupDef,
    ColKey,
    ElementParams,
    GridCheckbox,
    GridInputTextArea,
    GridInputTextField,
    GridSelect,
    ICalculatedColumnsService,
    NamedBean,
} from 'ag-grid-community';
import {
    AgCheckboxSelector,
    AgInputTextAreaSelector,
    AgInputTextFieldSelector,
    AgSelectSelector,
    BeanStub,
    Component,
    KeyCode,
    RefPlaceholder,
    _getDocument,
    _setDisplayed,
} from 'ag-grid-community';

import { Dialog } from '../widgets/dialog';

type CalculatedColumnType =
    | 'text'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'date'
    | 'dateString'
    | 'dateTime'
    | 'dateTimeString'
    | 'object';

interface CalculatedColumnDraft {
    colId: string;
    headerName: string;
    cellDataType: CalculatedColumnType;
    calculatedExpression: string;
    sortable: boolean;
    filter: boolean;
}

interface ColumnSuggestion {
    type: 'column' | 'function' | 'operator';
    label: string;
    value: string;
}

const DEFAULT_DRAFT: Omit<CalculatedColumnDraft, 'colId'> = {
    headerName: 'New title',
    cellDataType: 'text',
    calculatedExpression: '',
    sortable: false,
    filter: false,
};

const CALCULATED_COLUMN_TYPES: Record<CalculatedColumnType, true> = {
    text: true,
    number: true,
    bigint: true,
    boolean: true,
    date: true,
    dateString: true,
    dateTime: true,
    dateTimeString: true,
    object: true,
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
            cls: 'ag-calculated-column-properties',
            children: [
                { tag: 'span', ref: 'ePropertiesTitle', cls: 'ag-calculated-column-properties-title' },
                { tag: 'ag-checkbox', ref: 'eSortable' },
                { tag: 'ag-checkbox', ref: 'eFilter' },
            ],
        },
    ],
};

class CalculatedColumnForm extends Component {
    private readonly eTitle: GridInputTextField = RefPlaceholder;
    private readonly eType: GridSelect<CalculatedColumnType> = RefPlaceholder;
    private readonly eExpression: GridInputTextArea = RefPlaceholder;
    private readonly eSortable: GridCheckbox = RefPlaceholder;
    private readonly eFilter: GridCheckbox = RefPlaceholder;
    private readonly eSuggestions: HTMLElement = RefPlaceholder;
    private readonly ePropertiesTitle: HTMLElement = RefPlaceholder;
    private readonly eColumns: HTMLButtonElement = RefPlaceholder;
    private readonly eFunctions: HTMLButtonElement = RefPlaceholder;
    private readonly eOperators: HTMLButtonElement = RefPlaceholder;

    private suggestions: ColumnSuggestion[] = [];
    private activeSuggestion = 0;
    private activeReplacement: { start: number; end: number } | null = null;
    private suggestionSource: HTMLElement | null = null;
    private hideSuggestionPopup: (() => void) | undefined;

    constructor(
        private draft: CalculatedColumnDraft,
        private readonly getColumnSuggestions: () => ColumnSuggestion[],
        private readonly getFunctionSuggestions: () => ColumnSuggestion[],
        private readonly onDraftChanged: (draft: CalculatedColumnDraft) => void
    ) {
        super(CalculatedColumnFormElement, [
            AgInputTextFieldSelector,
            AgSelectSelector,
            AgInputTextAreaSelector,
            AgCheckboxSelector,
        ]);
    }

    public postConstruct(): void {
        const translate = this.getLocaleTextFunc();
        this.eTitle.setLabel(translate('calculatedColumnTitle', 'Title')).setValue(this.draft.headerName, true);
        this.eType
            .setLabel(translate('calculatedColumnType', 'Type'))
            .addOptions([
                { value: 'text', text: translate('dataTypeText', 'Text') },
                { value: 'number', text: translate('dataTypeNumber', 'Number') },
                { value: 'bigint', text: translate('dataTypeBigInt', 'BigInt') },
                { value: 'boolean', text: translate('dataTypeBoolean', 'Boolean') },
                { value: 'date', text: translate('dataTypeDate', 'Date') },
                { value: 'dateString', text: translate('dataTypeDateString', 'Date String') },
                { value: 'dateTime', text: translate('dataTypeDateTime', 'Date Time') },
                {
                    value: 'dateTimeString',
                    text: translate('dataTypeDateTimeString', 'Date Time String'),
                },
                { value: 'object', text: translate('dataTypeObject', 'Object') },
            ])
            .setValue(this.draft.cellDataType, true);
        this.eExpression
            .setLabel(translate('calculatedColumnExpression', 'Expression'))
            .setInputPlaceholder(translate('calculatedColumnExpressionPlaceholder', 'Type here'))
            .setRows(3)
            .setValue(this.draft.calculatedExpression, true);
        this.eSortable.setLabel(translate('sortable', 'Sortable')).setValue(this.draft.sortable, true);
        this.eFilter.setLabel(translate('filter', 'Filter')).setValue(this.draft.filter, true);
        this.ePropertiesTitle.textContent = translate('calculatedColumnProperties', 'Properties');
        this.eColumns.textContent = translate('calculatedColumnColumns', 'Columns');
        this.eFunctions.textContent = translate('calculatedColumnFunctions', 'Functions');
        this.eOperators.textContent = translate('calculatedColumnOperators', 'Operators');
        this.eColumns.type = 'button';
        this.eFunctions.type = 'button';
        this.eOperators.type = 'button';
        this.eSuggestions.remove();
        _setDisplayed(this.eSuggestions, false);

        this.eTitle.onValueChange((value) => this.updateDraft({ headerName: value || DEFAULT_DRAFT.headerName }));
        this.eType.onValueChange((value) => this.updateDraft({ cellDataType: value ?? DEFAULT_DRAFT.cellDataType }));
        this.eExpression.onValueChange((value) => {
            this.updateDraft({ calculatedExpression: value ?? '' });
            this.refreshContextSuggestions();
        });
        this.eSortable.onValueChange((value) => this.updateDraft({ sortable: value === true }));
        this.eFilter.onValueChange((value) => this.updateDraft({ filter: value === true }));

        const input = this.eExpression.getInputElement();
        this.addManagedElementListeners(input, {
            click: () => this.refreshContextSuggestions(),
            keydown: (event: KeyboardEvent) => this.onExpressionKeyDown(event),
            keyup: (event: KeyboardEvent) => this.onExpressionKeyUp(event),
        });
        this.addManagedElementListeners(this.eColumns, {
            click: () => this.showSuggestions('column', '', null, this.eColumns),
        });
        this.addManagedElementListeners(this.eFunctions, {
            click: () => this.showSuggestions('function', '', null, this.eFunctions),
        });
        this.addManagedElementListeners(this.eOperators, {
            click: () => this.showSuggestions('operator', '', null, this.eOperators),
        });
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
        this.addDestroyFunc(() => this.closeSuggestionPopup());
    }

    private updateDraft(partial: Partial<CalculatedColumnDraft>): void {
        this.draft = { ...this.draft, ...partial };
        this.onDraftChanged(this.draft);
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
            ? suggestions.filter(({ label, value }) => `${label} ${value}`.toLocaleLowerCase().includes(searchLower))
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

        const hint = _getDocument(this.beans).createElement('div');
        hint.className = 'ag-calculated-column-suggestion ag-calculated-column-suggestion-hint';
        hint.textContent = 'Tab/Enter to accept. Esc to close';
        this.eSuggestions.appendChild(hint);
        this.openSuggestionPopup();
    }

    private hideSuggestions(): void {
        this.activeReplacement = null;
        this.suggestions = [];
        this.closeSuggestionPopup();
    }

    public closeSuggestions(): void {
        this.hideSuggestions();
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

export class CalculatedColumnsService extends BeanStub implements NamedBean, ICalculatedColumnsService {
    public readonly beanName = 'calculatedColsSvc' as const;

    public addCalculatedColumn(colDef: CalculatedColumnDef): void {
        const nextDefs = [...this.getColumnDefs(), this.toCalculatedColDef(colDef)];
        this.beans.gridApi.updateGridOptions({ columnDefs: nextDefs });
    }

    public updateCalculatedColumn(column: ColKey, colDef: CalculatedColumnUpdate): void {
        const targetColumn = this.beans.colModel.getColDefColOrCol(column);
        if (targetColumn?.colDef.calculatedExpression == null) {
            return;
        }

        const targetColId = targetColumn.getColId();
        const nextDefs = this.updateCalculatedColumnDef(this.getColumnDefs(), targetColumn, colDef);
        this.beans.gridApi.updateGridOptions({ columnDefs: nextDefs });
        this.refreshCalculatedColumn(targetColId);
    }

    public showAddCalculatedColumnDialog(column: AgColumn | null): void {
        const colId = this.createUniqueColId();
        const draft: CalculatedColumnDraft = { colId, ...DEFAULT_DRAFT };
        const nextDefs = this.insertCalculatedColumn(this.getColumnDefs(), column, this.toColDef(draft));
        this.beans.gridApi.updateGridOptions({ columnDefs: nextDefs });
        this.focusCalculatedColumn(colId);
        this.showDialog(draft);
    }

    public showUpdateCalculatedColumnDialog(column: AgColumn | null): void {
        if (column?.colDef.calculatedExpression == null) {
            return;
        }

        const draft = this.toDraft(column);
        this.focusCalculatedColumn(draft.colId);
        this.showDialog(draft);
    }

    public removeCalculatedColumn(column: AgColumn | null): void {
        if (column?.colDef.calculatedExpression == null) {
            return;
        }

        const nextDefs = this.removeCalculatedColumnDef(this.getColumnDefs(), column);
        this.beans.gridApi.updateGridOptions({ columnDefs: nextDefs });
    }

    private getColumnDefs(): (ColDef | ColGroupDef)[] {
        return [...(this.beans.colModel.getColumnDefs(true) ?? [])];
    }

    private createUniqueColId(): string {
        let index = 1;
        while (this.beans.colModel.getColById(`calculated_${index}`)) {
            index++;
        }
        return `calculated_${index}`;
    }

    private insertCalculatedColumn(
        columnDefs: (ColDef | ColGroupDef)[],
        column: AgColumn | null,
        calculatedColDef: ColDef
    ): (ColDef | ColGroupDef)[] {
        const targetColId = column?.getColId();
        if (!targetColId) {
            return [...columnDefs, calculatedColDef];
        }

        let didInsert = false;
        const insertInto = (defs: (ColDef | ColGroupDef)[]): (ColDef | ColGroupDef)[] => {
            const nextDefs: (ColDef | ColGroupDef)[] = [];
            for (const colDef of defs) {
                nextDefs.push(
                    'children' in colDef && colDef.children
                        ? { ...colDef, children: insertInto(colDef.children) }
                        : colDef
                );

                if (!('children' in colDef) && (colDef.colId ?? colDef.field) === targetColId) {
                    nextDefs.push(calculatedColDef);
                    didInsert = true;
                }
            }
            return nextDefs;
        };

        const nextDefs = insertInto(columnDefs);
        if (didInsert) {
            return nextDefs;
        }

        const index = columnDefs.findIndex(
            (colDef) => !('children' in colDef) && (colDef.colId ?? colDef.field) === targetColId
        );
        if (index < 0) {
            return [...columnDefs, calculatedColDef];
        }

        return [...columnDefs.slice(0, index + 1), calculatedColDef, ...columnDefs.slice(index + 1)];
    }

    private updateCalculatedColumnDef(
        columnDefs: (ColDef | ColGroupDef)[],
        column: AgColumn,
        colDefUpdate: CalculatedColumnUpdate
    ): (ColDef | ColGroupDef)[] {
        const targetColDef = column.getUserProvidedColDef();
        const targetColId = column.getColId();
        const safeUpdate: ColDef = { ...colDefUpdate };
        delete safeUpdate.colId;

        return columnDefs.map((colDef) => {
            if ('children' in colDef && colDef.children) {
                return { ...colDef, children: this.updateCalculatedColumnDef(colDef.children, column, colDefUpdate) };
            }

            const isTarget =
                this.isCalculatedColumnDef(colDef) &&
                (colDef === targetColDef || colDef.colId === targetColId || colDef.field === targetColId);

            if (!isTarget) {
                return colDef;
            }

            const nextColDef = { ...colDef, ...safeUpdate };
            nextColDef.calculatedExpression ??= colDef.calculatedExpression;

            return this.toCalculatedColDef(nextColDef);
        });
    }

    private showDialog(draft: CalculatedColumnDraft): void {
        const form = this.createManagedBean(
            new CalculatedColumnForm(
                draft,
                () => this.getColumnSuggestions(draft.colId),
                () => this.getFunctionSuggestions(),
                (nextDraft) => this.applyCalculatedColumnDraft(nextDraft)
            )
        );
        const dialog = this.createManagedBean(
            new Dialog({
                title: this.getLocaleTextFunc()('calculatedColumn', 'Calculated Column'),
                component: form,
                width: 300,
                height: 336,
                minWidth: 260,
                minHeight: 300,
                centered: true,
                movable: true,
                resizable: false,
                modal: false,
                cssIdentifier: 'calculated-column',
            })
        );
        const destroyDialogMouseListeners = this.addManagedElementListeners(dialog.getGui(), {
            mousedown: () => form.closeSuggestions(),
        });
        dialog.addDestroyFunc(() => destroyDialogMouseListeners.forEach((destroyFunc) => destroyFunc()));
        dialog.addEventListener('destroyed', () => this.destroyBean(form));
    }

    private applyCalculatedColumnDraft(draft: CalculatedColumnDraft): void {
        const colDef = this.toColDef(draft);
        const updateDefs = (defs: (ColDef | ColGroupDef)[]): (ColDef | ColGroupDef)[] =>
            defs.map((current) => {
                if ('children' in current && current.children) {
                    return { ...current, children: updateDefs(current.children) };
                }

                if (!this.isCalculatedColumnDef(current) || (current.colId ?? current.field) !== draft.colId) {
                    return current;
                }

                return { ...current, ...colDef };
            });
        const nextDefs = updateDefs(this.getColumnDefs());
        this.beans.gridApi.updateGridOptions({ columnDefs: nextDefs });
        this.refreshCalculatedColumn(draft.colId);
    }

    private removeCalculatedColumnDef(
        columnDefs: (ColDef | ColGroupDef)[],
        column: AgColumn
    ): (ColDef | ColGroupDef)[] {
        const targetColDef = column.getUserProvidedColDef();
        const targetColId = column.getColId();

        return columnDefs.reduce<(ColDef | ColGroupDef)[]>((nextDefs, colDef) => {
            if ('children' in colDef && colDef.children) {
                nextDefs.push({ ...colDef, children: this.removeCalculatedColumnDef(colDef.children, column) });
                return nextDefs;
            }

            const isTarget =
                this.isCalculatedColumnDef(colDef) &&
                (colDef === targetColDef || colDef.colId === targetColId || colDef.field === targetColId);

            if (!isTarget) {
                nextDefs.push(colDef);
            }

            return nextDefs;
        }, []);
    }

    private isCalculatedColumnDef(colDef: ColDef | ColGroupDef): colDef is ColDef {
        return !('children' in colDef) && colDef.calculatedExpression != null;
    }

    private toDraft(column: AgColumn): CalculatedColumnDraft {
        const colDef = column.colDef;
        const colId = column.getColId();
        const cellDataType = colDef.cellDataType;
        const displayName = this.beans.colNames.getDisplayNameForColumn(column, 'header');

        return {
            colId,
            headerName: colDef.headerName ?? displayName ?? colId,
            cellDataType:
                typeof cellDataType === 'string' && cellDataType in CALCULATED_COLUMN_TYPES
                    ? (cellDataType as CalculatedColumnType)
                    : DEFAULT_DRAFT.cellDataType,
            calculatedExpression: colDef.calculatedExpression ?? '',
            sortable: column.isSortable(),
            filter: column.isFilterAllowed(),
        };
    }

    private focusCalculatedColumn(colId: string): void {
        window.setTimeout(() => {
            const headerPosition = this.beans.headerNavigation?.getHeaderPositionForColumn(colId, false);
            if (headerPosition) {
                this.beans.focusSvc.focusHeaderPosition({ headerPosition });
            }
        }, 0);
    }

    private toColDef(draft: CalculatedColumnDraft): ColDef {
        return {
            colId: draft.colId,
            headerName: draft.headerName,
            calculatedExpression: draft.calculatedExpression,
            cellDataType: draft.cellDataType,
            sortable: draft.sortable,
            filter: draft.filter,
            editable: false,
            suppressPaste: true,
        };
    }

    private toCalculatedColDef(colDef: CalculatedColumnDef | ColDef): ColDef {
        return {
            ...colDef,
            editable: false,
            suppressPaste: true,
        };
    }

    private getColumnSuggestions(calculatedColId: string): ColumnSuggestion[] {
        return (this.beans.colModel.getCols() ?? [])
            .filter((column) => column.isVisible() && column.getColId() !== calculatedColId)
            .map((column) => ({
                type: 'column' as const,
                value: column.getColId(),
                label: this.beans.colNames.getDisplayNameForColumn(column, 'header') ?? column.getColId(),
            }));
    }

    private getFunctionSuggestions(): ColumnSuggestion[] {
        return (this.beans.formula?.getFunctionNames() ?? []).map((name) => ({
            type: 'function' as const,
            value: name,
            label: name,
        }));
    }

    private refreshCalculatedColumn(colId: string): void {
        window.setTimeout(() => {
            const column = this.beans.colModel.getColById(colId);
            if (!column) {
                return;
            }

            this.beans.rowRenderer.refreshCells({ columns: [column], force: true });
        }, 0);
    }
}
