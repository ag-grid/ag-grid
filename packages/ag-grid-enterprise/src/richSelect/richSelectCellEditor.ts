import type {
    FieldPickerValueSelectedEvent,
    ICellEditorParams,
    KeyCreatorParams,
    RichCellEditorParams,
    RichSelectParams,
} from 'ag-grid-community';
import { AgAbstractCellEditor, _addGridCommonParams, _missing, _warn } from 'ag-grid-community';

import { AgRichSelect } from '../widgets/agRichSelect';

type RichSelectBuiltParams<TValue> = {
    params: RichSelectParams<TValue>;
    valuesPromise?: Promise<TValue[]>;
};

export class RichSelectCellEditor<TData = any, TValue = any, TContext = any> extends AgAbstractCellEditor {
    protected override params: RichCellEditorParams<TData, TValue>;
    private focusAfterAttached: boolean;
    protected eEditor: AgRichSelect<TValue>;
    private isAsync: boolean = false;

    constructor() {
        super({ tag: 'div', cls: 'ag-cell-edit-wrapper' });
    }

    public updateParams({ params, valuesPromise }: RichSelectBuiltParams<TValue>): void {
        const handler = (valueList: TValue[]) => {
            this.eEditor.setValueList({ valueList, refresh: true });
            const searchStringCallback = this.getSearchStringCallback(valueList);
            if (searchStringCallback) {
                this.eEditor.setSearchStringCreator(searchStringCallback);
            }
        };

        if (valuesPromise) {
            this.isAsync = true;
            valuesPromise.then(handler);
            return;
        }

        const { valueList } = params;
        if (valueList) {
            handler(valueList);
        }
    }

    public initialiseEditor(params: RichCellEditorParams<TData, TValue>): void {
        this.params = params;
        const builtParams = this.buildRichSelectParams(params);

        const richSelect = this.createManagedBean(new AgRichSelect<TValue>(builtParams.params));

        this.eEditor = richSelect;
        richSelect.addCss('ag-cell-editor');
        this.appendChild(richSelect);

        this.updateParams(builtParams);

        this.addManagedListeners(richSelect, {
            fieldPickerValueSelected: this.onEditorPickerValueSelected.bind(this),
        });
        this.focusAfterAttached = params.cellStartedEdit;
    }

    public override refreshEditor(params: RichCellEditorParams<TData, TValue, TContext>): void {
        this.params = params;
        this.updateParams(this.buildRichSelectParams(params));
    }

    private onEditorPickerValueSelected(e: FieldPickerValueSelectedEvent): void {
        // If stopEditing is missing (user provided refresh params), we provide the default implementation
        let stopEditing = this.params.stopEditing;
        if (!stopEditing) {
            const position = {
                rowNode: this.params.node,
                column: this.params.column,
            };
            stopEditing = this.beans.editSvc!.createDefaultStopEditingFn(position);
        }

        // there is an issue with focus handling when we call `stopEditing` while the
        // picker list is still collapsing, so we make this call async to guarantee that.
        setTimeout(() => stopEditing(!e.fromEnterKey));
    }

    private buildRichSelectParams(params: RichCellEditorParams<TData, TValue>): RichSelectBuiltParams<TValue> {
        const {
            cellRenderer,
            cellHeight,
            value,
            values,
            formatValue,
            searchDebounceDelay,
            valueListGap,
            valueListMaxHeight,
            valueListMaxWidth,
            allowTyping,
            filterList,
            searchType,
            highlightMatch,
            valuePlaceholder,
            eventKey,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        } = params;

        if (_missing(values)) {
            _warn(180);
        }

        const ret: RichSelectParams = {
            value: value,
            cellRenderer,
            cellRowHeight: cellHeight,
            searchDebounceDelay,
            valueFormatter: formatValue,
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'virtual-list',
            pickerGap: valueListGap,
            allowTyping,
            filterList,
            searchType,
            highlightMatch,
            maxPickerHeight: valueListMaxHeight,
            maxPickerWidth: valueListMaxWidth,
            placeholder: valuePlaceholder,
            initialInputValue: eventKey?.length === 1 ? eventKey : undefined,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        };

        let valuesResult;
        let valuesPromise;

        if (typeof values === 'function') {
            valuesResult = values(params as ICellEditorParams);
        } else {
            valuesResult = values ?? [];
        }

        if (Array.isArray(valuesResult)) {
            ret.valueList = valuesResult;
            ret.searchStringCreator = this.getSearchStringCallback(valuesResult);
        } else {
            valuesPromise = valuesResult;
        }

        if (multiSelect && allowTyping) {
            params.allowTyping = ret.allowTyping = false;
            _warn(181);
        }

        return { params: ret, valuesPromise };
    }

    private getSearchStringCallback(values: TValue[]): ((values: TValue[]) => string[]) | undefined {
        if (typeof values[0] !== 'object') {
            return;
        }

        const params = this.params;
        const { colDef, formatValue } = params;

        if (colDef.cellEditorParams?.formatValue) {
            return (values: TValue[]) => values.map(formatValue!);
        }

        const { keyCreator } = colDef;
        if (keyCreator) {
            _warn(266);
            const { column, node, data } = params;
            return (values: TValue[]) =>
                values.map((value: TValue) => {
                    const keyParams: KeyCreatorParams = _addGridCommonParams(this.gos, {
                        value,
                        colDef,
                        column,
                        node,
                        data,
                    });
                    return keyCreator(keyParams);
                });
        }

        return (values: TValue[]) => values.map(formatValue!);
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void {
        const { focusAfterAttached, params } = this;

        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }

            const richSelect = this.eEditor;
            const { allowTyping, eventKey } = params;

            if (focusAfterAttached) {
                const focusableEl = richSelect.getFocusableElement() as HTMLInputElement;
                focusableEl.focus();

                if (allowTyping && (!eventKey || eventKey.length !== 1)) {
                    focusableEl.select();
                }
            }

            richSelect.showPicker();

            if (!this.isAsync) {
                this.processEventKey(eventKey);
            }
        });
    }

    private processEventKey(eventKey: string | null) {
        if (!eventKey) {
            return;
        }

        if (eventKey?.length === 1) {
            this.eEditor.searchTextFromString(eventKey);
        }
    }

    public focusIn(): void {
        this.eEditor.getFocusableElement().focus();
    }

    public getValue(): any {
        const { params } = this;
        const value = this.eEditor.getValue();

        return params.parseValue?.(value) ?? value;
    }

    public override isPopup(): boolean {
        return false;
    }

    public getValidationElement() {
        return this.eEditor.getAriaElement() as HTMLElement;
    }

    public getValidationErrors() {
        const { params } = this;
        const { getValidationErrors } = params;

        if (!getValidationErrors) {
            return null;
        }

        return getValidationErrors({
            value: this.getValue(),
            internalErrors: null,
            cellEditorParams: params as unknown as ICellEditorParams<TData, TValue, TContext>,
        });
    }
}
